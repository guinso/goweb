class FetchHelper {
    static async json(url) {
        const response = await fetch(url)
        if (!response.ok) {
            throw Error("failed to fetch: " + url)
        }

        const json = await response.json()
        return json
    }

    static async text(url) {
        const response = await fetch(url)
        if (!response.ok) {
            throw Error("failed to fetch: " + url)
        }

        const rawText = await response.text()
        return rawText
    }

    static async texts(urls) {

        const promises = urls.map(url => fetch(url))
        const answers = await Promise.all(promises)

        let errorCount = answers.filter(value => !value.ok).length
        if (errorCount > 0) {
            throw Error("Failed to fetch file from server")
        }

        let textPromises = answers.map(value => value.text())
        const texts = await Promise.all(textPromises)

        return texts
    }

    static async postJson(url, jsonData) {
        const inputData = JSON.stringify(jsonData)

        const response = await fetch(url, {
            method: 'POST',
            body: inputData,
            header: {
                contentType: 'application/json'
            }
        })

        if (!response.ok) {
            throw Error(response.statusText)
        }

        const returnJson = await response.json()
        return returnJson
    }
}

async function JxLoadScript(urlFile, successFN, failureFN) {
    if (!('jxScripts' in window)) {
        window['jxScripts'] = new Array()
    }

    let scriptLUT = window['jxScripts']
    if (scriptLUT.filter(x => x.fileName == urlFile).length > 0) {
        console.log(`Script ${urlFile} is cached`)
        successFN()
        return //cached
    }

    let rawText = await FetchHelper.text(urlFile)

    let header = document.getElementsByTagName('head')[0]
    let newScript = document.createElement('script')
    newScript.setAttribute('type', 'text/javascript')
    newScript.innerHTML = rawText
    header.appendChild(newScript)

    scriptLUT.push({ fileName: urlFile })

    // let request = new XMLHttpRequest()
    // request.onerror = () => {
    //     console.log(`Failed to get ${urlFile}, HTTP status: ${request.status} - ${request.statusText}`)
    //     failureFN()
    // }

    // request.onload = () => {
    //     if (request.status == 200) {
    //         //add into header
    //         let header = document.getElementsByTagName('head')[0]
    //         let newScript = document.createElement('script')
    //         newScript.setAttribute('type', 'text/javascript')
    //         newScript.innerHTML = request.responseText
    //         header.appendChild(newScript)

    //         scriptLUT.push({ fileName: urlFile })

    //         successFN()
    //     } else {
    //         console.log(`Failed to get ${urlFile}, HTTP status: ${request.status} - ${request.statusText}`)
    //         failureFN()
    //     }
    // }

    // const isAsynchronous = true

    // request.open('GET', urlFile, isAsynchronous)
    // request.send()
}

(async function() {
    // let txt = ''

    // JxLoadScript('/js/helper/jxHelper.js', () => {
    //     console.log('done... 1')

    // }, () => {})
    // JxLoadScript('/js/helper/jxHelper.js', () => {
    //     console.log('done... 2')
    //     JxHelper.showMainContent()
    // }, () => {})

    var rawText = await JxLoadScript('/js/helper/jxHelper.js')

    JxHelper.showMainContent()
})()