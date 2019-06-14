//this module is solely handle swaping content based on URL hash value
function router() {}

router.prototype.resolve = function(url) {
    //This function decides what type of page to show
    //depending on the current url hash value.
    var thisInstance = this

    JxLoader.getJSON('/api/current-user', 
        function(currentUser){
            if (currentUser.statusCode === 0) {
                if (currentUser.response.id === '-') {
                    //show login page
                    thisInstance.getModule('/js/login/login.js', function() {
                        Login.renderLoginPage()
                    })
                } else {
                    //update current login username
                    document.querySelector('#usernameHolder').innerHTML = 
                        currentUser.response.username //TODO: get full name
        
                    //route to actual URL
                    thisInstance.actualRouting(url)
                }
            } else {
                console.log('failed to get current user info: ' + currentUser.statusMsg)
                JxHelper.showServerErrorMessage()
            }
        }, 
        function(err){
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

    //hide whatever page is currently shown
    JxHelper.hideAllContent()

    //TODO: render side panel menu items

    var mainContent = JxHelper.getContentPanel()

    if (paths[0] === "") {
        location.href = "#user" //redirect to user page...
    } else if (paths[0] === "asd") {

        mainContent.innerHTML = '<a href="#qwe" class="aaa">QWE</a>'
        var aaa = mainContent.querySelector('.aaa')
        aaa.classList.add('color')
        aaa.classList.add('green')

        JxHelper.showMainContent()

    } else if (paths[0] === "qwe") {

        mainContent.innerHTML =
            '<a href="#asd">ASD</a><br/>' +
            '<a href="#user">User</a>'

        JxHelper.showMainContent()
    } else if (paths[0] === "user") {
        Router.getModule('/js/user/user.js', function() {
            User.renderPage()
        });
    } else if (paths[0] === "note") {
        Router.getModule('/js/note/note.js', function() {
            Note.renderPage()
        });
    } else if (paths[0] === "login") {
        Router.getModule('/js/login/login.js', function() {
            Login.renderLoginPage()
        });
    } else if (paths[0] === "logout") {
        Router.getModule('/js/login/login.js', function() {
            Login.logout()
        });
    } else if (paths[0] === "role-access") {
        Router.getModule('/js/roleAccess/roleAccess.js', function() {
            RoleAccess.renderPage()
        });
    } else {
        Router.renderPageNotFound()
    }
};

router.prototype.renderPageNotFound = function() {
    var placeHolder = JxHelper.getSpecialError()
    placeHolder.innerHTML = "<h2>Opps, can't find the page you are looking for</h2>"

    JxHelper.showSpecialLoading()
};

router.prototype.getModule = function(urlVal, execFn) {
    JxHelper.showSpecialLoading()

    JxLoader.require(urlVal, 
        function(){
            execFn()
            JxHelper.hideSpecialLoading()
        }, 
        function(err){
            console.error("failed to load module: " + urlVal)
            console.error(err.trace)
            JxHelper.showServerErrorMessage()
        })
};

router.prototype.strPrefixMatch = function(strCompare, prefix) {
    return strCompare.indexOf(prefix) === 0
};

(function(){
    if (typeof Router === 'undefined') {
        window.Router = new router()
    }
})()
//# sourceURL=router.js