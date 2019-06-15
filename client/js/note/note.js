function note() {
    this.placeHolder = null
}

note.prototype.renderPage = function() {
    JxHelper.showLoadingPanel()

    // try {
    //     const fragment = await Note.fetchPartial()
    //     const todoPlaceHolder = fragment.querySelector('.todo-holder')
    //     Note.reloadTodoList(todoPlaceHolder)

    //     const contentPanel = JxHelper.getContentPanel()
    //     JxHelper.emptyElementChildren(contentPanel)

    //     contentPanel.appendChild(fragment)
    // } catch (err) {
    //     console.error(err)
    //     const specialError = JxHelper.getSpecialError()
    //     specialError.innerHTML = "<h2>Opps, something wrong happen :(</h2>"
    //     specialError.classList.add("visible")
    // }

    var thisInstance = this
    this.fetchPartial(
        function(fragment) {
            var todoPlaceHolder = fragment.querySelector('.todo-holder')
            thisInstance.reloadTodoList(todoPlaceHolder)

            var contentPanel = JxHelper.getContentPanel()
            JxHelper.emptyElementChildren(contentPanel)

            contentPanel.appendChild(fragment)
            JxHelper.hideLoadingPanel()
        },
        function(err) {
            console.error(err.trace)
            var specialError = JxHelper.getSpecialError()
            specialError.innerHTML = "<h2>Opps, something wrong happen :(</h2>"
            specialError.classList.add("visible")
        })
};

note.prototype.fetchPartial = function(resolve, reject) {
    var thisInstance = this

    if (!this.placeHolder) {
        JxLoader.loadFile('/js/note/partial.html',
            function(partialHTML) {
                thisInstance.placeHolder = JxHelper.parseHTMLString(partialHTML)

                resolve(thisInstance.placeHolder)
            },
            reject)
    } else {
        resolve(this.placeHolder)
    }
};

note.prototype.reloadTodoList = function(todoPlaceHolder) {
    JxHelper.emptyElementChildren(todoPlaceHolder)

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