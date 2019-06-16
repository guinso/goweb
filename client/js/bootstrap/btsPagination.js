function btsPagination() {}

/**
 * Create Boostrap pagination HTML element
 * @param {String[]} textArr - array of pagination items' display text 
 * @returns {Element} HTML UL element
 */
btsPagination.prototype.buildElement = function(textArr) {
    var element = document.createElement("ul");
    element.classList.add("pagination");

    for (var i = 0; i < textArr.length; i++) {
        var firstPage = document.createElement("li");
        firstPage.classList.add("page-item");

        var firstLink = document.createElement("a");
        firstLink.classList.add("page-link");
        firstLink.innerText = textArr[i];

        firstPage.appendChild(firstLink);

        element.appendChild(firstPage);
    }

    return element;
};

/**
 * Create Boostrap pagination HTML element with additional '<<', '<', '>', and '>>' items
 * @param {Number} selectedIndex - highlighted index item based on total page count, zero based
 * @param {Number} pageSize - number of page items to display
 * @param {Number} totalCount - total number of pages available
 * @param {BtsPaginationHelper~itemSelectedCallback} onIndexSelectFn - handle pagination item is selected
 */
btsPagination.prototype.buildPaginationElement = function(selectedIndex, pageSize, totalCount, onIndexSelectFn) {

    var pageCount = (totalCount / pageSize) + (totalCount % pageSize > 0 ? 1 : 0);
    var startIndex = selectedIndex;
    var endIndex = selectedIndex;
    for (var i = 0; i < 2; i++) {
        startIndex--;
        if (startIndex < 0)
            startIndex = 0;

        endIndex++;
        if (endIndex >= pageCount)
            endIndex = (pageCount - 1);
    }
    var pageRange = endIndex - startIndex + 1;
    var pageItems = [];

    var tmpX = { text: "<<", onClick: function() { onIndexSelectFn(0) } };
    pageItems.push(tmpX);

    var tmpX = { text: "<", onClick: null };
    if (selectedIndex - 1 < 0)
        tmpX.onClick = function() { onIndexSelectFn(0) };
    else
        tmpX.onClick = function() { onIndexSelectFn(selectedIndex - 1) };
    pageItems.push(tmpX);

    for (var i = startIndex; i <= endIndex; i++) {
        pageItems.push({
            text: (i + 1).toString(),
            onClick: function() { onIndexSelectFn(i) }
        });
    }

    var tmpX = { text: ">", onClick: null };
    if (selectedIndex + 1 >= pageCount)
        tmpX.onClick = function() { onIndexSelectFn(pageCount - 1) };
    else
        tmpX.onClick = function() { onIndexSelectFn(selectedIndex + 1) };
    pageItems.push(tmpX);

    pageItems.push({
        text: ">>",
        onClick: function() { onIndexSelectFn(pageCount - 1) }
    })

    var paginationElement = this.buildElementWithEvent(pageItems);
    var hightlightIndex = 2 + (selectedIndex - startIndex);
    this.setActiveItem(paginationElement, hightlightIndex);

    return paginationElement;
};

/**
 * Create simple Bootstrap pagination HTML element
 * @param {Object[]} items - pagination item description
 * @param {String} items[].text - pagination item display text
 * @param {MouseEvent} items[].onClick - pagination item onClick callback handler (no parameter) 
 */
btsPagination.prototype.buildElementWithEvent = function(items) {
    var element = document.createElement("ul");
    element.classList.add("pagination");

    for (var i = 0; i < items.length; i++) {
        var firstPage = document.createElement("li");
        firstPage.classList.add("page-item");

        var firstLink = document.createElement("a");
        firstLink.classList.add("page-link");
        firstLink.innerText = items[i].text;
        firstLink.onclick = items[i].onClick;
        firstLink.href = "javascript:void(0);";

        firstPage.appendChild(firstLink);

        element.appendChild(firstPage);
    }

    return element;
};

/**
 * Set/Change Boostrap pagination highlight item
 * @param {Element} element - Boostrap pagination HTML UL element 
 * @param {Number} index - pagination item's index, zero based
 */
btsPagination.prototype.setActiveItem = function(element, index) {
    var items = element.querySelectorAll("li");

    if (items !== null && items[index] !== null) {
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove("active");
        }

        var x = items[index];
        x.classList.add("active");

        return true;
    }

    return false;
};

/**
 * Modify Boostrap pagination item's content
 * @param {Element} element - HTML pagination element, tagname UL
 * @param {Number} index - pagination item's index location, zero based
 * @param {String} text - pagination item's display text
 * @param {BtsPaginationHelper~itemSelectedCallback} selectFn - callback to handle when item is selected
 */
btsPagination.prototype.setItem = function(element, index, text, selectFn) {
    var items = element.querySelectorAll("li");

    if (items !== null && items[index] !== null) {
        var linkElement = items[index].querySelector("a");

        if (linkElement !== null) {
            linkElement.innerText = text;
            linkElement.onclick = selectFn;

            return true;
        }
    }

    return false;
};

(function() {
    if (typeof BtsPagination === 'undefined') {
        window.BtsPagination = new btsPagination()
    }
})()
//# source=/js/bootstrap/btsPagination.js