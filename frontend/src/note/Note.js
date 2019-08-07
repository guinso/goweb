import rawPartial from '!!raw-loader!./partial.html'
import * as JxHelper from '../helper/jxHelper'

export class Note { 
    constructor() {
        this.partial = null
    }

    getPartial() {
        if(!this.partial) {
            this.partial = JxHelper.parseHTMLString(rawPartial)
        }

        var todoPlaceHolder = this.partial.querySelector('.todo-holder')
        this.reloadTodoList(todoPlaceHolder)

        return this.partial
    };

    reloadTodoList(todoPlaceHolder) {
        todoPlaceHolder.innerHTML = ''
        todoPlaceHolder.appendChild(this.generateToDoItem("buy lunch"))
        todoPlaceHolder.appendChild(this.generateToDoItem("mop floor"))
        todoPlaceHolder.appendChild(this.generateToDoItem("clean dishes"))

        //TODO: bind event for each todo item
    };

    generateToDoItem(message) {
        var element = document.createElement('li')
        element.classList.add('todo-item')
        element.textContent = message

        return element;
    };
}