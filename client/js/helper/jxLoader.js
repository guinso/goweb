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

/**
 * =====================================================================
 * JxPromiseTask
 * =====================================================================
 */
function jxPromiseTask(isSerial, tasks) {
    this.isSerial = isSerial
    this.tasks = tasks
}

/** 
 * ======================================================================
 * JxLoader 
 * ======================================================================
 */
function jxLoader() {
    this.debug = false
    this.requireDependecy = []
}

jxLoader.prototype.loadFile = function(urlFile, successFN, failureFN) {
    if (!('jxFiles' in window)) {
        window['jxFiles'] = new Array()
    }

    var fileLUT = window['jxFiles']
    var cacheFiles = fileLUT.filter(function(x) { return x.fileName == urlFile })

    if (cacheFiles.length > 0) {
        this._log("File " + urlFile + " is cached")
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

jxLoader.prototype.loadFilePromiseFN = function(fileURL, successFN, failFN) {
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

jxLoader.prototype.loadMultipleFilesPromiseFN = function(urls, successFN, failedFN) {
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

jxLoader.prototype.loadPartialPromiseFN = function(url, successFN, failedFN) {
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
    var headerChildren = header.querySelectorAll('script, link')

    var headCount = headerChildren.length
    for (var i = 0; i < headCount; i++) {
        var childHead = headerChildren[i]

        if (typeof childHead.nodeName !== 'undefined' &&
            childHead.nodeName &&
            childHead.nodeName.toLowerCase() === 'script' &&
            childHead.dataset &&
            childHead.dataset.url &&
            childHead.dataset.url === fileURL) {
            found = true
        }
    }
    if (found) {
        this._log('script URL ' + fileURL + ' already added')
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
        this._log('stylesheet URL ' + fileURL + ' already added')
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

jxLoader.prototype.loadAndTagFilePromiseFN = function(urlFile, successFN, failureFN) {
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

jxLoader.prototype.loadTagMultipleFilesPromiseFN = function(urlFiles, successFN, failureFN) {
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

/**
 * @param urlFile string URL file path
 * @param dependencyFiles array list of URL files path
 */
jxLoader.prototype.setRequireDependency = function(urlFile, dependencyFiles) {
    this.requireDependecy[urlFile] = dependencyFiles;
};

jxLoader.prototype.require = function(fileURL, successFN, failureFN) {
    var resolveFiles = this._resolveDependency(fileURL)
    resolveFiles.push(fileURL)
    this.loadAndTagMultipleFiles(resolveFiles, successFN, failureFN)
};

jxLoader.prototype._resolveDependency = function(urlFile) {
    var thisInstance = this
    var dependencies = this.requireDependecy[urlFile]

    if (dependencies) {
        var result = []
        dependencies.forEach(function(url) {
            var tempDependencies = thisInstance._resolveDependency(url)
            result = result.concat(tempDependencies)
        })

        return result
    } else {
        return [urlFile]
    }
};

//require promise
jxLoader.prototype.requirePromiseFN = function(fileURL, successFN, failFN) {
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

jxLoader.prototype.getJSONPromiseFN = function(url, successFN, failedFN) {
    var thisInstance = this
    return function() {
        return new Promise(function(resolve, reject) {
            thisInstance.getJSON(url,
                function(jsonObj) {
                    if (typeof successFN !== 'undefined') {
                        successFN(jsonObj)
                    }

                    resolve(jsonObj)
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
};

jxLoader.prototype.runPromise = function(promiseTask) {
    if (promiseTask.isSerial === true) { //run in serial
        return promiseTask.tasks.reduce(this._serialTaskReducer, Promise.resolve([]))
    } else if (promiseTask.isSerial === false) { //run in parallel
        return jxLoader.prototype._parallelTaskReducer.call(this, promiseTask.tasks)
    } else {
        return Promise.reject(new Error(
            'unknown promiseTask.isSerial value - ' + promiseTask.isSerial))
    }
};

jxLoader.prototype._parallelTaskReducer = function(tasks) {
    var promises = []

    for (var i = 0; i < tasks.length; i++) {
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

jxLoader.prototype._serialTaskReducer = function(promiseChain, fn) {
    if (typeof fn === 'function') {
        return promiseChain.then(function(chainResult) {
            return fn().then(function(fnResult) {
                chainResult.push(fnResult)
                return chainResult
            })
        })
    } else if (typeof fn === 'object' && fn instanceof jxPromiseTask) {
        return jxLoader.prototype.runPromise.call(this, fn)
    } else {
        return Promise.reject(new Error(
            "fn is not valid task type ('function' or 'jxPromiseTask') - " + typeof fn))
    }
};

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
    // while (parentElement.firstChild) {
    //     if (typeof parentElement.firstChild.remove !== 'undefined') {
    //         parentElement.firstChild.remove()
    //     }
    // }

    parentElement.innerHTML = ''
    parentElement.appendChild(childElement)
};

jxLoader.prototype._log = function(message) {
    if (this.debug === true) {
        console.log(message)
    }
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