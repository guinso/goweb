export class JxHelper {

    //loading panel
    static getLoadingPanel() {
        return document.querySelector('.loading-panel')
    }
    static showLoadingPanel() {
        JxHelper.getLoadingPanel().classList.add('visible-panel');
    }
    static hideLoadingPanel() {
        JxHelper.getLoadingPanel().classList.remove('visible-panel');
    }

    //content panel
    static getContentPanel() {
        return document.querySelector('.content-panel')
    }

    //hide all content
    static hideAllContent() {
        const pages = document.getElementsByClassName('page')
        for (let i =0; i < pages.length; i++) {
            pages[i].classList.remove('visible')
        }
    }

    //main content
    static getMainContent() {
        return document.querySelector('.main-content')
    }
    static showMainContent() {
        JxHelper.getMainContent().classList.add('visible')
    }
    static hideMainContain() {
        JxHelper.getMainContent().classList.remove('visible')
    }

    //special error
    static getSpecialError() {
        return document.querySelector('.special-error')
    }
    static showSpecialError() {
        JxHelper.getSpecialError().classList.add('visible')
    }
    static hideSpecialError() {
        JxHelper.getSpecialError().classList.remove('visible')
    }
    static showServerErrorMessage() {
        JxHelper.getSpecialError()
            .innerHTML = "<h2>Opps, there's problem try to connect to server</h2>"
        JxHelper.showSpecialError();
    }

    //special content
    static getSpecialContent() {
        return document.querySelector('.special-content')
    }
    static showSpecialContent() {
        JxHelper.getSpecialContent().classList.add('visible')
    }
    static hideSpecialContent() {
        JxHelper.getSpecialContent().classList.remove('visible')
    }

    //special loading
    static getSpecialLoading() {
        return document.querySelector('.special-loading')
    }
    static showSpecialLoading() {
        JxHelper.getSpecialLoading().classList.add('visible')
    }
    static hideSpecialLoading() {
        JxHelper.getSpecialLoading().classList.remove('visible')
    }

    static emptyElementChildren(element) {
        while (element.firstChild) {
            element.firstChild.remove()
        }
    }

    static parseHTMLString(htmlString) {
        let x = document.createElement('div')
        x.innerHTML = htmlString

        return x
    }
}
//# sourceURL=jxhelper.js