export class FetchHelper {
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

        if (!response.ok)
        {
            throw Error(response.statusText)
        }

        const returnJson = await response.json()
        return returnJson
    }
}
//# sourceURL=fetchHelper.js