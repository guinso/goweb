(function(global) {
    'use strict';

    function bootstrapSequence(resolve, reject) {

        var loadBaseLibsTask = new jxPromiseTask(false, [
            function() { return new Promise(loadGUILibs) },
            function() { return new Promise(loadPolyfills) },
            function() { return new Promise(loadUtilities) }
        ])

        var bootstrapTask = new jxPromiseTask(true, [
            loadBaseLibsTask, //step 1: load basic libraries
            function() { return new Promise(buildWebPage) } //step 2: build web page
        ])

        //trigger sequences
        JxPromise.runPromise(bootstrapTask).then(resolve, reject)
    };

    function loadGUILibs(resolve, reject) {
        JxLoader.loadAndTagMultipleFiles([
                '/libs/jquery-3.4.1.min.js',
                '/libs/popper.min.js',
                '/libs/bootstrap.min.js',
                '/css/bootstrap.min.css',
                '/css/bootstrap-grid.min.css',
                '/css/bootstrap-reboot.min.css'
            ],
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
        JxLoader.loadAndTagMultipleFiles([
                '/js/helper/jxHelper.js',
                '/js/helper/jxRouter.js'
            ],
            resolve, reject)
    };

    function buildWebPage(resolve, reject) {
        //step 1: load web page layout
        var loadHomePageTask = JxLoader.loadFilePromiseFN(
            '/js/mainContent/partial.html',
            function(text) {
                JxHelper.getMainContent().innerHTML = text
            })

        //step 2: load router handler
        var loadRouterTask = JxLoader.requirePromiseFN(
            '/js/router.js',
            function() {
                //step 2.1. listen URL hash(#) change and swap content accordingly
                window.addEventListener('hashchange',
                    function() {
                        try {
                            Router.resolve(decodeURI(window.location.hash))
                        } catch (err) {
                            JxHelper.showServerErrorMessage();
                        }
                    }, false)
            })

        //step 3. start resolve URL hash path
        var startRouterTask = function() {
            return new Promise(
                function(resolve, reject) {
                    try {
                        Router.resolve(decodeURI(window.location.hash))
                        resolve()
                    } catch (err) {
                        reject(err)
                    }
                })
        }

        var task = new jxPromiseTask(true, [
            new jxPromiseTask(false, [
                loadHomePageTask,
                loadRouterTask
            ]),
            startRouterTask
        ])

        JxPromise.runPromise(task).then(resolve, reject)

        //loadHomePageTask().then(resolve, reject)
    };

    var urlFiles = ['js/helper/jxPromise.js']
    if (typeof Promise == 'undefined') { //need to load Bluebird (Promise polyfill)
        urlFiles.push('libs/bluebird-3.5.5.min.js')
    }

    JxLoader.loadAndTagMultipleFiles(urlFiles,
        function() {
            var promise = new Promise(bootstrapSequence)
            promise
                .then(function() { console.log('done!') })
                .catch(function(err) {
                    console.error('failed to run bootstrap sequence: ' + err.message)
                    console.error(err.stack)
                })
        },
        function(err) {
            console.error('failed to load Promise polyfill: ' + err.message)
            console.error(err.stack)

            var loaderDiv = document.querySelector('.special-loading')
            loaderDiv.innerHTML = "<p>Ops, something going wrong :(</p>";
            loaderDiv
        })
})(window);