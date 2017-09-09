//this module is solely handle swaping content based on URL hash value
function Router() {
    var that = this;

    var cache = {};

    this.registerEventListener = function() {
        window.onhashchange = function(){
            
            //on every change the render function is called with the new hash
            //this is how the navigation of our app happends.
            that.resolve(decodeURI(window.location.hash));
        }
    }

    this.resolve = function(url) {
        //This function decides what type of page to show
        //depending on the current url hash value.

        //get the keyword from the url
        if (url[0] === "#") {
            url = url.substring(1);
        }
        var paths = url.split('/');

        //hide whatever page is currently shown
        JxHelper.hideAllContent();

        if (paths[0] === "asd") {
            var mainContent = JxHelper.getContentPanel();

            mainContent.html('<a href="#qwe" class="aaa">QWE</a>');
            mainContent.find('.aaa').css("color", "green");

            JxHelper.showMainContent();

        } else if (paths[0] === "qwe") {
            var mainContent = JxHelper.getContentPanel();

            mainContent.html('<a href="#asd">ASD</a><br/>' +
                '<a href="#user">User</a>');

            JxHelper.showMainContent();
        } else if (paths[0] === "user"){
            renderPageFromJS('user', '/js/user/user.js');
        } else if (paths[0] === "note") {
            renderPageFromJS('note', '/js/note/note.js');
        } else {
            renderPageNotFound();
        }
    }

    function renderPageNotFound() {
        JxHelper.getSpecialError()
            .html("<h2>Opps, can't find the page you are looking for</h2>")
            .addClass('visible');
    }

    function renderPageFromJS(key, URL) {
        if (!cache[key]) {
            
            JxHelper.showSpecialLoading();

            $.getScript({url:URL, cache:true})
                .done(function(data){
                    var code = "return new " + data;
                    cache[key] = (new Function("return new " + data))();

                    JxHelper.hideSpecialLoading();
                    cache[key].renderPage();
                })
                .fail(function(xhr, statusCode, error){
                    JxHelper.getSpecialError()
                        .html('<h1>There is problem try to connect to server</h1>')
                        .addClass('visible');
                });
        } else {
            cache[key].renderPage();
        }
    }

    function strPrefixMatch(strCompare, prefix) {
        return strCompare.indexOf(prefix) === 0;
    }
}