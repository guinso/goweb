var JxHelper = {

    //loading panel
    getLoadingPanel : function() {
        return $('.loading-panel');
    },
    showLoadingPanel : function() {
        $('.loading-panel').addClass('visible');
    },
    hideLoadingPanel : function() {
        $('.loading-panel').removeClass('visible');
    },

    //hide all content
    hideAllContent : function() {
        $('body page').removeClass('visible');
    },

    //main content
    getMainContent : function() {
        return $('.main-content');
    },
    showMainContent : function() {
        $('.main-content').addClass('visible');
    },
    hideMainContain : function() {
        $('.main-content').removeClass('visible');
    },

    //special error
    getSpecialError : function() {
        return $('.special-content');
    },
    showSpecialError : function() {
        $('.special-content').addClass('visible');
    },
    hideSpecialError : function() {
        $('.special-content').removeClass('visible');
    },

    //special loading
    getSpecialLoading : function() {
        return $('.special-loading');
    },
    showSpecialLoading : function() {
        $('.special-loading').addClass('visible');
    },
    hideSpecialLoading : function() {
        $('.special-loading').removeClass('visible');
    }
}