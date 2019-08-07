import {jx} from '@guinso/jx'
import rawPartial from '!!raw-loader!./partial.html'
import * as JxHelper from '../helper/jxHelper'

export class PageFrame {
    constructor() {
        this.partial = null
        this.loginName = ''
        this.placeHolder = null
    }

    render(postRenderFN) {
        let partial = this.getPartial()

        //set login name
        partial.querySelector('#usernameHolder').innerHTML = this.loginName

        //set placeholder
        var contentPanel = partial.querySelector('.content-panel')
        if (this.placeHolder) {
            contentPanel.innerHTML = ''
            contentPanel.appendChild(this.placeHolder)
        } else {
            contentPanel.innerHTML = ''
        }

        //place PageFrame into HTML body if not attached into HTML document yet
        if (!this.isAlreadyAttached()) {
            console.log('attach PageFrame into HTML document')
            JxHelper.setMainContent(partial)
        }

        //run additional routine once it is page frame is renderered
        if (typeof postRenderFN !== 'undefined') {
            postRenderFN()
        }
    };

    getPartial() {
        if(!this.partial) {
            this.partial = JxHelper.parseHTMLString(rawPartial)
            this.partial.id = jx.makeUUID()
        }

        return this.partial
    };

    isAlreadyAttached() {
        if (this.isPartialEmpty()) {
            return false
        } else {
            var elements = document.getElementById(this.partial.id)

            return elements !== null
        }
    };

    setLoginName(loginName) {
        this.loginName = loginName
    };

    setPlaceHolder(element) {
        this.placeHolder = element
    };

    isPartialEmpty() {
        return !(this.partial && this.partial.innerHTML !== '')
    };

    _setLoadingPanelVisibility(isVisible) {
        var panel = this.partial.querySelector('.loading-panel')
        if (isVisible) {
            panel.classList.add('visible-panel')
        } else {
            panel.classList.remove('visible-panel')
        }
    };
}