function btsDialogModal() {}

/**
 * Create an empty Boostrap Modal HTML element, tagname is DIV
 * @returns {Element} Boostrap modal HTML element, tagname is DIV
 */
btsDialogModal.prototype.buildElement = function() {
    var element = document.createElement("div");
    element.classList.add('modal');
    element.setAttribute('role', 'dialog');

    var doc = document.createElement('div');
    doc.classList.add('modal-dialog');
    doc.setAttribute('role', 'document');

    var content = document.createElement('div');
    content.classList.add('modal-content');

    var header = document.createElement('div');
    header.classList.add('model-header');

    var body = document.createElement('div');
    body.classList.add('modal-body');

    var footer = document.createElement('div');
    footer.classList.add('modal-footer');

    //decorate header
    var title = document.createElement('h5');
    title.classList.add('modal-title');
    var closeBtn = document.createElement('button');
    closeBtn.classList.add('close');
    closeBtn.type = 'button';
    closeBtn.setAttribute('data-dismiss', 'modal');
    closeBtn.setAttribute('aria-label', 'Close');
    var closeSpan = document.createElement('span');
    closeSpan.setAttribute('aria-hidden', true);
    closeSpan.innerText = "&times;";
    closeBtn.appendChild(closeSpan);

    header.appendChild(title);
    header.appendChild(closeBtn);

    element.appendChild(doc);
    doc.appendChild(content);
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);

    return element;
};

/**
 * Set Boostrap dialog modal's title
 * @param {Element} element - HTML DIV element
 * @param {String} title - Modal title 
 */
btsDialogModal.prototype.setTitle = function(element, title) {
    var titleElement = element.querySelector('.modal-title');

    if (titleElement !== null) {
        titleElement.innerText = title;
    }
};

/**
 * Get Boostrap dialog modal's body element
 * @param {Element} element - HTML DIV element
 * @return {Element}  HTML DIV element
 */
btsDialogModal.prototype.getBody = function(element) {
    return element.querySelector('.modal-body');
};

/**
 * Get Boostrap dialog modal's footer element
 * @param {Element} element - HTML DIV element
 * @return {Element}  HTML DIV element
 */
btsDialogModal.prototype.getFooter = function(element) {
    return element.querySelector('.modal-footer');
};

/**
 * Get Boostrap dialog modal's header element
 * @param {Element} element - HTML DIV element
 * @return {Element}  HTML DIV element
 */
btsDialogModal.prototype.getHeader = function(element) {
    return element.querySelector('.modal-header');
};

(function() {
    if (typeof BtsDialogModal === 'undefined') {
        window.BtsDialogModal = new btsDialogModal()
    }
})()

//# source=/js/bootstrap/btsDialogModal.js