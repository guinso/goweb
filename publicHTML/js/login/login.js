import { JxHelper } from '/js/helper/jxhelper.js'
import { FetchHelper } from '/js/helper/fetchHelper.js'

export class Login {

    //show login page
    static renderLoginPage() {
        //empty main-content child elements
        const mainContent = JxHelper.getMainContent()
        JxHelper.emptyElementChildren(mainContent)

        JxHelper.getSpecialLoading().innerText = 'redirecting to login page...'
        JxHelper.showSpecialLoading()

        FetchHelper.text('/js/login/partial.html')
            .then(text => {
                JxHelper.getSpecialContent().innerHTML = text

                //setup event handler
                Login.setupEventHandler()

                JxHelper.showSpecialContent()
                JxHelper.hideSpecialLoading()

                setTimeout(function() {
                    const xx = document.querySelector('.login-placeholder')
                    xx.classList.add('show-login')
                }, 100)
            })
            .catch(err => {
                console.error(err)
                JxHelper.showServerErrorMessage()
            })
    }

    static setupEventHandler() {
        //implement event handler
        const form = document.querySelector('#loginForm')

        form.addEventListener('submit', e => {
            console.log('entering login form submit handler...')

            var jsonData = {
                username: document.querySelector('#usernameCtl').value,
                pwd: document.querySelector('#pwdCtl').value
            }

            var loginMsg = document.querySelector('#loginFailMsg')
            loginMsg.classList.remove('text-danger')
            loginMsg.innerHTML ="try login..."

            console.log('start send POST request')
            FetchHelper.postJson('/api/login', jsonData)
                .then(responseJson => {
                    if (responseJson.statusCode === 0) {
                        loginMsg.innerHTML = "login success"

                        window.location = "/"; //redirect to default page
                    } else {
                        loginMsg.innerHTML = responseJson.statusMsg
                        loginMsg.classList.add('text-danger')
                    }
                })
                .catch(err => {
                    console.error(`failed to login: ${err.message}`)
                    JxHelper.showServerErrorMessage()
                })

            e.preventDefault()
        })
    }

    static logout() {
        //handle logout
        FetchHelper.postJson('/api/logout', {})
            .then(jsonData => {
                if (jsonData.statusCode === 0) {
                    //logout success
                    window.location = "#login"
                } else {
                    //logout failed
                    console.error(jsonData.statusMsg)

                    const specialError = JxHelper.getSpecialError()
                    specialError.innerHTML = 
                        `<h3>opps, failed to logout...</h3><p>${jsonData.statusMsg}</p>`
                    JxHelper.showSpecialError()
                }
            })
            .catch(err =>{
                console.error(`failed to logout: ${err.message}`)
                JxHelper.showServerErrorMessage()
            })
    }
}
//# sourceURL=login/login.js