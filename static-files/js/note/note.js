function Note() {
    this.renderPage = function() {
        var contentPanel = document.getElementsByClassName('content-panel')[0];
        contentPanel.innerHTML = "";
        contentPanel.appendChild(_render({}));
    }

    var _render = function(data) {
        todos = _generateToDoItem("buy lunch") 
            + _generateToDoItem("mop floor")
            + _generateToDoItem("clean dishes");

        var element = document.createElement('div');
        element.className = "container";
        element.innerHTML = 
        '<div class="row">\
            <div class="col">\
                <h2>TODO</h2>\
            </div>\
        </div>\
        <div class="row">\
            <div class="col-md-2">\
                <ul>' + todos + '</ul>\
            </div>\
        </div>';

        //TODO: bind event for each todo item

        return element;
    }

    var _generateToDoItem = function(message) {
        return '<li class="todo-item">' + message + '</li>';
    }
}