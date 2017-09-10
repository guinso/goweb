var JxHelper = {

    //loading panel
    getLoadingPanel : function() {
        return $('.loading-panel');
    },
    showLoadingPanel : function() {
        $('.loading-panel').addClass('visible-panel');
    },
    hideLoadingPanel : function() {
        $('.loading-panel').removeClass('visible-panel');
    },

    //content panel
    getContentPanel : function() {
        return $('.content-panel');
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
        return $('.special-error');
    },
    showSpecialError : function() {
        $('.special-error').addClass('visible');
    },
    hideSpecialError : function() {
        $('.special-error').removeClass('visible');
    },

    //special content
    getSpecialContent : function() {
        return $('.special-content');
    },
    showSpecialContent : function() {
        $('.special-content').addClass('visible');
    },
    hideSpecialContent : function() {
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