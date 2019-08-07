/**
 * URL# router class
 * @class
 */
export class JxRouter {
    constructor() {
        this.route = {}
        this.notFoundRouteFN = null
    }
    
    /**
     * Set handler when unable to find route path
     * @param {Function():void} notFoundFN handler when route not found
     */
    setRouteNotFound(notFoundFN) {
        this.notFoundRouteFN = notFoundFN
    }

    /**
     * Set route definition and its respective handler
     * @param {String} routePath route path show in URL#
     * @param {Function():void} execFN handler when the URL path is triggered
     */
    setRoute(routePath, execFN) {
        this.route[routePath] = execFN
    };

    /**
     * Remove defined route path
     * @param {String} routePath URL# path
     */
    removeRoute(routePath) {
        if (this._isRouteDefined(routePath)) {
            delete this.route[routePath]
        }
    };

    /**
     * Clear all defined route path(s)
     */
    clearRoute() {
        this.route = {}
    };

    /**
     * Execute handler by specified URL# path
     * @param {String} routePath URL# path
     */
    goto(routePath) {
        if (!this._isRouteDefined(routePath)) {
            console.warn('route <' + routePath + '> not found!')
            if (this.notFoundRouteFN) {
                this.notFoundRouteFN(routePath)
            }
        } else {
            this.route[routePath]()
        }
    };

    /**
     * Check URL# path is defined or not
     * @param {String} routePath URL# path
     * @returns {Boolean}
     */
    _isRouteDefined(routePath) {
        if(this.route[routePath]) {
            return true
        } else {
            return false
        }
    }
}

//SOURCE: https://stackoverflow.com/questions/21117160/what-is-export-default-in-javascript