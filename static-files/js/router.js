//this module is solely handle swaping content based on URL hash value
function Router() {
    var that = this;

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
        var paths = [];
        if (url[0] === "#") {
            paths = url.substring(1).split('/');
        } else {
            paths = url.split('/');
        }

        //hide whatever page is currently shown
        JxHelper.hideAllContent();

        if (paths[0] === "asd") {
            var mainContent = JxHelper.getMainContent();

            mainContent.html('<a href="#qwe" class="aaa">QWE</a>');
            mainContent.find('.aaa').css("color", "green");

            JxHelper.showMainContent();

        } else if (paths[0] === "qwe") {
            var mainContent = JxHelper.getMainContent();

            mainContent.html('<a href="#asd">ASD</a>');
            JxHelper.showMainContent();
        } else {
            renderPageNotFound();
        }
    }

    function renderPageNotFound() {
        JxHelper.getSpecialError()
            .html("<h2>Opps, can't find the page you are looking for</h2>")
            .addClass('visible');
    }
}