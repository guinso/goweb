function pageFrame() {
    this.partial = null
    this.tmpDIV = document.createElement('div')
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
            JxLoader.setElementChild(contentPanel, thisInstance.placeHolder)

            JxHelper.setMainContent(partial)
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
                thisInstance.tmpDIV.innerHTML = ''
                thisInstance.tmpDIV.appendChild(partial)
                thisInstance.partial = partial

                successFN(thisInstance.partial)
            },
            failureFN)
    } else {
        successFN(this.partial)
    }
};

pageFrame.prototype.setLoginName = function(loginName) {
    this.loginName = loginName
};

pageFrame.prototype.setPlaceHolder = function(element) {
    this.placeHolder = element
        // this.getPartial(
        //     function(mainPartial) {
        //         var placeHolder = mainPartial.querySelector('.content-panel')
        //         JxLoader.setElementChild(placeHolder, element)

    //         if (typeof successFN !== 'undefined') {
    //             successFN(mainPartial)
    //         }
    //     },
    //     function(err) {
    //         console.error('failed to set content for page frame: ' + err.message)
    //         console.error(err.trace)

    //         if (typeof failureFN !== 'undefined') {
    //             failureFN(err)
    //         }
    //     })
};

pageFrame.prototype.isPartialEmpty = function() {
    if (this.tmpDIV.innerHTML === '') {
        return true
    } else {
        return false
    }
};

(function() {
    if (typeof PageFrame === 'undefined') {
        window.PageFrame = new pageFrame()
    }
})()
//# sourceURL=/js/pageFrame/pageFrame.js