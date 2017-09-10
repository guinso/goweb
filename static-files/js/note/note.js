function Note() {
    this.renderPage = function() {
        JxHelper.showLoadingPanel();
        
        var partial = $.get({url:"/js/note/partial.html", cache:true});

        $.when(partial)
            .done(function(data){
                var tmp =  _render(data);

                JxHelper.getContentPanel()
                    .empty()
                    .append(tmp);
            })
            .fail(function(xhr, statusCode, error){
                JxHelper.getSpecialError()
                    .html("<h2>Opps, something wrong happen :(")
                    .addClass("visible");
            })
            .always(function(){
                JxHelper.hideLoadingPanel();
            });
    }

    var _render = function(partial) {

        var element = $(partial);

        element.find('.todo-holder')
            .append(_generateToDoItem("buy lunch"))
            .append(_generateToDoItem("mop floor"))
            .append(_generateToDoItem("clean dishes"));

        //TODO: bind event for each todo item

        return element;
    }

    var _generateToDoItem = function(message) {
        return $('<li class="todo-item">' + message + '</li>');
    }
}