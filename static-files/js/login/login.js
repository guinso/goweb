function Login() {
    this.renderPage = function() {
        JxHelper.getSpecialLoading()
            .html('redirecting to login page...')
            .addClass('visible');

        $.get({url:"/js/login/partial.html", cache:true})
            .done(function(partial){
                JxHelper.getSpecialContent().html(partial);

                //setup event handler
                setupEventHandler();

                JxHelper.showSpecialContent();
                JxHelper.hideSpecialLoading();

                setTimeout(function(){
                    $('.login-placeholder').addClass('show-login');
                }, 100);
            })
            .fail(function(xhr, statusCode, error){
                JxHelper.getSpecialError()
                    .html("<h2>Opps, there's problem to load login page from server</h2>");
                JxHelper.showSpecialError();
            });
    };

    var setupEventHandler = function() {
        //TODO: implement event handler
    };
}