function jxPromise(){}

/**
 * @param promisesFN an array of function that will return Promise object 
 * 
 * example: 
 * var promisesFN = [
 *      function(){ return new Promise(FnForPromise) },
 *      function(){ return new Promise(FnForPromise) },
 *      function(){ return new Promise(FnForPromise) }];
 * 
 * function FnForPromise(resolve, reject) { 
 *      resolve() 
 * }
*/
jxPromise.prototype.runPromiseInSerial = function(promisesFN) {
    return promisesFN.reduce(
        this._promiseFunctionReducer, //reducer
        Promise.resolve([])) //initial promise
};

jxPromise.prototype._promiseFunctionReducer = function(promiseChain, fn){
    return promiseChain.then(function(chainResult){
        return fn().then(function(fnResult){
            chainResult.push(fnResult)
            return chainResult
        })
    })
};

(function(global){
    if (typeof JxPromise === 'undefined') {
        global.JxPromise = jxPromise()
    }
})(window);
//# sourceURL=js/helper/jxPromise.js