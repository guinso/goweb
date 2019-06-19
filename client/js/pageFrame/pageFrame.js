function pageFrame() {
    this.partial = null
    this.loginName = ''
    this.placeHolder = null
}

pageFrame.prototype.render = function() {
    var thisInstance = this

    this.getPartial(
        function(partial) {
            //set login name
            partial.querySelector('#usernameHolder').innerHTML = thisInstance.loginName

            //set placeholder
            var contentPanel = partial.querySelector('.content-panel')
            if (thisInstance.placeHolder) {
                JxLoader.setElementChild(contentPanel, thisInstance.placeHolder)
            } else {
                contentPanel.innerHTML = ''
            }

            //place PageFrame into HTML body if not attached into HTML document yet
            if (!thisInstance.isAlreadyAttached()) {
                console.log('attach PageFrame into HTML document')
                JxHelper.setMainContent(partial)
            }
        },
        function(err) {
            console.error('failed to render page frame: ' + err.message)
            console.error(err.trace)
        })
};

pageFrame.prototype.getPartial = function(successFN, failureFN) {
    var thisInstance = this
    if (this.isPartialEmpty()) {
        JxLoader.loadPartial('/js/pageFrame/partial.html',
            function(partial) {
                partial.id = JxLoader.generateUUID()
                thisInstance.partial = partial

                successFN(thisInstance.partial)
            },
            failureFN)
    } else {
        successFN(this.partial)
    }
};

pageFrame.prototype.isAlreadyAttached = function() {
    if (this.isPartialEmpty()) {
        return false
    } else {
        var elements = document.getElementById(this.partial.id)

        return elements !== null
    }
};

pageFrame.prototype.setLoginName = function(loginName) {
    this.loginName = loginName
};

pageFrame.prototype.setPlaceHolder = function(element) {
    this.placeHolder = element
};

pageFrame.prototype.isPartialEmpty = function() {
    return !(this.partial && this.partial.innerHTML !== '')
};

pageFrame.prototype._setLoadingPanelVisibility = function(isVisible) {
    var panel = this.partial.querySelector('.loading-panel')
    if (isVisible) {
        panel.classList.add('visible-panel')
    } else {
        panel.classList.remove('visible-panel')
    }
};

(function() {
    if (typeof PageFrame === 'undefined') {
        window.PageFrame = new pageFrame()
    }
})()
//# sourceURL=/js/pageFrame/pageFrame.js