import {jx} from '@guinso/jx'
import * as JxHelper from './helper/jxHelper'
import {JxRouter} from './helper/JxRouter'
import {PageFrame} from './pageFrame/PageFrame'

/**
 * #URL router utility class
 * @class
 */
export class Router {
    constructor() {
        this.route = new JxRouter()
        this.pageFrame = new PageFrame()
    }

    /**
     * Resolve URL path to do specific action/page
     * @param {String} path #URL path
     */
    async resolve(path) {
        //get the keyword from the url
        if (path[0] === "#") {
            path = path.substring(1)
        }

        console.log('Router: start resolve - ' + path)

        //This function decides what type of page to show
        //depending on the current url hash value.
        try {
            let currentUser = await jx.request.getJSONPromise('/api/current-user')

            if (currentUser.statusCode === 0) {
                if (currentUser.response.id === '-') {
                    //no login, show login page
                    this.renderLogin()
                } else {
                    //update current login username
                    this.pageFrame.setLoginName(currentUser.response.username)

                    //route to actual URL
                    this.route.goto(path)
                }
            } else {
                console.log('failed to get current user info: ' + currentUser.statusMsg)
                JxHelper.showServerErrorMessage()
            }
        } catch(err) {
            console.error('failed to get current user information - ' + err.message)
            console.error(err.stack)
            JxHelper.showServerErrorMessage()
        }
    }

    initialize() {
        let thisInstance = this

        this.route.clearRoute()
    
        //setup path not found handler
        this.route.setRouteNotFound(function() {
            thisInstance.renderPageNotFound()
        })
    
        //redirect home page
        this.route.setRoute('', function() {
            location.hash = 'user'
        })
    
        this.route.setRoute('asd', () => thisInstance.renderAsd())
        this.route.setRoute('qwe', () => thisInstance.renderQwe())
        this.route.setRoute('user', () => thisInstance.renderUser())
        this.route.setRoute('note', () => thisInstance.renderNote())
        this.route.setRoute('login', () => thisInstance.renderLogin())
        this.route.setRoute('logout', () => thisInstance.renderLogout())
        this.route.setRoute('role-access', () => thisInstance.renderRoleAccess())
        this.route.setRoute('sea-map', () => thisInstance.renderSeaMap())
    };

    renderPageNotFound() {
        var placeHolder = JxHelper.getMainContent()
        placeHolder.innerHTML = "<h2>Opps, can't find the page you are looking for</h2>"
    };

    async renderLogin() {
        if (!this.login) {
            let module = await import('./login/Login')
            this.login = new module.Login(this.route)
        }

        this.login.render()
    };

    async renderLogout() {
        if (!this.login) {
            let module = await import('./login/Login')
            this.login = new module.Login(this.route)
        }

        this.login.logout()
    };

    async renderNote() {
        if (!this.note) {
            let module = await import('./note/Note')
            this.note = new module.Note()
        }

        let partial = this.note.getPartial()
        this.pageFrame.setPlaceHolder(partial)
        this.pageFrame.render()
    };

    async renderUser() {
        if(!this.user) {
            let module = await import('./user/User')
            this.user = new module.User()
        }

        let partial = await this.user.getPartial()
        this.pageFrame.setPlaceHolder(partial)
        this.pageFrame.render()
    };

    async renderRoleAccess() {
        if(!this.roleAccess) {
            let module = await import('./roleAccess/RoleAccess')
            this.roleAccess = new module.RoleAccess()
        }

        let partial = await this.roleAccess.getPartial()
        this.pageFrame.setPlaceHolder(partial)
        this.pageFrame.render()
    };

    renderQwe() {
        var ele = document.createElement('div')
        ele.innerHTML = '<a href="#asd">ASD</a><br/>' +
            '<a href="#user">User</a>'

        this.pageFrame.setPlaceHolder(ele)
        this.pageFrame.render()
    };

    renderAsd() {
        var hyperLink = document.createElement('div')

        hyperLink.innerHTML = '<a href="#qwe" class="aaa">QWE</a>'
        var aaa = hyperLink.querySelector('.aaa')
        aaa.classList.add('color')
        aaa.classList.add('green')

        this.pageFrame.setPlaceHolder(hyperLink)
        this.pageFrame.render()
    };
}