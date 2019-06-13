(function(global){
    'use strict';

    function bootstrapSequence(resolve, reject) {
        //step 1: load basic libraries
        var  loadBaseLibsTask = new jxPromiseTask(false, [
            function(){ return new Promise(loadGUILibs) },
            function(){ return new Promise(loadPolyfills) },
            function(){ return new Promise(loadUtilities) }
        ])

        var bootstrapTask = new jxPromiseTask(true, [
            loadBaseLibsTask,
            //step 2: build web page
            function(){ return new Promise(buildWebPage)}
        ])

        //trigger sequences
        var promise = JxPromise.runPromise(bootstrapTask)
        promise.then(resolve, reject)
    };

    function loadGUILibs(resolve, reject) {

        JxLoader.loadMultipleFiles([
                '/libs/jquery-3.4.1.min.js',
                '/libs/popper.min.js',
                '/libs/bootstrap.min.js',
                '/css/style.css',
                '/css/bootstrap.min.css',
                '/css/bootstrap-grid.min.css',
                '/css/bootstrap-reboot.min.css'
            ],
            function(
                jquery, popper, bootstrap,
                styleCSS, bootstrapCSS, bootstrapGridCSS, boostrapRebootCSS) {

                JxLoader.addScriptTag(jquery, '/libs/jquery-3.4.1.min.js')
                JxLoader.addScriptTag(popper, '/libs/popper.min.js')
                JxLoader.addScriptTag(bootstrap, '/libs/bootstrap.min.js')
                console.log("load libs done")

                JxLoader.addStyleSheetTag(styleCSS, '/css/style.css')
                JxLoader.addStyleSheetTag(bootstrapCSS, '/css/bootstrap.min.css')
                JxLoader.addStyleSheetTag(bootstrapGridCSS, '/css/bootstrap-grid.min.css')
                JxLoader.addStyleSheetTag(boostrapRebootCSS, '/css/bootstrap-reboot.min.css')
                console.log("load stylesheets done")

                //JxLoader.addScriptTag(jxHelper, '/js/helper/jxHelper.js')

                // $('.special-loading').text('asd')
                // $('.special-loading').addClass('visible')
                resolve("a")
            },
            function(err) {
                reject(err)
            })
    };

    function loadPolyfills(resolve, reject) {
        resolve("b")
    };

    function loadUtilities(resolve, reject) {
        JxLoader.loadMultipleFiles(['/js/helper/jxHelper.js'], 
            function(jsHelperText){
                JxLoader.addScriptTag(jsHelperText, '/js/helper/jxHelper.js')
                resolve("c")
            }, 
            function(err){
                reject(err)
            })
    };

    function buildWebPage(resolve, reject) {
        //step 1: load web page

        //step 2: build routing

        //step 3: trigger route
        resolve("d")
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
        JxLoader.loadMultipleFiles(['js/helper/jxPromise.js'],
            function(jsPromiseText) {
                JxLoader.addScriptTag(jsPromiseText, 'js/helper/jxPromise.js')
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