'use strict';

function jxHelper() {}

//loading panel
jxHelper.prototype.getLoadingPanel = function() {
    return document.querySelector('.loading-panel')
};

jxHelper.prototype.showLoadingPanel = function() {
    var loadingPanel = this.getLoadingPanel()
    loadingPanel.classList.add('visible-panel')
};

jxHelper.prototype.hideLoadingPanel = function() {
    this.getLoadingPanel().classList.remove('visible-panel')
};

//content panel
// jxHelper.prototype.getContentPanel = function() {
//     return document.querySelector('.content-panel')
// };

//main content
jxHelper.prototype.getMainContent = function() {
    var mainContent = document.querySelector('.main-content')
    return mainContent
};

// jxHelper.prototype.showMainContent = function() {
//     this.getMainContent().classList.add('visible')
// };

// jxHelper.prototype.hideMainContain = function() {
//     this.getMainContent().classList.remove('visible')
// };

jxHelper.prototype.setMainContent = function(element) {
    var mainContent = this.getMainContent()
    mainContent.innerHTML = ''
    mainContent.appendChild(element)
};

jxHelper.prototype.showServerErrorMessage = function() {
    this.getMainContent()
        .innerHTML = "<h2>Opps, there's problem try to connect to server</h2>"
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