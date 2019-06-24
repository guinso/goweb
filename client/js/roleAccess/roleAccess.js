JxLoader.require('/js/bootstrap/btsButton.js')
JxLoader.require('/js/bootstrap/btsComboBox.js')
JxLoader.require('/js/bootstrap/btsDialogModal.js')
JxLoader.require('/js/bootstrap/btsPagination.js')
JxLoader.require('/css/toggleBtn.css')

function roleAccess() {
    this.selectedPageIndex = 0
    this.pageSize = 10
    this.partial = null
};

roleAccess.prototype.getPartial = function(successFN, failFN) {
    var thisInstance = this

    this._fetchPartial(function(partial){
        var task = new jxPromiseTask(false, [
            JxLoader.getJSONPromiseFN('/api/role'),
            JxLoader.getJSONPromiseFN('/api/access'),
            JxLoader.getJSONPromiseFN('api/role-access'),
            JxLoader.getJSONPromiseFN('/api/role-access-count')
        ])

        JxLoader.runPromise(task)
            .then(function(reponses){
                var roleItems = reponses[0]['response'] //JSON.parse(roleResponse[0]);
                var accessItems = reponses[1]['response'] //JSON.parse(accessResponse[0]);
                var items = reponses[2]['response'] //JSON.parse(roleAccessResponse[0]);
                var itemsCount = reponses[3]['response'] //JSON.parse(roleAccessCntResponse[0])['response'];
                
                thisInstance._renderTable(partial, items)

                thisInstance._generateSelectOptions(partial, "#roleSelect", roleItems)
                thisInstance._generateSelectOptions(partial, "#accessSelect", accessItems)

                //register search button event handler
                partial.querySelector("#roleAccessSearch").onclick = function(e) {
                    e.preventDefault()
                    
                    thisInstance._search(partial)
                }

                //build pagination
                var paginationElement = BtsPagination.buildPaginationElement(
                    thisInstance.selectedPageIndex, 
                    thisInstance.pageSize, 
                    itemsCount.count, 
                    thisInstance._pageIndexSearch)
                var paginationPlaceholder = partial.querySelector("#paginationPlaceholder")
                JxLoader.setElementChild(paginationPlaceholder, paginationElement)

                successFN(partial)
            })
            .catch(failFN)
    }, failFN)
}

roleAccess.prototype._renderTable = function(element, items) {

    var table = document.createElement("table")
    table.innerHTML = '<tr><th>#</th><th>Access</th><th>Role</th>' +
        '<th>Is Authorized</th></tr>'

    for (var i = 0; i < items.length; i++) {
        table.appendChild(this._generateTableRow(i, items[i]))
    }

    table.classList.add("table")

    var container = element.querySelector("#roleAccessTable")
    JxLoader.setElementChild(container, table)
};

roleAccess.prototype._buildPagination = function(selectedIndex, pageSize, totalCount, onIndexSelectFn) {
    var pageCount = (totalCount / pageSize) + (totalCount % pageSize > 0 ? 1 : 0)
    var startIndex = selectedIndex
    var endIndex = selectedIndex
    for (var i = 0; i < 2; i++) {
        startIndex--
        if (startIndex < 0)
            startIndex = 0

        endIndex++
        if (endIndex >= pageCount) {
            endIndex = (pageCount - 1)
        }
    }
    var pageRange = endIndex - startIndex + 1
    var pageItems = []

    var tmpX = { text: "<<", onClick: function(){ onIndexSelectFn(0)} }
    pageItems.push(tmpX)

    tmpX = { text: "<", onClick: null }
    if (selectedIndex - 1 < 0)
        tmpX.onClick = function(){ onIndexSelectFn(0) }
    else
        tmpX.onClick = function(){ onIndexSelectFn(selectedIndex - 1) }
    pageItems.push(tmpX)

    for (var i = startIndex; i <= endIndex; i++) {
        pageItems.push({
            text: (i + 1).toString(),
            onClick: function(){ onIndexSelectFn(i) }
        })
    }

    tmpX = { text: ">", onClick: null }
    if (selectedIndex + 1 >= pageCount)
        tmpX.onClick = function() { onIndexSelectFn(pageCount - 1) }
    else
        tmpX.onClick = function() { onIndexSelectFn(selectedIndex + 1) }
    pageItems.push(tmpX)

    pageItems.push({
        text: ">>",
        onClick: function() { onIndexSelectFn(pageCount - 1) }
    })

    var paginationElement = BtsPagination.buildElementWithEvent(pageItems)
    var hightlightIndex = 2 + (selectedIndex - startIndex)
    BtsPagination.setActiveItem(paginationElement, hightlightIndex)

    return paginationElement;
};

roleAccess.prototype._generateSelectOptions = function(element, selectID, items) {
    var selectEle = element.querySelector(selectID)

    var tmp = document.createElement("option")
    tmp.text = "all"
    tmp.value = ""

    JxLoader.setElementChild(selectEle, tmp)

    for (var i = 0; i < items.length; i++) {
        var tmp = document.createElement("option")
        tmp.text = items[i]['name']
        tmp.value = items[i]['id']

        selectEle.appendChild(tmp)
    }
};

roleAccess.prototype._generateTableRow = function(index, item) {
    var row = document.createElement("tr")

    row.innerHTML = 
        "<td>" + (index + 1) + "</td>" + 
        "<td>" + item['access'] + "</td>" + 
        "<td>" + item['role'] + "</td>" + 
        "<td><input class='tgl tgl-light' id='cb" + index + "'  " + "type='checkbox'/>" +
            "<label class='tgl-btn' for='cb" + index + "'></label></td>"

    row.querySelector("td > input").checked = item['isAuthorize']
    return row
};

roleAccess.prototype._pageIndexSearch = function(index) {
    var thisIntance = this
    return function() {
        thisIntance.selectedPageIndex = index
        thisIntance._search(thisIntance.partial)
    }
};

roleAccess.prototype._search = function(partialEle) {
    var thisInstance = this

    var accessSelectElement = partialEle.querySelector("#accessSelect")
    var roleSelectElement = partialEle.querySelector("#roleSelect")

    var accessID = accessSelectElement.options[accessSelectElement.selectedIndex].value
    var roleID = roleSelectElement.options[roleSelectElement.selectedIndex].value

    JxLoader.getJSON('/api/role-access?accessID=' + accessID + '&roleID=' + roleID,
        function(items){
            thisInstance._renderTable(partialEle, items['response'])
        },
        function(err){
            console.error('Failed to get role access records: ' + err.message)
            var container = element.querySelector("#roleAccessTable")

            container.innerHTML = "<p>opps, failed to retrieve info from server</p>"
        })
};

roleAccess.prototype._fetchPartial = function(successFN, failureFN) {
    var thisInstance = this
    
    if (this._isPartialEmpty()) {
        JxLoader.loadPartial('/js/roleAccess/partial.html', 
        function(partial){
            thisInstance.partial = partial

            //create modal
            var modalEle = BtsDialogModal.buildElement()
            BtsDialogModal.setTitle(modalEle, "Sample Modal Dialog")
            partial.appendChild(modalEle)

            successFN(partial)
        }, 
        failureFN)
    } else {
        successFN(this.partial)
    }
};

roleAccess.prototype._isPartialEmpty = function() {
    return !(this.partial && this.partial.innerHTML !== '')
};

(function(){
    if (typeof RoleAccess === 'undefined') {
        window.RoleAccess = new roleAccess()
    }
})()
//# sourceURL=roleAccess/roleAccess.js