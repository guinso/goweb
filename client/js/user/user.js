function user() {
    this.partial = null,
        this.tmpPartial = document.createElement('div')
}

user.prototype.getPartial = function(successFN, failureFN) {
    var thisInstance = this

    if (this.isPartialEmpty()) {
        JxLoader.loadPartial('/js/user/partial.html',
            function(partial) {
                thisInstance.partial = partial
                thisInstance.tmpPartial.innerHTML = ''
                thisInstance.tmpPartial.appendChild(thisInstance.partial)

                if (typeof successFN !== 'undefined') {
                    successFN(thisInstance.partial)
                }
            },
            function(err) {
                console.error('failed to get User partial: ' + err.message)
                console.error(err.trace)

                if (typeof failureFN !== 'undefined') {
                    failureFN(err)
                }
            })
    } else {
        if (typeof successFN !== 'undefined') {
            successFN(this.partial)
        }
    }
};

user.prototype.isPartialEmpty = function() {
    return this.tmpPartial.innerHTML === ''
};

(function() {
    if (typeof User === 'undefined') {
        window.User = new user()
    }
})()
//# sourceURL=user/user.js