import { JxHelper } from '/js/jxhelper.js'

export class Note {
    static placeHolder = null

    static renderPage() {
        JxHelper.showLoadingPanel();

        (new Promise(Note.fetchPartial))
        .then(fragment => {
            const todoPlaceHolder = fragment.querySelector('.todo-holder')

            return Note.reloadTodoList(todoPlaceHolder)
                .then(todoList => {return fragment})
        })
        .then(fragment => {
            const contentPanel = JxHelper.getContentPanel()
            JxHelper.emptyElementChildren(contentPanel)

            contentPanel.appendChild(fragment)
        })
        .catch(err => {
            console.error(err)
            JxHelper.getSpecialError()
            .html("<h2>Opps, something wrong happen :(</h2>")
            .addClass("visible");
        })
        .then(() => {
            JxHelper.hideLoadingPanel();
        })
    }

    static fetchPartial(resolve, reject) {
        if (!Note.placeHolder)
        {
            fetch('/js/note/partial.html')
            .then(response => {
                if (!response.ok) {
                    reject(response.statusText)
                } 
    
                return response.text()
            })
            .then(htmlText => {
                Note.placeHolder = JxHelper.parseHTMLString(htmlText)
    
                resolve(Note.placeHolder)
            })
        } else {
            resolve(Note.placeHolder)
        }
    }

    static reloadTodoList(todoPlaceHolder) {
        
        return new Promise(function(resolve, reject){
            JxHelper.emptyElementChildren(todoPlaceHolder)

            todoPlaceHolder.appendChild(Note.generateToDoItem("buy lunch"))
            todoPlaceHolder.appendChild(Note.generateToDoItem("mop floor"))
            todoPlaceHolder.appendChild(Note.generateToDoItem("clean dishes"))

            resolve(todoPlaceHolder)
        })
        
        //TODO: bind event for each todo item
    }

    static generateToDoItem(message) {
        let element = document.createElement('li')
        element.classList.add('todo-item')
        element.textContent = message

        return element;
    }
}
//# sourceURL=note/note.js