import { JxHelper } from '/js/jxhelper.js'

//this module is solely handle swaping content based on URL hash value
class Router {
    constructor() {

    }

    resolve(url) {
        //This function decides what type of page to show
        //depending on the current url hash value.

        //check current login ID
        $.get('api/current-user')
            .done(function(response) {
                let data = JSON.parse(response);
                if (data.statusCode === 0) {
                    if (data.response.id === "-") {
                        //show login page
                        Router.getModule('js/login/login.js', function(login) {
                            login.renderPage();
                        });
                    } else {
                        $('#usernameHolder').html(data.response.username); //TODO: get full name
                        this.actualRouting(url);
                    }
                } else {
                    //show login page
                    Router.getModule('js/login/login.js', function(login) {
                        login.renderPage();
                    });
                }
            })
            .fail(function() {
                JxHelper.showServerErrorMessage();
            });
    }

    actualRouting(url) {
        //get the keyword from the url
        if (url[0] === "#") {
            url = url.substring(1);
        }
        const paths = url.split('/');

        //hide whatever page is currently shown
        JxHelper.hideAllContent();

        //TODO: render side panel menu items

        const mainContent = JxHelper.getContentPanel();

        if (paths[0] === "") {
            location.href = "#user"; //redirect to user page...
        } else if (paths[0] === "asd") {

            mainContent.html('<a href="#qwe" class="aaa">QWE</a>');
            mainContent.find('.aaa').css("color", "green");

            JxHelper.showMainContent();

        } else if (paths[0] === "qwe") {

            mainContent.html('<a href="#asd">ASD</a><br/>' +
                '<a href="#user">User</a>');

            JxHelper.showMainContent();
        } else if (paths[0] === "user") {
            Router.getModule('/js/user/user.js', function(user) {
                user.renderPage();
            });
        } else if (paths[0] === "note") {
            Router.getModule('/js/note/note.js', function(note) {
                note.renderPage();
            });
        } else if (paths[0] === "login") {
            Router.getModule('/js/login/login.js', function(login) {
                login.renderPage();
            });
        } else if (paths[0] === "logout") {
            Router.getModule('/js/login/login.js', function(login) {
                login.logout();
            });
        } else if (paths[0] === "role-access") {
            Router.getModule('/js/roleAccess/roleAccess.js', function(role) {
                role.renderPage();
            });
        } else {
            Router.renderPageNotFound();
        }
    }

    static renderPageNotFound() {
        JxHelper.getSpecialError()
            .html("<h2>Opps, can't find the page you are looking for</h2>")
            .addClass('visible');
    }

    static getModule(urlVal, execFn) {
        JxHelper.showSpecialLoading();

        fetch(urlVal)
            .then(response => {
                if (!response.ok) {
                    return Error(response.statusText)
                } else {
                    return response.text()
                }
            })
            .then(text => {
                JxHelper.hideSpecialLoading();

                execFn((new Function("return new " + text))());
            })
            .catch(err => {
                console.log(err)
                JxHelper.showServerErrorMessage()
            })
    }

    /*
    if (!this._cache[key]) {
        JxHelper.showSpecialLoading();

        let tmpCache = this._cache

        $.getScript({ url: urlVal, cache: true })
            .done(function(data) {
                var code = "return new " + data;
                tmpCache[key] = (new Function("return new " + data))();

                JxHelper.hideSpecialLoading();
                var tmp = tmpCache[key];
                execFn(tmp);
            })
            .fail(function(xhr, statusCode, error) {
                JxHelper.showServerErrorMessage();
            });
    } else {
        execFn(this._cache[key]);
    }
    */

    static strPrefixMatch(strCompare, prefix) {
        return strCompare.indexOf(prefix) === 0;
    }
}

export { Router }
//# sourceURL=router.js