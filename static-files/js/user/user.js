import { JxHelper } from '/js/helper/jxhelper.js'
import { FetchHelper } from '/js/helper/fetchHelper.js'

export class User {

    static async renderPage() {
        JxHelper.showLoadingPanel();

        try
        {
            const partial = FetchHelper.text("/js/user/partial.html")
            const userData = FetchHelper.json("js/user/dummy.json")
            const optionalDemo = FetchHelper.json("/api/meals")

            const responses = await Promise.all([partial, userData, optionalDemo])
            const partialString = responses[0]

            const contentPanel = JxHelper.getContentPanel()
            contentPanel.innerHTML = partialString

        } catch(err) {
            JxHelper.getSpecialError()
                    .html("<h2>Opps, something wrong happen :(</h2>")
                    .addClass("visible");
        }

        JxHelper.hideLoadingPanel();
    }
}
//# sourceURL=user/user.js