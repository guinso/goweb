import {jx} from '@guinso/jx'
import * as JxHelper from '../helper/jxHelper.js'
import rawPartial from '!!raw-loader!./partial.html'

export class Login{
    /**
     * 
     * @param {helper/JxRouter} router JxRouter instance
     */
    constructor(router){
        this.router = router
    }

    //show login page
    async render() {
        try {
            let partial = JxHelper.parseHTMLString(rawPartial)

            this.setupEventHandler(partial)
            this._showLoginPage(partial)
        } catch (err) {
            console.error('failed to get login partial - ' + err.message)
            console.error(err.trace)

            JxHelper.showServerErrorMessage()
        }
    };

    _showLoginPage(partial) {
        var content = JxHelper.getMainContent()
        content.innerHTML = ""
        content.appendChild(partial)

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

    setupEventHandler(partial) {
        let thisInstance = this
        
        //implement event handler
        var form = partial.querySelector('#loginForm')

        form.addEventListener('submit', function(e) {
            
            e.preventDefault()

            var jsonData = {
                username: partial.querySelector('#usernameCtl').value,
                pwd: partial.querySelector('#pwdCtl').value
            }

            var loginMsg = partial.querySelector('#loginFailMsg')
            loginMsg.classList.remove('text-danger')
            loginMsg.innerHTML = "try login..."

            jx.request.postJSON('/api/login', jsonData, 
                responseJson => {
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
                            thisInstance.router.goto(path) //back to previous page
                        }
                    } else {
                        loginMsg.innerHTML = responseJson.statusMsg
                        loginMsg.classList.add('text-danger')
                    }
                }, 
                err => {
                    console.error('failed to login: ' + err.message)
                    JxHelper.showServerErrorMessage()
                })
        })
    };

    async logout() {
        //handle logout
        try {
            let jsonData = await jx.request.postJSONPromise('/api/logout')
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
        } catch(err) {
            console.error('failed to logout: ' + err.message)
            JxHelper.showServerErrorMessage()
        }
    };
}