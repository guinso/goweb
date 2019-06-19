//this module is solely handle swaping content based on URL hash value
function router() {}

router.prototype.resolve = function(url) {
    console.log('Router: start resolve - ' + url)

    //This function decides what type of page to show
    //depending on the current url hash value.
    var thisInstance = this

    JxLoader.getJSON('/api/current-user',
        function(currentUser) {
            if (currentUser.statusCode === 0) {
                if (currentUser.response.id === '-') {
                    //show login page
                    thisInstance.getModule('/js/login/login.js', function() {
                        Login.render()
                    })
                } else {
                    //update current login username
                    PageFrame.setLoginName(currentUser.response.username)

                    //route to actual URL
                    thisInstance.actualRouting(url)
                }
            } else {
                console.log('failed to get current user info: ' + currentUser.statusMsg)
                JxHelper.showServerErrorMessage()
            }
        },
        function(err) {
            console.error('failed to get current user information - ' + err.message)
            console.error(err.stack)
            JxHelper.showServerErrorMessage()
        })
};

router.prototype.actualRouting = function(url) {
    //get the keyword from the url
    if (url[0] === "#") {
        url = url.substring(1)
    }
    var paths = url.split('/')

    //TODO: render side panel menu items

    if (paths[0] === "") {
        location.hash = "user" //redirect to user page...
    } else if (paths[0] === "asd") {
        var hyperLink = document.createElement('div')

        hyperLink.innerHTML = '<a href="#qwe" class="aaa">QWE</a>'
        var aaa = hyperLink.querySelector('.aaa')
        aaa.classList.add('color')
        aaa.classList.add('green')

        PageFrame.setPlaceHolder(hyperLink)
        PageFrame.render()

    } else if (paths[0] === "qwe") {
        var ele = document.createElement('div')
        ele.innerHTML ='<a href="#asd">ASD</a><br/>' +
            '<a href="#user">User</a>'

        PageFrame.setPlaceHolder(ele)
        PageFrame.render()
    } else if (paths[0] === "user") {
        Router.getModule('/js/user/user.js', function() {
            User.getPartial(
                function(partial) {
                    PageFrame.setPlaceHolder(partial)
                    PageFrame.render()
                },
                function(err) {
                    console.error('failed to render User page: ' + err.message)
                    console.error(err.trace)
                    JxHelper.showServerErrorMessage()
                })
        });
    } else if (paths[0] === "note") {
        Router.getModule('/js/note/note.js', function() {
            Note.getPartial(
                function(partial){
                    PageFrame.setPlaceHolder(partial)
                    PageFrame.render()
                },
                function(err) {
                    console.error('failed to render Note page: ' + err.message)
                    console.error(err.trace)
                    JxHelper.showServerErrorMessage()
                }
            )
        });
    } else if (paths[0] === "login") {
        Router.getModule('/js/login/login.js', function() {
            Login.render()
        });
    } else if (paths[0] === "logout") {
        Router.getModule('/js/login/login.js', function() {
            Login.logout()
        });
    } else if (paths[0] === "role-access") {
        Router.getModule('/js/roleAccess/roleAccess.js', function() {
            RoleAccess.getPartial(
                function(partial){
                    PageFrame.setPlaceHolder(partial)
                    PageFrame.render()
                },
                function(err) {
                    console.error('failed to render Role Access page: ' + err.message)
                    console.error(err.trace)
                    JxHelper.showServerErrorMessage()
                }
            )
        });
    } else {
        Router.renderPageNotFound()
    }
};

router.prototype.renderPageNotFound = function() {
    var placeHolder = JxHelper.getMainContent()
    placeHolder.innerHTML = "<h2>Opps, can't find the page you are looking for</h2>"
};

router.prototype.getModule = function(urlVal, execFn) {
    JxLoader.require(urlVal,
        function() {
            execFn()
        },
        function(err) {
            console.error("failed to load module: " + urlVal)
            console.error(err.trace)
            JxHelper.showServerErrorMessage()
        })
};

router.prototype.strPrefixMatch = function(strCompare, prefix) {
    return strCompare.indexOf(prefix) === 0
};

(function() {
    if (typeof Router === 'undefined') {
        window.Router = new router()
    }
})()
//# sourceURL=router.js