function user() {}

user.prototype.renderPage = function() {
    JxHelper.showLoadingPanel()

    // const partial = FetchHelper.text("/js/user/partial.html")
    // const userData = FetchHelper.json("js/user/dummy.json")
    // const optionalDemo = FetchHelper.json("/api/meals")

    // const responses = await Promise.all([partial, userData, optionalDemo])
    // const partialString = responses[0]

    JxLoader.loadFile('/js/user/partial.html',
        function(htmlPartial) {
            var contentPanel = JxHelper.getContentPanel()
            contentPanel.innerHTML = htmlPartial

            JxHelper.hideLoadingPanel()
        },
        function(err) {
            var specialError = JxHelper.getSpecialError()
            specialError.innerHTML = "<h2>Opps, something wrong happen :(</h2>"
            specialError.addClass("visible")
        })
};

(function() {
    if (typeof User === 'undefined') {
        window.User = new user()
    }
})()
//# sourceURL=user/user.js