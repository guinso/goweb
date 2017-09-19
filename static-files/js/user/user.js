function User() {

    this.renderPage = function() {
        JxHelper.showLoadingPanel();

        var partial = $.get({url:"js/user/partial.html", cache:true});
        var userData = $.get({url:"js/user/dummy.json", cache: false});
        var optionalDemo = $.get({url:"api/meals", cache:false});

        $.when(partial, userData, optionalDemo)
            .done(function(partialResponse, userDataResponse, demoResponse) {
                JxHelper.getContentPanel()
                    .html(partialResponse[0]);
            })
            .fail(function(jsXHR, statusCode, error){
                JxHelper.getSpecialError()
                    .html("<h2>Opps, something wrong happen :(")
                    .addClass("visible");
            })
            .always(function(xhr, statusCode, error){
                JxHelper.hideLoadingPanel();
            });
    }
}
//# sourceURL=user/user.js