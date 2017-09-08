$(function() {
    
    $('window').on('hashchange', function(){
        //on every change the render function is called with the new hash
        //this is how the navigation of our app happends.
        render(decodeURI(window.location.hash));
    });

    function render(url) {
        //This function decides what type of page to show
        //depending on the current url hash value.

        //get the keyword from the url
        var temp = url.split('/')[0];

        //hide whatever page is currently shown
        $('.main-content .page').removeClass('visible');

        var map = {
            //the homepage
            '': function() {
                //clear the filters object, uncheck
                filters = {};
				checkboxes.prop('checked',false);

				renderProductsPage(products);
            },
            '#': function() {
                //clear the filters object, uncheck
                filters = {};
				checkboxes.prop('checked',false);

				renderProductsPage(products);
            },
        };

        // Execute the needed function depending on the url keyword (stored in temp).
        if(map[temp]){
            map[temp]();
        }
        // If the keyword isn't listed in the above - render the error page.
        else {
            renderErrorPage();
        }
    }

    function generateAllProductsHTML(data) {
        //use Handlebars to create a list of products using the provided data.
        //this function is called only once on page load
    }

    function renderProductsPage(data) {
        // hides and shows products in the All Products Page depending on the data it receives.
    }

    function renderSingleProductPage(index, data) {
        //show the single product page with appropiate data.
    }

    function renderFilterResults(filters, products) {
        //crates an object with filtered products and passes it to renderProductsPage.
        renderProductsPage(results);
    }

    function renderErrorPage() {
        //shows the error page
    }

    function createQueryHash(filters) {
        //get the filters object, turn it into a string and write it into the hash.
    }
})