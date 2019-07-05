/**
 * Create Boostrap ComboBox
 * @param {object} option
 * 1. {item[]}    items       combo box item
 * 2. {string}    placeHolder combobox initial text to display
 * 3. {function}  onChange    event fired when selection change
 * 
 * item
 * {string}    name    item name, display on option TAG
 * {string}    value   item value, value pass to user when selected
 */
function BtsComboBox(option) {
    var thisInstance = this

    this.config = {}
    if (option) {
        this.config = option
    }

    this.element = document.createElement('select')
    this.element.classList.add('form-control')

    //add placeholder
    if (this.config.placeHolder && this.config.placeHolder.length > 0) {
        this.element.appendChild(this._makePlaceHolder(this.config.placeHolder))
    }

    //add options
    if (this.option.items && this.option.items.length > 0) {
        var tmpOption
        this.option.items.array.forEach(function(item){
            tmpOption = thisInstance._makeOption(item.name, item.value)
            thisInstance.element.appendChild(tmpOption)
        })
    }

    this.element.addEventListener('change', function(e){
        if (thisInstance.option.onChange) {
            thisInstance.option.onChange(e)
        }
    });
};

/**
 * @param {string} placeHolder combobox's default display text
 */
BtsComboBox.prototype._makePlaceHolder = function(placeholder) {
    var element = document.createElement('option')
    element.setAttribute('disabled')
    element.setAttribute('selected')
    element.setAttribute('value')
    element.innerText = placeholder

    return element
};

BtsComboBox.prototype._makeOption = function(displayText, value) {
    var element = document.createElement('option')
    element.setAttribute('value', value)
    element.innerText = displayText

    return element
};

BtsComboBox.prototype.getElement = function() {
    return this.element
};
//# source=/js/bootstrap/btsComboBox.js