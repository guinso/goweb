(function(global){
    'use strict';

    function bootstrapSequence(resolve, reject) {
        // var bootSequence = [loadGUILibs, loadPolyfills, buildWebPage]

        // var ss = [
        //     function(){ return new Promise(function(s,r){ 
        //         console.log("s1")
        //         JxLoader.loadFile('/js/login/login.js', function(text){ s(text) }, function(err){ r(err) })
        //     })},
        //     function(){ return new Promise(function(s,r){ 
        //         console.log("s2")
        //         JxLoader.loadFile('/js/note/note.js', function(text){ s(text) }, function(err){ r(err) })
        //     })},
        //     function(){ return new Promise(function(s,r){ 
        //         console.log("s3")
        //         JxLoader.loadFile('/js/user/user.js', function(text){ s(text) }, function(err){ r(err) })
        //     })}
        // ]

        // console.log('begin serial promises')
        // var ssPromise = JxLoader.runPromiseInSerial(ss)
        // ssPromise.then(
        //     function(result){
        //         console.log(result)
        //         console.log('done serial promises')
        //     },
        //     function(err){
        //         console.log('error encounter in serial promises: ' + err.message)
        //     }
        // )

        //step 1: load base dependecies
        var guiLibs = new Promise(loadGUILibs)
        var polyfills = new Promise(loadPolyfills)
        var utilities = new Promise(loadUtilities)

        Promise.all([guiLibs, polyfills, utilities])
            .then(function(){
                //step 2: build web page
                var buildPagePromise = new Promise(buildWebPage)
                buildPagePromise
                    .then(function(){ resolve()})
                    .catch(function(err){reject(err)})
            })
            .catch(function(err){
                reject(err)
            })
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
                styleCSS, bootstrapCSS, bootstrapGridCSS, boostrapRebootCSS,
                jxHelper) {

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
                resolve()
            },
            function(err) {
                reject(err)
            })
    };

    function loadPolyfills(resolve, reject) {
        resolve()
    };

    function loadUtilities(resolve, reject) {
        JxLoader.loadMultipleFiles(['/js/helper/jxPromise.js', '/js/helper/jxHelper.js'], 
            function(jxPromiseText, jsHelperText){
                JxLoader.addScriptTag(jxPromiseText, '/js/helper/jxPromise.js')
                JxLoader.addScriptTag(jsHelperText, '/js/helper/jxHelper.js')
                resolve()
            }, 
            function(err){
                reject(err)
            })
    };

    function buildWebPage(resolve, reject) {
        //step 1: load web page

        //step 2: build routing

        //step 3: trigger route
        resolve()
    };

    if (typeof Promise == 'undefined') {
        //need to load Bluebird
        JxLoader.require('libs/bluebird-3.5.5.min.js',
            function() {
                console.log("load Promise polyfill successfully")

                var promise = new Promise(bootstrapSequence)
                promise
                    .then(function(){console.log('done!')})
                    .catch(function(err){ console.log('failed! - ' + err.message)})
            },
            function(err) {
                console.error('failed to load Promise polyfill: ' + err.message)
            })
    } else {
        var promise = new Promise(bootstrapSequence)
        promise
            .then(function(){console.log('done!')})
            .catch(function(err){ console.log('failed! - ' + err.message)})
    }

})(this);