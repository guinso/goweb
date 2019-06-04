import { JxHelper } from '/js/helper/jxhelper.js'
import { FetchHelper } from '/js/helper/fetchHelper.js'

export class Note {
    static placeHolder

    static async renderPage() {
        JxHelper.showLoadingPanel()

        try
        {
            const fragment = await Note.fetchPartial()
            const todoPlaceHolder = fragment.querySelector('.todo-holder')
            Note.reloadTodoList(todoPlaceHolder)

            const contentPanel = JxHelper.getContentPanel()
            JxHelper.emptyElementChildren(contentPanel)

            contentPanel.appendChild(fragment)
        } catch(err) {
            console.error(err)
            const specialError = JxHelper.getSpecialError()
            specialError.innerHTML = "<h2>Opps, something wrong happen :(</h2>"
            specialError.classList.add("visible")
        }

        JxHelper.hideLoadingPanel()
    }

    static async fetchPartial(resolve, reject) {
        if (!Note.placeHolder) {
            const partialText = await FetchHelper.text('/js/note/partial.html')

            Note.placeHolder = JxHelper.parseHTMLString(partialText)
        }

        return Note.placeHolder
    }

    static reloadTodoList(todoPlaceHolder) {
        JxHelper.emptyElementChildren(todoPlaceHolder)

        todoPlaceHolder.appendChild(Note.generateToDoItem("buy lunch"))
        todoPlaceHolder.appendChild(Note.generateToDoItem("mop floor"))
        todoPlaceHolder.appendChild(Note.generateToDoItem("clean dishes"))

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