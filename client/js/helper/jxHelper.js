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
jxHelper.prototype.getContentPanel = function() {
    return document.querySelector('.content-panel')
};

//hide all content
jxHelper.prototype.hideAllContent = function() {
    var pages = document.getElementsByClassName('page')
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('visible')
    }
};

//main content
jxHelper.prototype.getMainContent = function() {
    var mainContent = document.querySelector('.main-content')
    return mainContent
};

jxHelper.prototype.showMainContent = function() {
    this.getMainContent().classList.add('visible')
};

jxHelper.prototype.hideMainContain = function() {
    this.getMainContent().classList.remove('visible')
};

//special error
jxHelper.prototype.getSpecialError = function() {
    return document.querySelector('.special-error')
};

jxHelper.prototype.showSpecialError = function() {
    this.getSpecialError().classList.add('visible')
};

jxHelper.prototype.hideSpecialError = function() {
    this.getSpecialError().classList.remove('visible')
};

jxHelper.prototype.showServerErrorMessage = function() {
    this.getSpecialError()
        .innerHTML = "<h2>Opps, there's problem try to connect to server</h2>"
    this.showSpecialError()
};

//special content
jxHelper.prototype.getSpecialContent = function() {
    return document.querySelector('.special-content')
};

jxHelper.prototype.showSpecialContent = function() {
    this.getSpecialContent().classList.add('visible')
};

jxHelper.prototype.hideSpecialContent = function() {
    this.getSpecialContent().classList.remove('visible')
};

//special loading
jxHelper.prototype.getSpecialLoading = function() {
    return document.querySelector('.special-loading')
};

jxHelper.prototype.showSpecialLoading = function() {
    this.getSpecialLoading().classList.add('visible')
};

jxHelper.prototype.hideSpecialLoading = function() {
    this.getSpecialLoading().classList.remove('visible')
};

jxHelper.prototype.emptyElementChildren = function(element) {
    while (element.firstChild) {
        element.firstChild.remove()
    }
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