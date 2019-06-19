//this module is solely handle swaping content based on URL hash value
function router() {}

router.prototype.resolve = function(path) {
    //get the keyword from the url
    if (path[0] === "#") {
        path = path.substring(1)
    }

    console.log('Router: start resolve - ' + path)

    //This function decides what type of page to show
    //depending on the current url hash value.
    var thisInstance = this

    JxLoader.getJSON('/api/current-user',
        function(currentUser) {
            if (currentUser.statusCode === 0) {
                if (currentUser.response.id === '-') {
                    //no login, show login page
                    thisInstance.renderLogin()
                } else {
                    //update current login username
                    PageFrame.setLoginName(currentUser.response.username)

                    //route to actual URL
                    JxRouter.goto(path)
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

router.prototype.initialize = function() {
    var thisInstance = this

    JxRouter.clearRoute()

    //setup path not found handler
    JxRouter.setRouteNotFound(function(){
        thisInstance.renderPageNotFound()
    })

    //redirect home page
    JxRouter.setRoute('', function(){ 
        location.hash = 'user' 
    })

    JxRouter.setRoute('asd', function(){ thisInstance.renderAsd() })
    JxRouter.setRoute('qwe', function(){ thisInstance.renderQwe() })
    JxRouter.setRoute('user', function(){ thisInstance.renderUser() })
    JxRouter.setRoute('note', function(){ thisInstance.renderNote() })
    JxRouter.setRoute('login', function(){ thisInstance.renderLogin() })
    JxRouter.setRoute('logout', function(){ thisInstance.renderLogout() })
    JxRouter.setRoute('role-access', function(){ thisInstance.renderRoleAccess() })
};

router.prototype.renderPageNotFound = function() {
    var placeHolder = JxHelper.getMainContent()
    placeHolder.innerHTML = "<h2>Opps, can't find the page you are looking for</h2>"
};

router.prototype.renderLogin = function() {
    this.getModule('/js/login/login.js', function() {
        Login.render()
    })
};

router.prototype.renderLogout = function(){
    this.getModule('/js/login/login.js', function() {
        Login.logout()
    })
};

router.prototype.renderNote = function() {
    this.getModule('/js/note/note.js', function() {
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
    })
};

router.prototype.renderUser = function() {
    this.getModule('/js/user/user.js', function() {
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
    })
};

router.prototype.renderRoleAccess = function() {
    this.getModule('/js/roleAccess/roleAccess.js', function() {
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
    })
};

router.prototype.renderQwe = function() {
    var ele = document.createElement('div')
    ele.innerHTML ='<a href="#asd">ASD</a><br/>' +
        '<a href="#user">User</a>'

    PageFrame.setPlaceHolder(ele)
    PageFrame.render()
};

router.prototype.renderAsd = function() {
    var hyperLink = document.createElement('div')

    hyperLink.innerHTML = '<a href="#qwe" class="aaa">QWE</a>'
    var aaa = hyperLink.querySelector('.aaa')
    aaa.classList.add('color')
    aaa.classList.add('green')

    PageFrame.setPlaceHolder(hyperLink)
    PageFrame.render()
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

(function() {
    if (typeof Router === 'undefined') {
        window.Router = new router()
    }
})()
//# sourceURL=router.js