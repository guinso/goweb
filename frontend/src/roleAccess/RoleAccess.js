import rawPartial from '!!raw-loader!./partial.html'
import * as JxHelper from '../helper/jxHelper'
import {jx} from '@guinso/jx'
import * as bts from '@guinso/bts'

export class RoleAccess {
    constructor() {
        this.selectedPageIndex = 0
        this.pageSize = 10
        this.partial = null
    }

    async getPartial() {
        let thisInstance = this
        
        if (!this.partial) {
            this.partial = JxHelper.parseHTMLString(rawPartial)
            
            //create modal
            var modalEle = bts.makeDialogModal({
                title: "Sample Modal Dialog"
            }) 
            this.partial.appendChild(modalEle)
        }

        let tasks = []
        tasks.push(jx.request.getJSONPromise('/api/role'))
        tasks.push(jx.request.getJSONPromise('/api/access'))
        tasks.push(jx.request.getJSONPromise('/api/role-access'))
        tasks.push(jx.request.getJSONPromise('/api/role-access-count'))

        let responses = await Promise.all(tasks)
        let roleItems = responses[0]['response'] //JSON.parse(roleResponse[0]);
        let accessItems = responses[1]['response'] //JSON.parse(accessResponse[0]);
        let items = responses[2]['response'] //JSON.parse(roleAccessResponse[0]);
        let itemsCount = responses[3]['response'] //JSON.parse(roleAccessCntResponse[0])['response'];

        this._renderTable(this.partial, items)

        this._generateSelectOptions(this.partial, "#roleSelect", roleItems)
        this._generateSelectOptions(this.partial, "#accessSelect", accessItems)

        //register search button event handler
        this.partial.querySelector("#roleAccessSearch").onclick = function(e) {
            e.preventDefault()

            thisInstance._search(partial)
        }

        //build pagination
        // let paginationElement = BtsPagination.buildPaginationElement(
        //     this.selectedPageIndex,
        //     this.pageSize,
        //     itemsCount.count,
        //     this._pageIndexSearch)
        let paginationElement = bts.makePagination({
            selectedIndex: this.selectedPageIndex,
            pageSize: this.pageSize,
            totalCount: itemsCount.count,
            onIndexSelectFn: this._pageIndexSearch
        })
        let paginationPlaceholder = this.partial.querySelector("#paginationPlaceholder")
        paginationPlaceholder.innerHTML = ""
        paginationPlaceholder.appendChild(paginationElement)
        
        return this.partial
    }

    _renderTable(element, items) {

        let table = document.createElement("table")
        table.innerHTML = '<tr><th>#</th><th>Access</th><th>Role</th>' +
            '<th>Is Authorized</th></tr>'

        for (let i = 0; i < items.length; i++) {
            table.appendChild(this._generateTableRow(i, items[i]))
        }

        table.classList.add("table")

        let container = element.querySelector("#roleAccessTable")
        container.innerHTML = ''
        container.appendChild(table)
    };

    _buildPagination(selectedIndex, pageSize, totalCount, onIndexSelectFn) {
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

        var tmpX = { text: "<<", onClick: function() { onIndexSelectFn(0) } }
        pageItems.push(tmpX)

        tmpX = { text: "<", onClick: null }
        if (selectedIndex - 1 < 0)
            tmpX.onClick = function() { onIndexSelectFn(0) }
        else
            tmpX.onClick = function() { onIndexSelectFn(selectedIndex - 1) }
        pageItems.push(tmpX)

        for (var i = startIndex; i <= endIndex; i++) {
            pageItems.push({
                text: (i + 1).toString(),
                onClick: function() { onIndexSelectFn(i) }
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

    _generateSelectOptions(element, selectID, items) {
        var selectEle = element.querySelector(selectID)

        var tmp = document.createElement("option")
        tmp.text = "all"
        tmp.value = ""

        selectEle.innerHTML = ''
        selectEle.appendChild(tmp)

        for (var i = 0; i < items.length; i++) {
            var tmp = document.createElement("option")
            tmp.text = items[i]['name']
            tmp.value = items[i]['id']

            selectEle.appendChild(tmp)
        }
    };

    _generateTableRow(index, item) {
        var row = document.createElement("tr")

        row.innerHTML =
            "<td>" + (index + 1) + "</td>" +
            "<td>" + item['access'] + "</td>" +
            "<td>" + item['role'] + "</td>" 

        var tmp = bts.makeToggleCheckbox({
            value: item['isAuthorize'],
            id: 'cb' + index
        })

        let tmpTD = document.createElement('td')
        tmpTD.appendChild(tmp)

        row.appendChild(tmpTD)

        return row
    };

    _pageIndexSearch(index) {
        var thisIntance = this
        return function() {
            thisIntance.selectedPageIndex = index
            thisIntance._search(thisIntance.partial)
        }
    };

    _search(partialEle) {
        var thisInstance = this

        var accessSelectElement = partialEle.querySelector("#accessSelect")
        var roleSelectElement = partialEle.querySelector("#roleSelect")

        var accessID = accessSelectElement.options[accessSelectElement.selectedIndex].value
        var roleID = roleSelectElement.options[roleSelectElement.selectedIndex].value

        jx.request.getJSON('/api/role-access?accessID=' + accessID + '&roleID=' + roleID,
            function(items) {
                thisInstance._renderTable(partialEle, items['response'])
            },
            function(err) {
                console.error('Failed to get role access records: ' + err.message)
                var container = element.querySelector("#roleAccessTable")

                container.innerHTML = "<p>opps, failed to retrieve info from server</p>"
            })
    };

}