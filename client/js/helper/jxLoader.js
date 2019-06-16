'use strict'

/** 
 * =============================================================
 * polyfills for string 
 * =============================================================
 */
String.prototype.contains = String.prototype.contains || function(str) {
    return this.indexOf(str) >= 0;
};

String.prototype.startsWith = String.prototype.startsWith || function(prefix) {
    return this.indexOf(prefix) === 0;
};

String.prototype.endsWith = String.prototype.endsWith || function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) >= 0;
};

function jxLoader() {
    this.task = [] //stack data type
}

/** 
 * ======================================================================
 * JxLoader 
 * ======================================================================
 */
jxLoader.prototype.loadFile = function(urlFile, successFN, failureFN) {
    if (!('jxFiles' in window)) {
        window['jxFiles'] = new Array()
    }

    var fileLUT = window['jxFiles']
    var cacheFiles = fileLUT.filter(function(x) { return x.fileName == urlFile })

    if (cacheFiles.length > 0) {
        console.log("File " + urlFile + " is cached")
        successFN(cacheFiles[0].text)
        return //cached
    }

    var request = new XMLHttpRequest()
    request.onerror = function() {
        failureFN(new Error(
            "Failed to get " + urlFile +
            ", HTTP status: " + request.status + " - " + request.statusText))
    }

    request.onload = function() {
        if (request.status == 200 || request.status < 300) {
            fileLUT.push({ fileName: urlFile, text: request.responseText })

            successFN(request.responseText)
        } else {
            failureFN(new Error(
                "Failed to get " + urlFile +
                ", HTTP status: " + request.status + " - " + request.statusText))
        }
    }

    var isAsynchronous = true

    request.open('GET', urlFile, isAsynchronous)
    request.send()
};

jxLoader.prototype.loadFilePromise = function(fileURL, successFN, failFN) {
    var thisInstance = this

    return function() {
        return new Promise(function(resolve, reject) {
            thisInstance.loadFile(fileURL,
                function(text) {
                    if (typeof successFN !== 'undefined') {
                        successFN(text)
                    }
                    resolve(text)
                },
                function(err) {
                    if (typeof failFN !== 'undefiend') {
                        failFN(err)
                    }
                    reject(err)
                })
        })
    }
};

jxLoader.prototype.loadMultipleFiles = function(urls, successFN, failedFN) {
    var urlCount = urls.length

    var successCount = 0
    var triggeredFail = false

    for (var i = 0; i < urlCount; i++) {
        jxLoader.prototype.loadFile.call(this, urls[i],
            function() {
                successCount++
                if (successCount == urlCount) {
                    var responseTexts = urls.map(function(url) {
                        var cache = window['jxFiles'].filter(function(x) { return x.fileName == url })
                        return cache[0].text
                    })
                    successFN.apply(null, responseTexts)
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

jxLoader.prototype.loadMultipleFilesPromise = function(urls, successFN, failedFN) {
    var thisInstance = this

    return new Promise(function(resolve, reject) {
        thisInstance.loadMultipleFiles(urls,
            function() {
                if (typeof successFN !== 'undefined') {
                    successFN(Array.prototype.slice.call(arguments))
                }

                resolve(Array.prototype.slice.call(arguments))
            },
            function(err) {
                if (typeof failedFN !== 'undefined') {
                    failedFN(err)
                }

                reject(err)
            })
    })
};

jxLoader.prototype.loadPartial = function(url, successFN, failedFN) {
    this.loadFile(url,
        function(text) {
            var partial = document.createElement('div')
            partial.innerHTML = text

            successFN(partial)
        },
        failedFN);
};

jxLoader.prototype.loadPartialPromise = function(url, successFN, failedFN) {
    var thisInstance = this
    return function() {
        return new Promise(function(resolve, reject) {
            thisInstance.loadPartial(url,
                function(partial) {
                    if (typeof successFN !== 'undefined') {
                        successFN(partial)
                    }

                    resolve(partial)
                },
                function(err) {
                    if (typeof failedFN !== 'undefined') {
                        failedFN(err)
                    }

                    reject(err)
                })
        })
    }
};

jxLoader.prototype.addScriptTag = function(rawText, fileURL) {
    var header = document.head // document.getElementsByTagName('head')[0]

    var found = false
    var headCount = header.childElementCount
    for (var i = 0; i < headCount; i++) {
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

jxLoader.prototype.addStyleSheetTag = function(rawText, fileURL) {
    //add into header
    var header = document.head // document.getElementsByTagName('head')[0]

    var found = false
    var headCount = header.childElementCount
    for (var i = 0; i < headCount; i++) {
        if (header.children[i].nodeName.toLowerCase() === 'style' &&
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

    var newStyleSheet = document.createElement('style')
    newStyleSheet.setAttribute('rel', 'stylesheet')
    newStyleSheet.setAttribute('type', 'text/css')
    newStyleSheet.innerHTML = rawText

    if (typeof fileURL === 'string' && fileURL.length > 0) {
        newStyleSheet.setAttribute('data-url', fileURL)
    }

    header.appendChild(newStyleSheet)
};

jxLoader.prototype.loadAndTagFile = function(urlFile, successFN, failureFN) {
    var instanceThis = this
    this.loadFile(urlFile,
        function(rawText) {
            try {
                instanceThis._addTag(urlFile, rawText)
                successFN()
            } catch (err) {
                failureFN(err)
            }
        },
        failureFN)
};

jxLoader.prototype.loadAndTagFilePromise = function(urlFile, successFN, failureFN) {
    var thisInstance = this

    return new Promise(function(resolve, reject) {
        thisInstance.loadAndTagFile(urlFile,
            function() {
                if (typeof successFN !== 'undefined') {
                    successFN()
                }

                resolve()
            },
            function(err) {
                if (typeof failureFN !== 'undefined') {
                    failureFN(err)
                }

                reject(err)
            })
    })
};

jxLoader.prototype.loadAndTagMultipleFiles = function(urlFiles, successFN, failureFN) {
    var instanceThis = this
    this.loadMultipleFiles(urlFiles,
        function() {
            try {
                for (var i = 0; i < arguments.length; i++) {
                    instanceThis._addTag(urlFiles[i], arguments[i])
                }

                successFN()
            } catch (err) {
                failureFN(err)
            }
        },
        failureFN)
};

jxLoader.prototype.loadTagMultipleFilesPromise = function(urlFiles, successFN, failureFN) {
    var thisInstance = this
    return new Promise(function(resolve, reject) {
        thisInstance.loadAndTagMultipleFiles(urlFiles,
            function() {
                if (typeof successFN !== 'undefined') {
                    successFN()
                }

                resolve()
            },
            function(err) {
                if (typeof failureFN !== 'undefined') {
                    failureFN(err)
                }

                reject(err)
            })
    })
};

jxLoader.prototype._addTag = function(urlFile, rawText) {
    if (urlFile.endsWith('.js')) {
        this.addScriptTag(rawText, urlFile)
    } else if (urlFile.endsWith('.css')) {
        this.addStyleSheetTag(rawText, urlFile)
    } else {
        throw new Error("only support .js and .css: " + urlFile)
    }
};

jxLoader.prototype.require = function(fileURL, successFN, failureFN) {

    if (!fileURL.endsWith('.js') && !fileURL.endsWith('.css')) {
        throw new Error("only support .js and .css: " + latestTask.url)
    }

    var reqTask = {
        guid: this.generateUUID(), //TODO: generate GUID
        url: fileURL,
        isSuccess: null,
        passFN: successFN,
        failFN: failureFN,
        arg: null
    }

    //step 1: queue request into task
    this.task.push(reqTask)

    var jxbootObj = this

    //step 2: try load file from URL
    this.loadFile(fileURL,
        function(response) {
            try {
                //step 2.1: try evaluate JS script to trigger recursive jxLoader.require(...)
                eval(response)

                //step 2.1.1: mark success
                reqTask.arg = response
                reqTask.isSuccess = true
            } catch (err) {
                //step 2.1.2: mark failed due to encounter error
                reqTask.isSuccess = false
                reqTask.arg = err
            }

            //step 3: dequeue request from task
            jxLoader.prototype.dequeueTask.call(jxbootObj, reqTask.guid)
        },
        function(err) {
            //step 2.2: mark failed due to failed to retrieve file
            reqTask.arg = err
            reqTask.isSuccess = false

            //step 3: dequeue request from task
            jxLoader.prototype.dequeueTask.call(jxbootObj, reqTask.guid)
        })
};

//require promise
jxLoader.prototype.requirePromise = function(fileURL, successFN, failFN) {
    var thisInstance = this
    return function() {
        return new Promise(function(resolve, reject) {
            thisInstance.require(fileURL,
                function(x) {
                    if (typeof successFN !== 'undefined') {
                        successFN(x)
                    }
                    resolve(x)
                },
                function(err) {
                    if (typeof failFN !== 'undefined') {
                        failFN(err)
                    }
                    reject(err)
                })
        })
    }
};

jxLoader.prototype.dequeueTask = function(taskID) {
    //return if no more task available
    if (this.task.length == 0) {
        return
    }

    var latestTask = this.task[this.task.length - 1]
    if (latestTask.guid == taskID) {
        //remove task since latest task matach with taskID
        this.task.pop()

        if (latestTask.isSuccess) {

            if (latestTask.url.endsWith('.js')) {
                jxLoader.prototype.addScriptTag.call(this, latestTask.arg, latestTask.url)
                latestTask.passFN(latestTask.arg)
            } else if (latestTask.url.endsWith('.css')) {
                jxLoader.prototype.addStyleSheetTag.call(this, latestTask.arg, latestTask.url)
                latestTask.passFN(latestTask.arg)
            } else {
                var err = new Error("only support .js and .css: " + latestTask.url)

                latestTask.failFN(err)
            }
        } else {
            latestTask.failFN(latestTask.arg)
        }
    } else {
        //otherwise, wait for 50ms and try dequeue task
        setTimeout(jxLoader.prototype.dequeueTask.call(this, taskID), 50)
    }
};

jxLoader.prototype.getJSON = function(url, successFN, failedFN) {
    var request = new XMLHttpRequest()
    request.onerror = function() {
        failedFN(new Error(
            "Failed to get " + url +
            ", HTTP status: " + request.status + " - " + request.statusText))
    }

    request.onload = function() {
        if (request.status == 200 || request.status < 300) {

            var jsonObj = JSON.parse(request.responseText)
            successFN(jsonObj)
        } else {
            failureFN(new Error(
                "Failed to get " + url +
                ", HTTP status: " + request.status + " - " + request.statusText))
        }
    }

    var isAsynchronous = true

    request.open('GET', url, isAsynchronous)
    request.send()
};

jxLoader.prototype.postJSON = function(url, inputJson, successFN, failedFN) {
    var request = new XMLHttpRequest()
    request.onerror = function() {
        failedFN(new Error(
            "Failed to post " + url +
            ", HTTP status: " + request.status + " - " + request.statusText))
    }

    request.onload = function() {
        if (request.status == 200 || request.status < 300) {

            var jsonObj = JSON.parse(request.responseText)
            successFN(jsonObj)
        } else {
            failureFN(new Error(
                "Failed to post " + url +
                ", HTTP status: " + request.status + " - " + request.statusText))
        }
    }

    var isAsynchronous = true
    var param = JSON.stringify(inputJson)

    request.open('POST', url, isAsynchronous)
    request.setRequestHeader("Content-type", "application/json")
    request.send(param)
}

/**
 * Source: stackoverflow
 * URL: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
jxLoader.prototype.generateUUID = function() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};

jxLoader.prototype.setElementChild = function(parentElement, childElement) {
    while (parentElement.firstChild) {
        parentElement.firstChild.remove()
    }

    parentElement.appendChild(childElement)
};

(function(global) {
    if (typeof JxLoader == 'undefined') {
        global.JxLoader = new jxLoader()

        //load script if specify at data-main attribute
        var scriptTag = document.currentScript
        if (scriptTag &&
            scriptTag.dataset &&
            scriptTag.dataset.main) {
            JxLoader.loadFile(scriptTag.dataset.main,
                function(responseText) {
                    JxLoader.addScriptTag(responseText)
                },
                function(err) {
                    console.error(err.message)
                    console.error('failed retrieve script: ' + scriptTag.dataset.main)
                })
        }
    }
})(this);
//# sourceURL=js/helper/jxLoader.js