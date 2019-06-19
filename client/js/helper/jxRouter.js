function jxRouter() {
    this.route = {}
    this.notFoundRouteFN = null
}

jxRouter.prototype.setRouteNotFound = function(notFoundFN) {
    this.notFoundRouteFN = notFoundFN
}

jxRouter.prototype.setRoute = function(routePath, execFN) {
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
        console.warn('route <' + routePath + '> not found!')
        if (this.notFoundRouteFN) {
            this.notFoundRouteFN(routePath)
        }
    } else {
        this.route[routePath]()
    }
};

jxRouter.prototype._isRouteDefined = function(routePath) {
    if(this.route[routePath]) {
        return true
    } else {
        return false
    }
};

(function() {
    if (typeof JxRouter === 'undefined') {
        window.JxRouter = new jxRouter()
    }
})()