import { JxHelper } from '/js/jxhelper.js'
class Note {
    static renderPage() {
        JxHelper.showLoadingPanel();

        var partial = $.get({ url: "js/note/partial.html", cache: true });

        $.when(partial)
            .done(function(data) {
                let element = $(partial);

                element.find('.todo-holder')
                    .append(Note.generateToDoItem("buy lunch"))
                    .append(Note.generateToDoItem("mop floor"))
                    .append(Note.generateToDoItem("clean dishes"));

                //TODO: bind event for each todo item


                JxHelper.getContentPanel()
                    .empty()
                    .append(element);
            })
            .fail(function(xhr, statusCode, error) {
                JxHelper.getSpecialError()
                    .html("<h2>Opps, something wrong happen :(")
                    .addClass("visible");
            })
            .always(function() {
                JxHelper.hideLoadingPanel();
            });
    }

    static generateToDoItem(message) {
        var jqueryElement = $('<li class="todo-item">' + message + '</li>');
        var domElement = jqueryElement[0];

        return jqueryElement;
    }
}

export { Note }
//# sourceURL=note/note.js