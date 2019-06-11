import { JxHelper } from '/js/helper/jxhelper.js'
import { FetchHelper } from '/js/helper/fetchHelper.js'
import { Router } from '/js/router.js'

//run script
(async function() {
    try {
        //1. load dependencies
        const jsfiles = await FetchHelper.texts(
            ['/libs/jquery-3.2.1.min.js', '/libs/popper.min.js', '/libs/bootstrap.min.js'])
        jsfiles.forEach(file => addJSTag(file))

        const cssFiles = await FetchHelper.texts(
            ['/css/bootstrap.min.css', '/css/bootstrap-grid.min.css', '/css/bootstrap-reboot.min.css'])
        cssFiles.forEach(file => addCSSTag(file))

        //2. load webpage layout
        const partial = await FetchHelper.text('/js/mainContent/partial.html')
        JxHelper.getMainContent().innerHTML = partial

        //3. listen URL hash(#) change and swap content accordingly
        window.onhashchange = function() {
            try {
                Router.resolve(decodeURI(window.location.hash))
            } catch (err) {
                JxHelper.showServerErrorMessage();
            }
        }

        //4. start resolve path
        Router.resolve(decodeURI(window.location.hash))

    } catch (err) {
        console.error(err)
        triggerFailMessage()
    }
})()

function addCSSTag(source) {
    const element = document.createElement("style")
    element.setAttribute('rel', 'stylesheet')
    element.setAttribute('type', 'text/css')
    element.innerHTML = source

    document.getElementsByTagName("body")[0].appendChild(element)
}

function addJSTag(innerHTML) {
    const element = document.createElement('script')
    element.type = 'text/javascript'
    element.innerHTML = innerHTML

    document.getElementsByTagName("body")[0].appendChild(element)
}

function appendElement(body, tagName, innerHTML) {
    var element = document.createElement(tagName);
    element.innerHTML = innerHTML;

    body.appendChild(element);
}

function triggerFailMessage() {
    //handle error exception
    JxHelper.getSpecialLoading().innerHTML = "<p>Ops, something going wrong :(</p>";
    JxHelper.showSpecialLoading()
}