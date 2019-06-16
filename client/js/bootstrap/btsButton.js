function btsButton() {}
/**
 * Create Boostrap button HTML element
 * @param {String} innerText - button display text 
 * @param {String} btnClass - additional Boostrap button CSS class 
 * @returns {Element} HTML BUTTON element
 */
btsButton.prototype.buildButton = function(innerText, btnClass) {
    var element = document.createElement('button');
    element.type = 'button';
    element.classList.add('btn');

    if (btnClass !== '') {
        element.classList.add(btnClass.toLowerCase());
    }

    if (innerText !== '') {
        element.innerText = innerText;
    }
};

/**
 * Empty HTML element child(ren)
 * @param {Element} element - HTML element
 */
btsButton.prototype.emptyChild = function(element) {
    while (element.firstChild)
        element.removeChild(element.firstChild);
}

(function() {
    if (typeof BtsButton === 'undefined') {
        window.BtsButton = new btsButton()
    }
})()

//# source=/js/bootstrap/btsButton.js