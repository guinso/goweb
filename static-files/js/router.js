//this module is solely handle swaping content based on URL hash value
function Router() {
    var that = this;

    var cache = {};

    this.registerEventListener = function() {
        window.onhashchange = function() {

            //on every change the render function is called with the new hash
            //this is how the navigation of our app happends.
            that.resolve(decodeURI(window.location.hash));
        };
    };

    this.resolve = function(url) {
        //This function decides what type of page to show
        //depending on the current url hash value.

        //check current login ID
        $.get('/api/current-user')
            .done(function(response){
                var data = JSON.parse(response);
                if (data.statusCode === 0) {
                    if(data.response.id === "-") {
                         //show login page
                        getModule('login', '/js/login/login.js', function(login) {
                            login.renderPage();
                        });
                    } else {
                        $('#usernameHolder').html(data.response.username); //TODO: get full name
                        actualRouting(url);
                    }
                } else {
                    //show login page
                    getModule('login', '/js/login/login.js', function(login) {
                        login.renderPage();
                    });
                }
            })
            .fail(function(){
                JxHelper.showServerErrorMessage();
            });
    };

    function actualRouting(url) {
        //get the keyword from the url
        if (url[0] === "#") {
            url = url.substring(1);
        }
        var paths = url.split('/');

        //hide whatever page is currently shown
        JxHelper.hideAllContent();

        //TODO: render side panel menu items

        var mainContent = JxHelper.getContentPanel();

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
            getModule('user', '/js/user/user.js', function(user) {
                user.renderPage();
            });
        } else if (paths[0] === "note") {
            getModule('note', '/js/note/note.js', function(note) {
                note.renderPage();
            });
        } else if (paths[0] === "login") {
            getModule('login', '/js/login/login.js', function(login) {
                login.renderPage();
            });
        } else if (paths[0] === "logout") {
            getModule('login', '/js/login/login.js', function(login) {
                login.logout();
            });
        } else {
            renderPageNotFound();
        }
    }

    function renderPageNotFound() {
        JxHelper.getSpecialError()
            .html("<h2>Opps, can't find the page you are looking for</h2>")
            .addClass('visible');
    }

    function getModule(key, urlVal, execFn) {
        if (!cache[key]) {
            JxHelper.showSpecialLoading();

            $.getScript({ url: urlVal, cache: true })
                .done(function(data) {
                    var code = "return new " + data;
                    cache[key] = (new Function("return new " + data))();

                    JxHelper.hideSpecialLoading();
                    var tmp = cache[key];
                    execFn(tmp);
                })
                .fail(function(xhr, statusCode, error) {
                    JxHelper.showServerErrorMessage();
                });
        } else {
            execFn(cache[key]);
        }
    }

    function strPrefixMatch(strCompare, prefix) {
        return strCompare.indexOf(prefix) === 0;
    }
}
//# sourceURL=router.js