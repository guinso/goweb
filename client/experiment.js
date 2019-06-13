(function(global){
    'use strict';

    function bootstrapSequence(resolve, reject) {
        
        var  loadBaseLibsTask = new jxPromiseTask(false, [
            function(){ return new Promise(loadGUILibs) },
            function(){ return new Promise(loadPolyfills) },
            function(){ return new Promise(loadUtilities) }
        ])

        var bootstrapTask = new jxPromiseTask(true, [
            loadBaseLibsTask,                               //step 1: load basic libraries
            function(){ return new Promise(buildWebPage)}   //step 2: build web page
        ])

        //trigger sequences
        JxPromise.runPromise(bootstrapTask).then(resolve, reject)
    };

    function loadGUILibs(resolve, reject) {
        JxLoader.loadAndTagMultipleFiles([
                '/libs/jquery-3.4.1.min.js',
                '/libs/popper.min.js',
                '/libs/bootstrap.min.js',
                '/css/style.css',
                '/css/bootstrap.min.css',
                '/css/bootstrap-grid.min.css',
                '/css/bootstrap-reboot.min.css'], 
                resolve, reject)
    };

    function loadPolyfills(resolve, reject) {
        if (typeof fetch === 'undefined') {
            JxLoader.loadAndTagFile('/libs/fetch-3.0.0.umd.js', 
                resolve, reject)
        } else {
            resolve("b2")
        }
    };

    function loadUtilities(resolve, reject) {
        JxLoader.loadMultipleFiles([
            '/js/helper/jxHelper.js', '/js/helper/jxUtil.js'], 
            function(jsHelperText, jxUtilText){
                JxLoader.addScriptTag(jsHelperText, '/js/helper/jxHelper.js')
                JxLoader.addScriptTag(jxUtilText, '/js/helper/jxUtil.js')

                resolve("c")
            }, 
            function(err){
                reject(err)
            })
    };

    function buildWebPage(resolve, reject) {
        //step 1: load web page layout
        var loadHomePageTask = JxUtil.makeLoadFilePromise(
            '/js/mainContent/partial.html', 
            function(text){
                JxHelper.getMainContent().innerHTML = text
            })

        //step 2: load router handler
        var loadRouterTask = JxUtil.makeRequireFilePromise(
            '/js/router.js', 
            function(){
                //step 2.1. listen URL hash(#) change and swap content accordingly
                window.onhashchange = function() {
                    try {
                        Router.resolve(decodeURI(window.location.hash))
                    } catch (err) {
                        JxHelper.showServerErrorMessage();
                    }
                }
            })

        var startRouterTask = function(){ return new Promise(
            function(resolve, reject){
                //3. start resolve path
                Router.resolve(decodeURI(window.location.hash))

                resolve()
            })}

        var task = new jxPromiseTask(true, [
            new jxPromiseTask(false, [
                loadHomePageTask,
                loadRouterTask
            ]),
            startRouterTask
        ])

        JxPromise.runPromise(task).then(resolve, reject)
    };

    if (typeof Promise == 'undefined') {
        //need to load Bluebird
        JxLoader.loadMultipleFiles(['libs/bluebird-3.5.5.min.js', 'js/helper/jxPromise.js'],
            function(blueBirdText, jsPromiseText) {
                JxLoader.addScriptTag(blueBirdText, 'libs/bluebird-3.5.5.min.js')
                JxLoader.addScriptTag(jsPromiseText, 'js/helper/jxPromise.js')
                console.log("successfully loaded Promise polyfill ")
                console.log("successfully loaded jxPromise ")

                var promise = new Promise(bootstrapSequence)
                promise
                    .then(function(){console.log('done!')})
                    .catch(function(err){ 
                        console.error('failed to run bootstrap sequence: ' + err.message)
                        console.error(err.stack) 
                    })
            },
            function(err) {
                console.error('failed to load Promise polyfill: ' + err.message)
                console.error(err.stack)
            })
    } else {
        JxLoader.loadAndTagFile('js/helper/jxPromise.js',
            function() {
                console.log("successfully loaded jxPromise ")

                var promise = new Promise(bootstrapSequence)
                promise
                    .then(function(result){
                        console.log('done!')
                        console.log(result)
                    })
                    .catch(function(err){ 
                        console.error('failed to run bootstrap sequence: ' + err.message)
                        console.error(err.stack) 
                    })
            },
            function(err) {
                console.error('failed to load Promise polyfill: ' + err.message)
                console.error(err.stack)
            })
    }
})(this);