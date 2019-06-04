import { JxHelper } from '/js/helper/jxHelper.js'
import { FetchHelper } from '/js/helper/fetchHelper.js'

//this module is solely handle swaping content based on URL hash value
export class Router {
    static async resolve(url) {
        //This function decides what type of page to show
        //depending on the current url hash value.

        const currentUser = await FetchHelper.json('/api/current-user')

        if (currentUser.statusCode === 0) {
            if (currentUser.response.id === '-') {
                //show login page
                Router.getModule('/js/login/login.js', function(module) {
                    module.Login.renderLoginPage()
                })
            } else {
                //update current login username
                document.querySelector('#usernameHolder').innerHTML = 
                    currentUser.response.username //TODO: get full name

                //route to actual URL
                Router.actualRouting(url)
            }
        } else {
            console.log(`failed to get current user info: ${currentUser.statusMsg}`)
            JxHelper.showServerErrorMessage()
        }
    }

    static actualRouting(url) {
        //get the keyword from the url
        if (url[0] === "#") {
            url = url.substring(1)
        }
        const paths = url.split('/')

        //hide whatever page is currently shown
        JxHelper.hideAllContent()

        //TODO: render side panel menu items

        const mainContent = JxHelper.getContentPanel()

        if (paths[0] === "") {
            location.href = "#user" //redirect to user page...
        } else if (paths[0] === "asd") {

            mainContent.innerHTML = '<a href="#qwe" class="aaa">QWE</a>'
            const aaa = mainContent.querySelector('.aaa')
            aaa.classList.add('color')
            aaa.classList.add('green')

            JxHelper.showMainContent()

        } else if (paths[0] === "qwe") {

            mainContent.innerHTML =
                '<a href="#asd">ASD</a><br/>' +
                '<a href="#user">User</a>'

            JxHelper.showMainContent()
        } else if (paths[0] === "user") {
            Router.getModule('/js/user/user.js', function(module) {
                module.User.renderPage()
            });
        } else if (paths[0] === "note") {
            Router.getModule('/js/note/note.js', function(module) {
                module.Note.renderPage()
            });
        } else if (paths[0] === "login") {
            Router.getModule('/js/login/login.js', function(module) {
                module.Login.renderLoginPage()
            });
        } else if (paths[0] === "logout") {
            Router.getModule('/js/login/login.js', function(module) {
                module.Login.logout()
            });
        } else if (paths[0] === "role-access") {
            Router.getModule('/js/roleAccess/roleAccess.js', function(module) {
                module.RoleAccess.renderPage()
            });
        } else {
            Router.renderPageNotFound()
        }
    }

    static renderPageNotFound() {
        const placeHolder = JxHelper.getSpecialError()
        placeHolder.innerHTML = "<h2>Opps, can't find the page you are looking for</h2>"

        JxHelper.showSpecialLoading()
    }

    static getModule(urlVal, execFn) {
        JxHelper.showSpecialLoading()

        import (urlVal).then(module => {
                execFn(module)
                JxHelper.hideSpecialLoading()
            })
            .catch(err => {
                console.error("failed to load module: " + urlVal)
                console.error(err)
                JxHelper.showServerErrorMessage()
            })
    }

    static strPrefixMatch(strCompare, prefix) {
        return strCompare.indexOf(prefix) === 0
    }
}
//# sourceURL=router.js