export class fetchHelper {
    static async fetchJson(url) {
        const response = await fetch(url)
        if (!response.ok) {
            throw Error("failed to fetch: " + url)
        }

        const json = await response.json()
        return json
    }

    static async fetchText(url) {
        const response = await fetch(url)
        if (!response.ok) {
            throw Error("failed to fetch: " + url)
        }

        const rawText = await response.text()
        return rawText
    }

    static async fetchTexts(urls) {

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
}
//# sourceURL=fetchHelper.js