function pageFrame(){
    this.partial = null
    this.tmpDIV = document.createElement('div')
}

pageFrame.prototype.render = function() {
    this.getPartial(
        function(partial){
            JxHelper.setMainContent(partial)
        }, 
        function(err){
            console.error('failed to render page frame: ' + err.message)
            console.error(err.trace)
        })
};

pageFrame.prototype.getPartial = function(successFN, failureFN){
    var thisInstance = this
    if (this.isPartialEmpty()) {
        JxLoader.loadPartial('/js/mainContent/partial.html', 
        function(partial){
            thisInstance.tmp.innerHTML = ''
            thisInstance.tmp.appendChild(partial)
            thisInstance.partial = partial

            successFN(thisInstance.partial)
        }, 
        failureFN)
    } else {
        successFN(this.partial)
    }
};

pageFrame.prototype.setPlaceHolder = function(element, successFN, failureFN) {
    this.getPartial(
        function(mainPartial){
            var placeHolder = mainPartial.querySelector('.content-panel')
            JxLoader.setElementChild(placeHolder, element)

            if (typeof successFN !== 'undefined') {
                successFN(mainPartial)
            }
        }, 
        function(err){
            console.error('failed to set content for page frame: ' + err.message)
            console.error(err.trace)

            if (typeof failureFN !== 'undefined') {
                failureFN(err)
            }
        })
};

pageFrame.prototype.isPartialEmpty = function(){
    if (this.tmpDIV.innerHTML === '') {
        return true
    } else {
        return false
    }
};

(function(){
    if (typeof PageFrame === 'undefined' ) {
        window.PageFrame = new pageFrame()
    }
})()