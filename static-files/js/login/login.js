function Login() {
    this.renderPage = function() {
        JxHelper.getSpecialLoading()
            .html('redirecting to login page...')
            .addClass('visible');

        $.get({ url: "js/login/partial.html", cache: true })
            .done(function(partial) {
                JxHelper.getSpecialContent().html(partial);

                //setup event handler
                setupEventHandler();

                JxHelper.showSpecialContent();
                JxHelper.hideSpecialLoading();

                setTimeout(function() {
                    $('.login-placeholder').addClass('show-login');
                }, 100);
            })
            .fail(function(xhr, statusCode, error) {
                JxHelper.showServerErrorMessage();
            });
    };

    var setupEventHandler = function() {
        //implement event handler
        $('#loginForm').submit(function(e){
            console.log('entering login form submit handler...');

            var jsonData = {
                username: $('#usernameCtl').val(),
                pwd: $('#pwdCtl').val()
            };

            var username =  $('#usernameCtl').val();

            var loginMsg = $('#loginFailMsg');
            loginMsg.removeClass('text-danger');
            loginMsg.html("try login...");

            console.log('start send POST request');
            $.post({
                url:'api/login', 
                contentType:'application/json', 
                data: JSON.stringify(jsonData)})
                .done(function(data){
                    response = JSON.parse(data);

                    if (response.statusCode === 0) {
                        loginMsg.html("login success");
                        
                        window.location = "/"; //redirect to default page
                    } else {
                        loginMsg.html(response.statusMsg);
                        loginMsg.addClass('text-danger');
                    }
                })
                .fail(function(xhr, statusCode, error){
                    JxHelper.showServerErrorMessage();
                });

            e.preventDefault();
        });
    };

    this.logout = function() {
        //handle logout
        $.post({url:"api/logout"})
            .done(function(response){
                var data = JSON.parse(response);

                if(data.statusCode === 0) {
                    //logout success
                    window.location = "#login";
                } else {
                    //logout failed
                    JxHelper.getSpecialError()
                        .html("<h3>opps, failed to logout...</h3><p>" + data.statusMsg + "</p>")
                        .addClass('visible');
                }
            })
            .fail(function(xhr, statusCode, error){
                JxHelper.showServerErrorMessage();
            });
    };
}
//# sourceURL=login/login.js