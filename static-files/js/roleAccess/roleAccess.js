function RoleAccess() {
    var selectedPageIndex = 0;
    var pageSize = 10;

    var partialElement;

    this.renderPage = function() {
        JxHelper.showLoadingPanel();
        
        var partial = $.get({url:"js/roleAccess/partial.html", cache:true});
        var role = $.get({url:"api/role", cache:false});
        var access = $.get({url:"api/access", cache:false});
        var roleAccess = $.get({url:"api/role-access", cache:false});
        var roleAccessCount = $.get({url:"api/role-access-count", cache:false});
    
        var pgIndex = selectedPageIndex;
        var pgSize = pageSize;

        $.when(partial, roleAccess, role, access, roleAccessCount)
            .done(function(partialResponse, roleAccessResponse, roleResponse, accessResponse, 
                roleAccessCntResponse){

                var items = JSON.parse(roleAccessResponse[0]);
                var itemsCount = JSON.parse(roleAccessCntResponse[0])['response'];
                var roleItems = JSON.parse(roleResponse[0]);
                var accessItems = JSON.parse(accessResponse[0]);

                var tmp = document.createElement("div");
                partialElement = tmp;
                tmp.innerHTML = partialResponse[0];

                _renderTable(tmp, items['response']);
                
                _generateSelectOptions(tmp, "#roleSelect", roleItems['response']);
                _generateSelectOptions(tmp, "#accessSelect", accessItems['response']);

                //register search button event handler
                tmp.querySelector("#roleAccessSearch").onclick = function() {
                    _search(tmp);
                }
                
                //var paginationElement = _buildPagination(pgIndex, pgSize, itemsCount.count, _pageIndexSearch);
                var paginationElement = btsPaginationHelper.buildPaginationElement(pgIndex, pgSize, itemsCount.count, _pageIndexSearch);
                var paginationPlaceholder = tmp.querySelector("#paginationPlaceholder");
                btsHelper.emptyChild(paginationPlaceholder);
                paginationPlaceholder.appendChild(paginationElement);

                //test create modal
                var modalEle = btsDialogModalHelper.buildElement();
                btsDialogModalHelper.setTitle(modalEle, "Sample Modal Dialog");
                tmp.append(modalEle);

                JxHelper.getContentPanel()
                    .empty()
                    .append(tmp);
            })
            .fail(function(jsXHR, statusCode, error){
                JxHelper.getSpecialError()
                    .html("<h2>Opps, something wrong happen :(</h2>")
                    .addClass("visible");
            })
            .always(function(xhr, statusCode, error){
                JxHelper.hideLoadingPanel();
            });
    };
    
    var _renderTable = function(element, items) {
        
        var table = document.createElement("table");
        table.classList.add("table");
        table.innerHTML = "<tr><th>#</th><th>Access</th><th>Role</th>"+
            "<th>Is Authorized</th></tr>";

        for(var i=0; i < items.length; i++) {
            table.appendChild(_generateTableRow(i, items[i]));
        }

        var container = element.querySelector("#roleAccessTable");
        $(container).empty();

        container.appendChild(table);
    };

    var _buildPagination = function(selectedIndex, pageSize, totalCount, onIndexSelectFn) {
        var pageCount = (totalCount / pageSize) + (totalCount % pageSize > 0? 1:0);
        var startIndex = selectedIndex;
        var endIndex = selectedIndex;
        for(var i=0; i < 2; i++) {
            startIndex--;
            if(startIndex < 0)
                startIndex = 0;

            endIndex++;
            if(endIndex >= pageCount)
                endIndex = (pageCount - 1);
        }
        var pageRange = endIndex - startIndex + 1;
        var pageItems = [];
        
        var tmpX = {text:"<<", onClick: function(){onIndexSelectFn(0)}};
        pageItems.push(tmpX);

        var tmpX = {text:"<", onClick: null};
        if(selectedIndex - 1 < 0)
            tmpX.onClick = function(){onIndexSelectFn(0)};
        else
            tmpX.onClick = function(){onIndexSelectFn(selectedIndex - 1)};
        pageItems.push(tmpX);

        for(var i = startIndex; i <= endIndex; i++) {
            pageItems.push({
                text: (i + 1).toString(),
                onClick: function(){onIndexSelectFn(i)}
            });
        }

        var tmpX = {text:">", onClick:null};
        if(selectedIndex + 1 >= pageCount)
            tmpX.onClick = function(){onIndexSelectFn(pageCount -1)};
        else
            tmpX.onClick = function(){onIndexSelectFn(selectedIndex + 1)};
        pageItems.push(tmpX);

        pageItems.push({
            text: ">>",
            onClick: function(){onIndexSelectFn(pageCount - 1)}
        })
        
        var paginationElement = btsPaginationHelper.buildElementWithEvent(pageItems);
        var hightlightIndex = 2 + (selectedIndex - startIndex);
        btsPaginationHelper.setActiveItem(paginationElement, hightlightIndex);

        return paginationElement;
    }

    var _generateSelectOptions = function(element, selectID, items) {
        var selectEle = element.querySelector(selectID);
        
        while(selectEle.firstChild)
            selectEle.removeChild(selectEle.firstChild);

        var tmp = document.createElement("option");
        tmp.text = "all";
        tmp.value = "";
        selectEle.appendChild(tmp);

        for(var i=0; i < items.length; i++) {
            var tmp = document.createElement("option");
            tmp.text = items[i]['name'];
            tmp.value = items[i]['id'];

            selectEle.appendChild(tmp);
        }
    };

    var _generateTableRow = function(index, item) {
        var row = document.createElement("tr");

        row.innerHTML = "<td>" + (index + 1) + "</td><td>" + 
            item['access'] +"</td><td>" + 
            item['role'] + "</td><td>"+ 

            //"<input type='checkbox'>" +
            "<input class='tgl tgl-light' id='cb" + index + 
            "' type='checkbox'/><label class='tgl-btn' for='cb" + index + "'></label>" +

            "</td></tr>";

        row.querySelector("td > input").checked = item['isAuthorize'];

        return row;
    };

    var _pageIndexSearch = function(index) {
        selectedPageIndex = index;
        _search(partialElement);
    };

    var _search = function(partialEle) {
        var accessSelectElement = partialEle.querySelector("#accessSelect");
        var roleSelectElement = partialEle.querySelector("#roleSelect");

        var accessID = accessSelectElement.options[accessSelectElement.selectedIndex].value;
        var roleID = roleSelectElement.options[roleSelectElement.selectedIndex].value;

        var roleAccess = $.get({url:"api/role-access?accessID=" + accessID + "&roleID=" + roleID, cache:false});

        $.when(roleAccess)
            .done(function(roleAccessResponse){
                var items = JSON.parse(roleAccessResponse);

                _renderTable(partialEle, items['response']);
            })
            .fail(function(jsXHR, statusCode, error){
                console.log("Failed to get role access records");
                var container = element.querySelector("#roleAccessTable");
                
                container.innerHTML = "<p>opps, failed to retrieve info from server</p>";
            })
            .always(function(jsXHR, statusCode, error){
                //do nothing...
            });
    };
}
//# sourceURL=roleAccess/roleAccess.js