/**
 * Tools to create autocomplete text input
 * source: https://www.w3schools.com/howto/howto_js_autocomplete.asp
 * 
 * @param element HTML element object that host auto complete input, suggest DIV 
 * @param options provide all possible customization
 * Options parameter:
 * 1. id                - input text's id attribute
 * 2. placeholder       - input text's placeholde attribute
 * 3. getListFN         - generate list of autocomplete items for input text, format: string[]
 * 4. selectedFN        - handle item selected by end user from autocomplete list
 * 5. formatItemListFN  - handle how to format autocomplete item list display 
 */
function BtsAutoComplete(element, options) {
    this.input = null
    this.container = null
    this.list = null

    this.config = {}
    if (options) {
        this.config = options
    }

    //setup control
    this._setupContainer(element)
    this._setupInput()
    this._setupList()
    
    //combine all elements
    this.container.appendChild(this.input)
    this.container.appendChild(this.list)

    this.selectedIndex = 0

    var thisInstance = this
    document.addEventListener('click', function(e) {
        thisInstance._clearList(e.target)
    })  
    
    this.input.addEventListener('keydown', function(e) {
        thisInstance._keyPressed(e)
    })
};

BtsAutoComplete.prototype._setupInput = function() {
    var thisInstance = this

    this.input = document.createElement('input')
    this.input.classList.add('form-control')
    this.input.setAttribute('type', 'text')
    if (this.config.id) {
        this.input.setAttribute('id', this.config.id)
    }

    if (this.config.placeholder) {
        this.input.setAttribute('placeholder', this.config.placeholder)
    }

    //listen when there is input changes
    this.input.addEventListener('input', function(e){ 
        thisInstance.selectedIndex = -1
        thisInstance._populateList() })   

};

BtsAutoComplete.prototype._setupContainer = function(element) {
    if (!element) {
        throw new Error("Element not existed!")
    }

    var thisInstance = this
    this.container = element
    this.container.innerHTML = ''
    this.container.classList.add('bts-autocomplete')

    //listen when out of focus
    this.container.addEventListener('blur', function(e){ 
        thisInstance.list.classList.remove('show-block')})
};

BtsAutoComplete.prototype._setupList = function() {
    this.list = document.createElement('div')
    this.list.classList.add('bts-autocomplete-list')
};

BtsAutoComplete.prototype.getControl = function() {
    return this.control
};

BtsAutoComplete.prototype.getInputControl = function() {
    return this.input
};

BtsAutoComplete.prototype._populateList = function() {
    var thisInstance = this

    this.list.innerHTML = '' //clear all item
    this.list.classList.add('show-block') //show list

    if (typeof this.config.getListFN === 'undefined') {
        return
    }

    this.config.getListFN(this.getValue(), function(items){
        var tmpDiv = null

        items.forEach(function(item){
            tmpDiv = document.createElement('div')
            tmpDiv.classList.add('bts-autocomplete-item')

            if (typeof thisInstance.config.formatItemListFN !== 'undefined') {
                tmpDiv.innerHTML = thisInstance.config.formatItemListFN(item, thisInstance.getValue())
            } else {
                tmpDiv.innerHTML = item
            }

            tmpDiv.addEventListener('click', function(e){
                thisInstance.setValue(e.target.innerHTML)
                thisInstance._clearList()

                if (typeof thisInstance.config.selectedFN !== 'undefined') {
                    thisInstance.config.selectedFN(item)
                }
            })

            thisInstance.list.appendChild(tmpDiv)
        })
    })
};

BtsAutoComplete.prototype._clearList = function(elemt) {
    var thisInstance = this
    var items = this.list.querySelectorAll('.bts-autocomplete-item')
    items.forEach(function(item){
        if (elemt != thisInstance.input 
            && item != elemt 
            && item != thisInstance.container) {
            thisInstance.list.removeChild(item)
        }
    })
};

BtsAutoComplete.prototype._keyPressed = function(keydownEvent) {
    var items = this.list.querySelectorAll('.bts-autocomplete-item')

        if (keydownEvent.keyCode == 40) { // Down key
            this.selectedIndex++
            this.setActiveItem(items)      
        } 
        else if (keydownEvent.keyCode == 38) { // Up key
            this.selectedIndex--
            this.setActiveItem(items)
        } 
        else if (keydownEvent.keyCode == 13) {// Enter key
            keydownEvent.preventDefault()        
            if (this.selectedIndex > -1) {
                if (this.input) items[this.selectedIndex].click()
            }
        }   
}

BtsAutoComplete.prototype.setActiveItem = function(itemList) {
    this.clearActiveItem(itemList)
    if (this.selectedIndex >= itemList.length) { this.selectedIndex = 0 }       // set selectedIndex to first item list
    if (this.selectedIndex < 0) { this.selectedIndex = (itemList.length - 1) }  // set selectedIndex to last item list
    if (itemList.length !== 0) { itemList[this.selectedIndex].classList.add('bts-autocomplete-active') }
}

BtsAutoComplete.prototype.clearActiveItem = function(itemList) {
    for (var i = 0; i < itemList.length; i++) {
        itemList[i].classList.remove('bts-autocomplete-active')
      }
}  

BtsAutoComplete.prototype.getValue = function() {
    return this.input.value
};

BtsAutoComplete.prototype.setValue = function(newValue) {
    this.input.value = newValue
};
//# sourceURL=/js/boostrap/btsAutoComplete.js