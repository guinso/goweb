$(function() {
    var router = new Router();

    //start listen URL hash(#) change and swap content accordingly
    router.registerEventListener();

    //hide loading page
    JxHelper.hideSpecialLoading();
    
    //start resolve path
    router.resolve(decodeURI(window.location.hash));
})