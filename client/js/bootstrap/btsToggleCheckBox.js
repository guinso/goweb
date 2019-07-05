/**
 * Create Toggle button style checkbox
 * 
 * @param {Element} element 
 * @param {JSON} option 
 * options:
 * 1. {boolean}     value       checkbox default value
 * 2. {string}      id          checkbox id, if not specify, at random guid will be generated
 * 3. {function}    onChange    function to fire when value change
 */
function BtsToggleCheckBox(element, option) {
    var thisInstance = this

    this.config = {}
    if (option) {
        this.config = option
    }

    this.container = element
    
    //create checkbox
    this.input = document.createElement('input')
    this.input.type = 'checkbox'
    this.input.classList.add('tgl')
    this.input.classList.add('tgl-light')

    if (this.config.id && this.config.id.length > 0) {
        this.input.id = this.config.id
    } else {
        this.input.id = this.generateUUID()
    }

    if (this.config.value) {
        this.input.checked = this.config.value
    }

    this.input.addEventListener('change', function(e){
        if (thisInstance.config.onChange) {
            thisInstance.config.onChange(e)
        }
    })

    //create label
    this.label = document.createElement('label')
    this.label.setAttribute('for', this.input.id)
    this.label.classList.add('tgl-btn')

    //put checkbox and label into container
    this.container.innerHTML = ''
    this.container.appendChild(this.input)
    this.container.appendChild(this.label)
};

BtsToggleCheckBox.prototype.getElement = function() {
    return this.container
};

BtsToggleCheckBox.prototype.generateUUID = function() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};
//# source=/js/bootstrap/btsToggleCheckBox.js