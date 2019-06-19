'use strict';

function jxHelper() {}

//main content
jxHelper.prototype.getMainContent = function() {
    var mainContent = document.querySelector('.main-content')
    return mainContent
};

jxHelper.prototype.setMainContent = function(element) {
    var mainContent = this.getMainContent()
    mainContent.innerHTML = ''
    mainContent.appendChild(element)
};

jxHelper.prototype.showServerErrorMessage = function() {
    this.getMainContent()
        .innerHTML = "<h2>Opps, there's problem to handle your request</h2>"
};

jxHelper.prototype.parseHTMLString = function(htmlString) {
    var x = document.createElement('div')
    x.innerHTML = htmlString

    return x
};

(function() {
    if (typeof JxHelper === 'undefined') {
        window.JxHelper = new jxHelper()
    }
})()
//# sourceURL=js/helper/jxhelper.js