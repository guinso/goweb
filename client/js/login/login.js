function login() {}

//show login page
login.prototype.renderLoginPage = function() {
    var thisInstance = this

    //empty main-content child elements
    var mainContent = JxHelper.getMainContent()
    JxHelper.emptyElementChildren(mainContent)

    JxHelper.getSpecialLoading().innerText = 'redirecting to login page...'
    JxHelper.showSpecialLoading()

    JxLoader.loadFile('/js/login/partial.html',
        function(text) {
            JxHelper.getSpecialContent().innerHTML = text

            //setup event handler
            thisInstance.setupEventHandler()

            JxHelper.showSpecialContent()
            JxHelper.hideSpecialLoading()

            setTimeout(function() {
                var xx = document.querySelector('.login-placeholder')
                xx.classList.add('show-login')
            }, 100)
        },
        function(err) {
            console.error(err)
            JxHelper.showServerErrorMessage()
        })
};

login.prototype.setupEventHandler = function() {
    //implement event handler
    var form = document.querySelector('#loginForm')

    form.addEventListener('submit', function(e) {
        console.log('entering login form submit handler...')
        e.preventDefault()

        var jsonData = {
            username: document.querySelector('#usernameCtl').value,
            pwd: document.querySelector('#pwdCtl').value
        }

        var loginMsg = document.querySelector('#loginFailMsg')
        loginMsg.classList.remove('text-danger')
        loginMsg.innerHTML = "try login..."

        console.log('start send POST request')
        JxLoader.postJSON('/api/login', jsonData,
            function(responseJson) {
                if (responseJson.statusCode === 0) {
                    loginMsg.innerHTML = "login success"

                    window.location = "/"; //redirect to default page
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
                window.location = "#login"
            } else {
                //logout failed
                console.error(jsonData.statusMsg)

                var specialError = JxHelper.getSpecialError()
                specialError.innerHTML =
                    '<h3>opps, failed to logout...</h3><p>' + jsonData.statusMsg + '</p>'
                JxHelper.showSpecialError()
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