import { JxHelper } from '/js/helper/jxhelper.js'
import { FetchHelper } from '/js/helper/fetchHelper.js'

export class User {

    static async renderPage() {
        JxHelper.showLoadingPanel();

        const partial = FetchHelper.fetchText("/js/user/partial.html")
        const userData = FetchHelper.fetchJson("js/user/dummy.json")
        const optionalDemo = FetchHelper.fetchJson("api/meals")

        const responses = await Promise.all([partial, userDate, optionalDemo])

        JxHelper.getContentPanel().innerHtml = responses[0]
        JxHelper.hideLoadingPanel();

        // $.when(partial, userData, optionalDemo)
        //     .done(function(partialResponse, userDataResponse, demoResponse) {
        //         JxHelper.getContentPanel().innerHtml = partialResponse[0]
        //     })
        //     .fail(function(jsXHR, statusCode, error) {
        //         JxHelper.getSpecialError()
        //             .html("<h2>Opps, something wrong happen :(</h2>")
        //             .addClass("visible");
        //     })
        //     .always(function(xhr, statusCode, error) {
        //         JxHelper.hideLoadingPanel();
        //     });
    }
}
//# sourceURL=user/user.js