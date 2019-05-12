class JxHelper {

    //loading panel
    static getLoadingPanel() {
        return $('.loading-panel')
    }
    static showLoadingPanel() {
        $('.loading-panel').addClass('visible-panel')
    }
    static hideLoadingPanel() {
        $('.loading-panel').removeClass('visible-panel')
    }

    //content panel
    static getContentPanel() {
        return $('.content-panel')
    }

    //hide all content
    static hideAllContent() {
        $('body page').removeClass('visible')
    }

    //main content
    static getMainContent() {
        return $('.main-content')
    }
    static showMainContent() {
        $('.main-content').addClass('visible')
    }
    static hideMainContain() {
        $('.main-content').removeClass('visible')
    }

    //special error
    static getSpecialError() {
        return $('.special-error')
    }
    static showSpecialError() {
        $('.special-error').addClass('visible')
    }
    static hideSpecialError() {
        $('.special-error').removeClass('visible')
    }
    static showServerErrorMessage() {
        JxHelper.getSpecialError()
            .html("<h2>Opps, there's problem try to connect to server</h2>")
        JxHelper.showSpecialError();
    }

    //special content
    static getSpecialContent() {
        return $('.special-content')
    }
    static showSpecialContent() {
        $('.special-content').addClass('visible')
    }
    static hideSpecialContent() {
        $('.special-content').removeClass('visible')
    }

    //special loading
    static getSpecialLoading() {
        return $('.special-loading')
    }
    static showSpecialLoading() {
        $('.special-loading').addClass('visible')
    }
    static hideSpecialLoading() {
        $('.special-loading').removeClass('visible')
    }
}

export { JxHelper }
//# sourceURL=jxhelper.js