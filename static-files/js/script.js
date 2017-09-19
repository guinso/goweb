$(function() {

    $.get({ url: "js/mainContent/partial.html", cache: true })
        .done(function(data) {
            JxHelper.getMainContent().html(data);

            var router = new Router();

            //start listen URL hash(#) change and swap content accordingly
            router.registerEventListener();

            //hide loading page
            JxHelper.hideSpecialLoading();

            //start resolve path
            router.resolve(decodeURI(window.location.hash));
        })
        .fail(function(xhr, statusCode, error) {
            JxHelper.getSpecialError()
                .html("<h1>Opps, something something wrong happen with server :(</h1>");

            JxHelper.showSpecialError();
        });
});
//# sourceURL=script.js