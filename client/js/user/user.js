function user() {
    this.partial = null
}

user.prototype.getPartial = function(successFN, failureFN) {
    //var thisInstance = this

    this._fetchPartial(
        function(partial){
            successFN(partial)
        }, 
        failureFN)
};

user.prototype._fetchPartial = function(successFN, failureFN) {
    var thisInstance = this

    if (this._isPartialEmpty()) {
        JxLoader.loadPartial('/js/user/partial.html', 
        function(partial){
            thisInstance.partial = partial
            successFN(partial)
        }, 
        failureFN)
    } else {
        successFN(this.partial)
    }
}

user.prototype._isPartialEmpty = function() {
    return !(this.partial && this.partial.innerHTML !== '')
};

(function() {
    if (typeof User === 'undefined') {
        window.User = new user()
    }
})()
//# sourceURL=user/user.js