import { JxHelper } from '/js/helper/jxhelper.js'

export class Login {

    static renderPage() {
        //empty main-content child elements
        const mainContent = JxHelper.getMainContent()
        JxHelper.emptyElementChildren(mainContent)

        JxHelper.getSpecialLoading().innerText = 'redirecting to login page...'
        JxHelper.showSpecialLoading()

        JxHelper.fetchText('/js/login/partial.html')
            .then(text => {
                JxHelper.getSpecialContent().innerHTML = text

                //setup event handler
                Login.setupEventHandler();

                JxHelper.showSpecialContent();
                JxHelper.hideSpecialLoading();

                setTimeout(function() {
                    const xx = document.querySelector('.login-placeholder')
                    xx.classList.add('show-login')
                }, 100);
            })
            .catch(err => {
                console.error(err)
                JxHelper.showServerErrorMessage();
            })
    };

    static setupEventHandler() {
        //implement event handler
        $('#loginForm').submit(function(e) {
            console.log('entering login form submit handler...');

            var jsonData = {
                username: $('#usernameCtl').val(),
                pwd: $('#pwdCtl').val()
            };

            var username = $('#usernameCtl').val();

            var loginMsg = $('#loginFailMsg');
            loginMsg.removeClass('text-danger');
            loginMsg.html("try login...");

            console.log('start send POST request');
            $.post({
                    url: 'api/login',
                    contentType: 'application/json',
                    data: JSON.stringify(jsonData)
                })
                .done(function(data) {
                    const response = JSON.parse(data);

                    if (response.statusCode === 0) {
                        loginMsg.html("login success");

                        window.location = "/"; //redirect to default page
                    } else {
                        loginMsg.html(response.statusMsg);
                        loginMsg.addClass('text-danger');
                    }
                })
                .fail(function(xhr, statusCode, error) {
                    JxHelper.showServerErrorMessage();
                });

            e.preventDefault();
        });
    };

    static logout() {
        //handle logout
        $.post({ url: "api/logout" })
            .done(function(response) {
                var data = JSON.parse(response);

                if (data.statusCode === 0) {
                    //logout success
                    window.location = "#login";
                } else {
                    //logout failed
                    JxHelper.getSpecialError()
                        .html("<h3>opps, failed to logout...</h3><p>" + data.statusMsg + "</p>")
                        .addClass('visible');
                }
            })
            .fail(function(xhr, statusCode, error) {
                JxHelper.showServerErrorMessage();
            });
    };
}
//# sourceURL=login/login.js