function jxUtil(){}

/**
 * Require jxLoader.js
 */
jxUtil.prototype.makeLoadFilePromise = function(fileURL, successFN, failFN) {
    return function(){
        return new Promise(function(resolve, reject){
            JxLoader.loadFile(fileURL, 
                function(text){
                    if (typeof successFN !== 'undefined') {
                        successFN(text)
                    }
                    resolve(text)
                },
                function(err){
                    if (typeof failFN !== 'undefiend') {
                        failFN(err)
                    }
                    reject(err)
                })
        })
    }
};

/**
 * Require jxLoader.js
 */
jxUtil.prototype.makeRequireFilePromise = function(fileURL, successFN, failFN) {
    return function(){
        return new Promise(function(resolve, reject){
            JxLoader.require(fileURL, 
                function(x){
                    if (typeof successFN !== 'undefined') {
                        successFN(x)
                    }
                    resolve(x)
                }, 
                function(err){
                    if (typeof failFN !== 'undefined') {
                        failFN(err)
                    }
                    reject(err)
                })
        })
    }
};

(function(){
    if (typeof JxUtil === 'undefined') {
        window.JxUtil = new jxUtil()
    }
})()
//# sourceURL=js/helper/jxUtil.js