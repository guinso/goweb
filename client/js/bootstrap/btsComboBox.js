function btsComboBox() {}

/**
 * Build bootstrap combox element
 * @param {object[]} items - combobox's item description
 * @param {string} items[].text - combobox item's display name
 * @param {string} items[].value - combobox item's value written in HTML tag 
 */
btsComboBox.prototype.buildElement = function(items) {
    var element = document.createElement('select');
    element.classList.add('form-control');

    for (var i = 0; i < items.length; i++) {
        var option = document.createElement('option');
        option.innerText = items[i]['text'];
        option.value = items[i]['value'];

        element.appendChild(option);
    }

    return element;
};

/**
 * Rebuild existing combobox element's content
 * @param {Element} element - HTML combobox, tagname is SELECT 
 * @param {object[]} items - combobox's item description
 * @param {string} items[].text - combobox item's display name
 * @param {string} items[].value - combobox item's value written in HTML tag 
 */
btsComboBox.prototype.rebuildItems = function(element, items) {
    while (element.firstChild)
        element.removeChild(element.firstChild);

    for (var i = 0; i < items.length; i++) {
        var option = document.createElement('option');
        option.innerText = items[i]['text'];
        option.value = items[i]['value'];

        element.appendChild(option);
    }

    return element;
};

(function() {
    if (typeof BtsComboBox === 'undefined') {
        window.BtsComboBox = new btsComboBox()
    }
})()
//# source=/js/bootstrap/btsComboBox.js