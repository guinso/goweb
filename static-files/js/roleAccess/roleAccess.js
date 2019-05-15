import { JxHelper } from '/js/helper/JxHelper.js'
import { FetchHelper } from '/js/helper/fetchHelper.js'
import { BtsPaginationHelper, BtsDialogModalHelper } from '/js/helper/btsHelper.js'

export class RoleAccess {
    static selectedPageIndex = 0
    static pageSize = 10
    static partialElement = null

    static async renderPage() {
        JxHelper.showLoadingPanel();
        
        try {
            const partial = FetchHelper.text("js/roleAccess/partial.html")

            const role = FetchHelper.json("api/role")
            const access = FetchHelper.json("api/access")
            const roleAccess = FetchHelper.json("api/role-access")
            const roleAccessCount = FetchHelper.json("api/role-access-count")
        
            let pgIndex = RoleAccess.selectedPageIndex;
            let pgSize = RoleAccess.AccesspageSize;

            const reponses = await Promise.all([partial, roleAccess, role, access, roleAccessCount])

            const items = reponses[1]['response'] //JSON.parse(roleAccessResponse[0]);
            const itemsCount = reponses[4]['response'] //JSON.parse(roleAccessCntResponse[0])['response'];
            const roleItems = reponses[2]['response'] //JSON.parse(roleResponse[0]);
            const accessItems = reponses[3]['response'] //JSON.parse(accessResponse[0]);

            let tmp = JxHelper.parseHTMLString(reponses[0]) //document.createElement("div")
            //tmp.innerHTML = reponses[0] //partialResponse[0];
            RoleAccess.partialElement = tmp

            RoleAccess._renderTable(tmp, items)
            
            RoleAccess._generateSelectOptions(tmp, "#roleSelect", roleItems)
            RoleAccess._generateSelectOptions(tmp, "#accessSelect", accessItems)

            //register search button event handler
            tmp.querySelector("#roleAccessSearch").onclick = function() {
                _search(tmp)
            }
            
            //build pagination
            //var paginationElement = _buildPagination(pgIndex, pgSize, itemsCount.count, _pageIndexSearch);
            let paginationElement = BtsPaginationHelper
                .buildPaginationElement(pgIndex, pgSize, itemsCount.count, _pageIndexSearch)
            let paginationPlaceholder = tmp.querySelector("#paginationPlaceholder")
            BtsHelper.emptyChild(paginationPlaceholder)
            paginationPlaceholder.appendChild(paginationElement)

            //test create modal
            let modalEle = BtsDialogModalHelper.buildElement()
            BtsDialogModalHelper.setTitle(modalEle, "Sample Modal Dialog")
            tmp.appendChild(modalEle)

            const contentPanel =  JxHelper.getContentPanel()
            JxHelper.emptyElementChildren(contentPanel)
            contentPanel.appendChild(tmp)

        } catch(err) {
            console.error(`failed to render role access page: ${err.message}`)

            const specialContent = JxHelper.getSpecialError()
            specialContent.innerHTML = "<h2>Opps, something wrong happen :(</h2>"
            JxHelper.showSpecialError()
        }

        JxHelper.hideLoadingPanel();

        // $.when(partial, roleAccess, role, access, roleAccessCount)
        //     .done(function(partialResponse, roleAccessResponse, roleResponse, accessResponse, 
        //         roleAccessCntResponse){

        //         var items = JSON.parse(roleAccessResponse[0]);
        //         var itemsCount = JSON.parse(roleAccessCntResponse[0])['response'];
        //         var roleItems = JSON.parse(roleResponse[0]);
        //         var accessItems = JSON.parse(accessResponse[0]);

        //         var tmp = document.createElement("div");
        //         partialElement = tmp;
        //         tmp.innerHTML = partialResponse[0];

        //         _renderTable(tmp, items['response']);
                
        //         _generateSelectOptions(tmp, "#roleSelect", roleItems['response']);
        //         _generateSelectOptions(tmp, "#accessSelect", accessItems['response']);

        //         //register search button event handler
        //         tmp.querySelector("#roleAccessSearch").onclick = function() {
        //             _search(tmp);
        //         }
                
        //         //var paginationElement = _buildPagination(pgIndex, pgSize, itemsCount.count, _pageIndexSearch);
        //         var paginationElement = btsPaginationHelper.buildPaginationElement(pgIndex, pgSize, itemsCount.count, _pageIndexSearch);
        //         var paginationPlaceholder = tmp.querySelector("#paginationPlaceholder");
        //         btsHelper.emptyChild(paginationPlaceholder);
        //         paginationPlaceholder.appendChild(paginationElement);

        //         //test create modal
        //         var modalEle = btsDialogModalHelper.buildElement();
        //         btsDialogModalHelper.setTitle(modalEle, "Sample Modal Dialog");
        //         tmp.append(modalEle);

        //         JxHelper.getContentPanel()
        //             .empty()
        //             .append(tmp);
        //     })
        //     .fail(function(jsXHR, statusCode, error){
        //         JxHelper.getSpecialError()
        //             .html("<h2>Opps, something wrong happen :(</h2>")
        //             .addClass("visible");
        //     })
        //     .always(function(xhr, statusCode, error){
        //         JxHelper.hideLoadingPanel();
        //     });
    }
    
    static _renderTable(element, items) {
        
        const table = document.createElement("table")
        table.classList.add("table")
        table.innerHTML = "<tr><th>#</th><th>Access</th><th>Role</th>"+
            "<th>Is Authorized</th></tr>"

        for(var i=0; i < items.length; i++) {
            table.appendChild(RoleAccess._generateTableRow(i, items[i]))
        }

        const container = element.querySelector("#roleAccessTable")
        JxHelper.emptyElementChildren(container)

        container.appendChild(table)
    }

    static _buildPagination(selectedIndex, pageSize, totalCount, onIndexSelectFn) {
        const pageCount = (totalCount / pageSize) + (totalCount % pageSize > 0? 1:0)
        let startIndex = selectedIndex
        let endIndex = selectedIndex
        for(var i=0; i < 2; i++) {
            startIndex--;
            if(startIndex < 0)
                startIndex = 0;

            endIndex++;
            if(endIndex >= pageCount) {
                endIndex = (pageCount - 1)
            }
        }
        const pageRange = endIndex - startIndex + 1
        let pageItems = []
        
        let tmpX = {text:"<<", onClick: () => onIndexSelectFn(0) }
        pageItems.push(tmpX)

        tmpX = {text:"<", onClick: null}
        if(selectedIndex - 1 < 0)
            tmpX.onClick = () => onIndexSelectFn(0)
        else
            tmpX.onClick = () => onIndexSelectFn(selectedIndex - 1)
        pageItems.push(tmpX)

        for(let i = startIndex; i <= endIndex; i++) {
            pageItems.push({
                text: (i + 1).toString(),
                onClick: () => onIndexSelectFn(i)
            })
        }

        tmpX = {text:">", onClick:null}
        if(selectedIndex + 1 >= pageCount)
            tmpX.onClick = function(){onIndexSelectFn(pageCount -1)}
        else
            tmpX.onClick = function(){onIndexSelectFn(selectedIndex + 1)}
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

    static _generateSelectOptions(element, selectID, items) {
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

    static _generateTableRow(index, item) {
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

    static _pageIndexSearch(index) {
        RoleAccess.selectedPageIndex = index;
        _search(Role.Access.partialElement);
    };

    static _search(partialEle) {
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