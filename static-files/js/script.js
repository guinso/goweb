import { JxHelper } from '/js/jxhelper.js'
import { Router } from '/js/router.js'

(function() {
    //listen URL hash(#) change and swap content accordingly
    let router = new Router()
    window.onhashchange = () => {
        router.resolve(decodeURI(window.location.hash))
    }

    $.get({ url: "/js/mainContent/partial.html", cache: true })
        .done(function(data) {
            JxHelper.getMainContent().html(data);

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
})()
//# sourceURL=script.js