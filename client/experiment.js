'use strict'

String.prototype.contains = String.prototype.contains || function(str) {
	return this.indexOf(str) >= 0;
};

String.prototype.startsWith = String.prototype.startsWith || function(prefix) {
	return this.indexOf(prefix) === 0;
};

String.prototype.endsWith = String.prototype.endsWith || function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) >= 0;
};

function JxBoot(){ }

JxBoot.prototype.LoadFile = function(urlFile, successFN, failureFN) {
    if (!('jxFiles' in window)) {
        window['jxFiles'] = new Array()
    }

    var fileLUT = window['jxFiles']
    var cacheFiles = fileLUT.filter(function(x){ return x.fileName == urlFile })

    if (cacheFiles.length > 0) {
        console.warn("File " + urlFile + " is cached")
        successFN(cacheFiles[0].text)
        return //cached
    }

    var request = new XMLHttpRequest()
    request.onerror = function(){
        failureFN(new Error(
            "Failed to get " + urlFile 
            + ", HTTP status: " + request.status + " - " + request.statusText))
        }

    request.onload = function() {
        if (request.status == 200 || request.status < 300) {
            fileLUT.push({ fileName: urlFile, text: request.responseText })

            successFN(request.responseText)
        } else {
            failureFN(new Error(
                "Failed to get " + urlFile 
                + ", HTTP status: " + request.status + " - " + request.statusText))
        }
    }

    var isAsynchronous = true

    request.open('GET', urlFile, isAsynchronous)
    request.send()
};

JxBoot.prototype.LoadMultipleFiles = function(urls, successFN, failedFN) {
    var urlCount = urls.length

    var successCount = 0
    var triggeredFail = false

    for (var i = 0; i < urlCount; i++) {
        JxBoot.prototype.LoadFile.call(this, urls[i], 
            function() {
                successCount++
                if (successCount == urlCount) {
                    var responseTexts = urls.map(function(url){
                        var cache = window['jxFiles'].filter(function(x){ return x.fileName == url})
                        return cache[0].text
                    }) 
                    successFN.apply(null,responseTexts) 
                }
            }, 
            function(err) {
                if (triggeredFail == false) {
                    triggeredFail = true
                    failedFN(err)
                }
            })
    }
};

JxBoot.prototype.AddScriptTag = function(rawText, fileURL) {
    var header = document.head// document.getElementsByTagName('head')[0]

    var found = false
    var headCount = header.childElementCount
    for(var i=0; i < headCount; i++) {
        if (header.children[i].nodeName.toLowerCase() === 'script' && 
            header.children[i].dataset &&
            header.children[i].dataset.url &&
            header.children[i].dataset.url === fileURL) {
            found = true
        }
    }
    if (found) {
        console.log('script URL ' + fileURL + ' already added')
        return
    }

    var newScript = document.createElement('script')
    newScript.setAttribute('type', 'text/javascript')
    newScript.innerHTML = rawText

    if (typeof fileURL === 'string' && fileURL.length > 0) {
        newScript.setAttribute('data-url', fileURL)
    }

    header.appendChild(newScript)
};

JxBoot.prototype.AddStyleSheetTag = function(rawText, fileURL) {
    //add into header
    var header = document.head// document.getElementsByTagName('head')[0]

    var found = false
    var headCount = header.childElementCount
    for(var i=0; i < headCount; i++) {
        if (header.children[i].nodeName.toLowerCase() === 'link' && 
            header.children[i].dataset &&
            header.children[i].dataset.url &&
            header.children[i].dataset.url === fileURL) {
            found = true
        }
    }
    if (found) {
        console.log('stylesheet URL ' + fileURL + ' already added')
        return
    }

    var newStyleSheet = document.createElement('link')
    newStyleSheet.setAttribute('rel', 'stylesheet')
    newStyleSheet.innerHTML = rawText

    if (typeof fileURL === 'string' && fileURL.length > 0) {
        newStyleSheet.setAttribute('data-url', fileURL)
    }

    header.appendChild(newStyleSheet)
};

window.JxLoader = new JxBoot()

function bootstrapWebPage() {

    JxLoader.LoadMultipleFiles([
        '/libs/jquery-3.4.1.min.js', 
        '/libs/popper.min.js',
        '/libs/bootstrap.min.js',
        '/libs/jquery-3.4.1.min.js',
        '/css/style.css',
        '/css/bootstrap.min.css', 
        '/css/bootstrap-grid.min.css', 
        '/css/bootstrap-reboot.min.css',
        '/css/bootstrap.min.css'], 
        function(
            jquery, popper, bootstrap, bootstrap1,
            styleCSS, bootstrapCSS, bootstrapGridCSS, boostrapRebootCSS, bootstrapCSS1){

            JxLoader.AddScriptTag(jquery, '/libs/jquery-3.4.1.min.js')
            JxLoader.AddScriptTag(popper, '/libs/popper.min.js')
            JxLoader.AddScriptTag(bootstrap, '/libs/bootstrap.min.js')
            JxLoader.AddScriptTag(bootstrap1, '/libs/bootstrap.min.js')
            console.log("load libs done")

            JxLoader.AddStyleSheetTag(styleCSS, '/css/style.css')
            JxLoader.AddStyleSheetTag(bootstrapCSS, '/css/bootstrap.min.css')
            JxLoader.AddStyleSheetTag(bootstrapGridCSS, '/css/bootstrap-grid.min.css')
            JxLoader.AddStyleSheetTag(boostrapRebootCSS, '/css/bootstrap-reboot.min.css')
            JxLoader.AddStyleSheetTag(bootstrapCSS1, '/css/bootstrap.min.css')
            console.log("load stylesheets done")

            $('.special-loading').text('asd')
            $('.special-loading').addClass('visible')
        },
        function(err) {
            console.error('failed to load file: ' + err.message)
        })
};

(function() {
    if (typeof Promise == 'undefined') {
        //need to load Bluebird
        JxLoader.LoadFile('libs/bluebird-3.5.5.min.js',
            function(text){
                JxLoader.AddScriptTag(text)

                //TODO: load series of scripts and stylesheets
                console.log('load Promise polyfill successfully')
                bootstrapWebPage()
            },
            function(err){
                console.error('failed to load Promise polyfill: ' + err.message)
            })
    } else {
        bootstrapWebPage()
    }
})();