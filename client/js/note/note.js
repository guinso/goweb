function note() { 
    this.partial = null
}

note.prototype.getPartial = function(successFN, failFN) {
    var thisInstance = this

    this._fetchPartial(
        function(partial){
            var todoPlaceHolder = partial.querySelector('.todo-holder')
            thisInstance.reloadTodoList(todoPlaceHolder)

            successFN(partial)
        }, failFN)
};

note.prototype.reloadTodoList = function(todoPlaceHolder) {
    todoPlaceHolder.innerHTML = ''
    todoPlaceHolder.appendChild(this.generateToDoItem("buy lunch"))
    todoPlaceHolder.appendChild(this.generateToDoItem("mop floor"))
    todoPlaceHolder.appendChild(this.generateToDoItem("clean dishes"))

    //TODO: bind event for each todo item
};

note.prototype.generateToDoItem = function(message) {
    var element = document.createElement('li')
    element.classList.add('todo-item')
    element.textContent = message

    return element;
};

note.prototype._fetchPartial = function(successFN, failureFN) {
    var thisInstance = this
    
    if (this._isPartialEmpty()) {
        JxLoader.loadPartial('/js/note/partial.html', 
        function(partial){
            thisInstance.partial = partial
            successFN(partial)
        }, 
        failureFN)
    } else {
        successFN(this.partial)
    }
}

note.prototype._isPartialEmpty = function() {
    return !(this.partial && this.partial.innerHTML !== '')
};

(function() {
    if (typeof Note === 'undefined') {
        window.Note = new note()
    }
})()
//# sourceURL=/js/note/note.js