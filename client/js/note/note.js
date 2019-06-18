function note() { }

note.prototype.renderPage = function() {
    JxHelper.showLoadingPanel()

    var thisInstance = this
    this.fetchPartial(
        function(fragment) {
            var todoPlaceHolder = fragment.querySelector('.todo-holder')

            thisInstance.reloadTodoList(todoPlaceHolder)

            var contentPanel = JxHelper.getContentPanel()
            JxLoader.setElementChild(contentPanel, fragment)

            JxHelper.hideLoadingPanel()
        },
        function(err) {
            console.error(err.trace)
            var specialError = JxHelper.getMainContent()
            specialError.innerHTML = "<h2>Opps, something wrong happen :(</h2>"
            specialError.classList.add("visible")
        })
};

note.prototype.fetchPartial = function(resolve, reject) {
    JxLoader.loadFile('/js/note/partial.html',
        function(partialHTML) {
            var placeHolder = JxHelper.parseHTMLString(partialHTML)

            resolve(placeHolder)
        },
        reject)
};

note.prototype.reloadTodoList = function(todoPlaceHolder) {
    todoPlaceHolder.innerHTML = ''
    todoPlaceHolder.appendChild(Note.generateToDoItem("buy lunch"))
    todoPlaceHolder.appendChild(Note.generateToDoItem("mop floor"))
    todoPlaceHolder.appendChild(Note.generateToDoItem("clean dishes"))

    //TODO: bind event for each todo item
};

note.prototype.generateToDoItem = function(message) {
    var element = document.createElement('li')
    element.classList.add('todo-item')
    element.textContent = message

    return element;
};

(function() {
    if (typeof Note === 'undefined') {
        window.Note = new note()
    }
})()
//# sourceURL=/js/note/note.js