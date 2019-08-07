
function _getMainContent() {
    var mainContent = document.querySelector('.main-content')
    return mainContent
};

/**
 * Get main content DIV tag
 */
export function getMainContent() {
    return _getMainContent()
};

/**
 * Set HTML element into main content
 * @param {HTMLElement} element HTML element
 */
export function setMainContent(element) {
    var mainContent = _getMainContent()
    mainContent.innerHTML = ''
    mainContent.appendChild(element)
};

/**
 * Show generic error message
 */
export function showServerErrorMessage() {
    _getMainContent()
        .innerHTML = "<h2>Opps, there's problem to handle your request</h2>"
};

/**
 * Parse HTML partial context into HTML element which wrapped with DIV tag
 * @param {String} htmlString HTML partial context
 * @returns {HTMLElement} HTML element which wrapped with DIV tag
 */
export function parseHTMLString(htmlString) {
    var x = document.createElement('div')
    x.innerHTML = htmlString

    return x
};