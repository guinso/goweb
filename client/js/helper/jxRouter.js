function jxRouter() {
    this.route = {}
    this.preRoutePromiseFN = null
}

jxRouter.prototype.setPreRoute = function(execPromsieFN) {
    this.preRoutePromiseFN = execPromsieFN
};

jxRouter.prototype.addRoute = function(routePath, execFN) {
    this.route[routePath] = execFN
};

jxRouter.prototype.removeRoute = function(routePath) {
    if (this._isRouteDefined(routePath)) {
        delete this.route[routePath]
    }
};

jxRouter.prototype.clearRoute = function() {
    this.route = {}
};

jxRouter.prototype.goto = function(routePath) {
    if (!this._isRouteDefined(routePath)) {
        return
    } else if (this.preRoutePromiseFN) {
        this.preRoutePromiseFN()
            .then(function() {
                this.route[routePath]()
            })
            .catch(function(err) {
                console.error('failed to execute preRoute')
                console.error(err.trace)
            })
    } else {
        this.route[routePath]()
    }
};

jxRouter.prototype._isRouteDefined = function(routePath) {
    return typeof this.route[routePath] !== 'undefined'
};

(function() {
    if (typeof JxRouter === 'undefined') {
        window.JxRouter = new jxRouter()
    }
})()