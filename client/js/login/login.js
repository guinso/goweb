function login() {}

//show login page
login.prototype.render = function() {
    var thisInstance = this

    JxLoader.loadPartial('/js/login/partial.html',
        function(partial) {
            thisInstance.setupEventHandler(partial)
            thisInstance._showLoginPage(partial)
        },
        function(err) {
            console.error('failed to get login partial - ' + err.message)
            console.error(err.trace)

            JxHelper.showServerErrorMessage()
        })
};

login.prototype._showLoginPage = function(partial) {
    var content = JxHelper.getMainContent()
    JxLoader.setElementChild(content, partial)

    //TODO: clear login form
    partial.querySelector('#usernameCtl').value = ''
    partial.querySelector('#pwdCtl').value = ''

    var loginMsg = partial.querySelector('#loginFailMsg')
    loginMsg.classList.remove('text-danger')
    loginMsg.innerHTML = "please fill in username and pasword"

    setTimeout(function() {
        var xx = document.querySelector('.login-placeholder')
        xx.classList.add('show-login')
    }, 100)
};

login.prototype.setupEventHandler = function(partial) {
    //implement event handler
    //var form = document.querySelector('#loginForm')
    var form = partial.querySelector('#loginForm')

    form.addEventListener('submit', function(e) {
        //console.log('entering login form submit handler...')
        e.preventDefault()

        var jsonData = {
            username: partial.querySelector('#usernameCtl').value,
            pwd: partial.querySelector('#pwdCtl').value
        }

        var loginMsg = partial.querySelector('#loginFailMsg')
        loginMsg.classList.remove('text-danger')
        loginMsg.innerHTML = "try login..."

        //console.log('start send POST request')
        JxLoader.postJSON('/api/login', jsonData,
            function(responseJson) {
                if (responseJson.statusCode === 0) {
                    loginMsg.innerHTML = "login success"

                    JxHelper.getMainContent().innerHTML =
                        'login success, navigating to ' + decodeURI(location.hash) + '...'

                    //extract path from URL hash value
                    var path = decodeURI(location.hash)
                    if (path[0] === "#") {
                        path = path.substring(1)
                    }

                    if (path === 'login') {
                        console.log('login: redirect to default page')
                        location.hash = '' //redirect to default page
                    } else {
                        console.log('login: back to previous page')
                        JxRouter.goto(path) //back to previous page
                    }
                } else {
                    loginMsg.innerHTML = responseJson.statusMsg
                    loginMsg.classList.add('text-danger')
                }
            },
            function(err) {
                console.error('failed to login: ' + err.message)
                JxHelper.showServerErrorMessage()
            })
    })
};

login.prototype.logout = function() {
    //handle logout
    JxLoader.postJSON('/api/logout', {},
        function(jsonData) {
            if (jsonData.statusCode === 0) {
                //logout success
                location.hash = 'login'
            } else {
                //logout failed
                console.error(jsonData.statusMsg)

                var specialError = JxHelper.getMainContent()
                specialError.innerHTML =
                    '<h3>opps, failed to logout...</h3><p>' + jsonData.statusMsg + '</p>'
            }
        },
        function(err) {
            console.error('failed to logout: ' + err.message)
            JxHelper.showServerErrorMessage()
        })
};

(function() {
    if (typeof Login === 'undefined') {
        window.Login = new login()
    }
})()
//# sourceURL=login/login.js