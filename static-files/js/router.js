import { JxHelper } from '/js/jxhelper.js'
import { Login } from '/js/login/login.js'

//this module is solely handle swaping content based on URL hash value
export class Router {
    static resolve(url) {
        //This function decides what type of page to show
        //depending on the current url hash value.

        //check current login ID
        $.get('api/current-user')
            .done(function(response) {
                let data = JSON.parse(response);
                if (data.statusCode === 0) {
                    if (data.response.id === "-") {
                        //show login page
                        Router.getModule('/js/login/login.js', function(module) {
                            module.Login.renderPage()
                        })
                    } else {
                        document.getElementById('usernameHolder').innerHTML = data.response.username //TODO: get full name
                        
                        Router.actualRouting(url);
                    }
                } else {
                    //show login page
                    // Router.getModule('js/login/login.js', function(login) {
                    //     login.renderPage();
                    // });
                    Login.renderPage()
                }
            })
            .fail(function() {
                JxHelper.showServerErrorMessage();
            });
    }

    static actualRouting(url) {
        //get the keyword from the url
        if (url[0] === "#") {
            url = url.substring(1);
        }
        const paths = url.split('/');

        //hide whatever page is currently shown
        JxHelper.hideAllContent();

        //TODO: render side panel menu items

        const mainContent = JxHelper.getContentPanel();

        if (paths[0] === "") {
            location.href = "#user"; //redirect to user page...
        } else if (paths[0] === "asd") {

            mainContent.innerHTML ='<a href="#qwe" class="aaa">QWE</a>';
            const aaa = mainContent.querySelector('.aaa')
            aaa.classList.add('color')
            aaa.classList.add('green')

            JxHelper.showMainContent();

        } else if (paths[0] === "qwe") {

            mainContent.innerHTML = 
                '<a href="#asd">ASD</a><br/>' +
                '<a href="#user">User</a>';

            JxHelper.showMainContent();
        } else if (paths[0] === "user") {
            Router.getModule('/js/user/user.js', function(module) {
                module.User.renderPage();
            });
        } else if (paths[0] === "note") {
            Router.getModule('/js/note/note.js', function(module) {
                module.Note.renderPage()
            });
        } else if (paths[0] === "login") {
            Router.getModule('/js/login/login.js', function(module) {
                module.Login.renderPage();
            });
        } else if (paths[0] === "logout") {
            Router.getModule('/js/login/login.js', function(module) {
                module.Login.logout();
            });
        } else if (paths[0] === "role-access") {
            Router.getModule('/js/roleAccess/roleAccess.js', function(module) {
                module.Role.renderPage();
            });
        } else {
            Router.renderPageNotFound();
        }
    }

    static renderPageNotFound() {
        const placeHolder = JxHelper.getSpecialError()
        placeHolder.innerHTML = "<h2>Opps, can't find the page you are looking for</h2>"
        placeHolder.classList.add('visible');
    }

    static getModule(urlVal, execFn) {
        JxHelper.showSpecialLoading()

        import(urlVal)
        .then(module => {
            JxHelper.hideSpecialLoading()

            execFn(module)
        })
        .catch(err => {
            console.error("failed to load module: " + urlVal)
            console.error(err)
            JxHelper.showServerErrorMessage()
        })
    }

    static strPrefixMatch(strCompare, prefix) {
        return strCompare.indexOf(prefix) === 0;
    }
}
//# sourceURL=router.js