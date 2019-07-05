/**
 * Create Button
 * @param {JSON} option 
 * 1. {string} text set button text
 * 2. {string} type bootstrap button style: (default set to primary)
 *      primary : cadet blue
 *      secondary: grey
 *      success: green
 *      danger: red
 *      warning: orange
 *      info: washed blue
 *      light: no border button
 *      dark: black
 *      link: link style, no button decoration
 */
function BtsButton(option) {
    this.config = {}
    if (option) {
        this.config = option
    }

    this.styles = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']

    this.element = document.createElement('button')
    this.element.type = 'button'
    this.element.classList.add('btn')

    if (this.option.style && this.styles.contains(this.option.style)) {
        this.element.classList.add('btn-' + this.option.style)
    } else {
        this.element.classList.add('btn-primary')
    }

    if (this.config.text) {
        this.element.innerText = this.config.text
    }
};

BtsButton.prototype.getElement = function() {
    return this.element
};
//# source=/js/bootstrap/btsButton.js