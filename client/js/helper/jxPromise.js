function jxPromiseTask(isSerial, tasks) {
    if (typeof isSerial === 'undefined') {
        isSerial = false //default value is parallel task
    }

    this.isSerial = isSerial
    this.tasks = tasks
}

function jxPromise(){}

jxPromise.prototype.runPromise = function(promiseTask) {
    if (promiseTask.isSerial === true) { //run in serial
        return promiseTask.tasks.reduce(this._serialTaskReducer, Promise.resolve([]))
    } else if (promiseTask.isSerial === false) { //run in parallel
        return jxPromise.prototype._parallelTaskReducer.call(this, promiseTask.tasks)
    } else {
        return Promise.reject(new Error(
            'unknown promiseTask.isSerial value - ' + promiseTask.isSerial))
    }
};

jxPromise.prototype._parallelTaskReducer = function(tasks) {
    var promises = []

    for (var i=0; i < tasks.length; i++) {
        var fn = tasks[i]

        if (typeof fn === 'function') {
            promises.push(fn())
        } else if (typeof fn === 'object' && fn instanceof jxPromiseTask) {
            promises.push(this.runPromise.call(fn))
        } else {
            return Promise.reject(new Error(
                "fn is not valid task type ('function' or 'jxPromiseTask') - " + typeof fn))
        }
    }

    return Promise.all(promises)
};

jxPromise.prototype._serialTaskReducer = function(promiseChain, fn){
    if (typeof fn === 'function') {
        return promiseChain.then(function(chainResult){
            return fn().then(function(fnResult){
                chainResult.push(fnResult)
                return chainResult
            })
        })
    } else if (typeof fn === 'object' && fn instanceof jxPromiseTask) {
        return jxPromise.prototype.runPromise.call(this, fn)
    } else {
        return Promise.reject(new Error(
            "fn is not valid task type ('function' or 'jxPromiseTask') - " + typeof fn))
    }
};

(function(){
    if (typeof JxPromise === 'undefined') {
        window.JxPromise = new jxPromise()
    }
})();
//# sourceURL=js/helper/jxPromise.js