export class BtsHelper {
    /**
     * Create Boostrap button HTML element
     * @param {String} innerText - button display text 
     * @param {String} btnClass - additional Boostrap button CSS class 
     * @returns {Element} HTML BUTTON element
     */
    static buildButton(innerText, btnClass) {
        var element = document.createElement('button');
        element.type = 'button';
        element.classList.add('btn');

        if (btnClass !== '') {
            element.classList.add(btnClass.toLowerCase());
        }

        if (innerText !== '') {
            element.innerText = innerText;
        }
    };

    /**
     * Empty HTML element child(ren)
     * @param {Element} element - HTML element
     */
    static emptyChild(element) {
        while (element.firstChild)
            element.removeChild(element.firstChild);
    }
}

export class BtsPaginationHelper {

    /**
     * Create Boostrap pagination HTML element
     * @param {String[]} textArr - array of pagination items' display text 
     * @returns {Element} HTML UL element
     */
    static buildElement(textArr) {
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
    static buildPaginationElement(selectedIndex, pageSize, totalCount, onIndexSelectFn) {

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
    }

    /**
     * Create simple Bootstrap pagination HTML element
     * @param {Object[]} items - pagination item description
     * @param {String} items[].text - pagination item display text
     * @param {MouseEvent} items[].onClick - pagination item onClick callback handler (no parameter) 
     */
    static buildElementWithEvent(items) {
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
    static setActiveItem(element, index) {
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
    static setItem(element, index, text, selectFn) {
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
}

export class BtsDialogModalHelper {

    /**
     * Create an empty Boostrap Modal HTML element, tagname is DIV
     * @returns {Element} Boostrap modal HTML element, tagname is DIV
     */
    static buildElement() {
        var element = document.createElement("div");
        element.classList.add('modal');
        element.setAttribute('role', 'dialog');

        var doc = document.createElement('div');
        doc.classList.add('modal-dialog');
        doc.setAttribute('role', 'document');

        var content = document.createElement('div');
        content.classList.add('modal-content');

        var header = document.createElement('div');
        header.classList.add('model-header');

        var body = document.createElement('div');
        body.classList.add('modal-body');

        var footer = document.createElement('div');
        footer.classList.add('modal-footer');

        //decorate header
        var title = document.createElement('h5');
        title.classList.add('modal-title');
        var closeBtn = document.createElement('button');
        closeBtn.classList.add('close');
        closeBtn.type = 'button';
        closeBtn.setAttribute('data-dismiss', 'modal');
        closeBtn.setAttribute('aria-label', 'Close');
        var closeSpan = document.createElement('span');
        closeSpan.setAttribute('aria-hidden', true);
        closeSpan.innerText = "&times;";
        closeBtn.appendChild(closeSpan);

        header.appendChild(title);
        header.appendChild(closeBtn);

        element.appendChild(doc);
        doc.appendChild(content);
        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(footer);

        return element;
    }

    /**
     * Set Boostrap dialog modal's title
     * @param {Element} element - HTML DIV element
     * @param {String} title - Modal title 
     */
    static setTitle(element, title) {
        var titleElement = element.querySelector('.modal-title');

        if (titleElement !== null) {
            titleElement.innerText = title;
        }
    };

    /**
     * Get Boostrap dialog modal's body element
     * @param {Element} element - HTML DIV element
     * @return {Element}  HTML DIV element
     */
    static getBody(element) {
        return element.querySelector('.modal-body');
    }

    /**
     * Get Boostrap dialog modal's footer element
     * @param {Element} element - HTML DIV element
     * @return {Element}  HTML DIV element
     */
    static getFooter(element) {
        return element.querySelector('.modal-footer');
    }

    /**
     * Get Boostrap dialog modal's header element
     * @param {Element} element - HTML DIV element
     * @return {Element}  HTML DIV element
     */
    static getHeader(element) {
        return element.querySelector('.modal-header');
    }
}

export class BtsComboboxHelper {

    /**
     * Build bootstrap combox element
     * @param {object[]} items - combobox's item description
     * @param {string} items[].text - combobox item's display name
     * @param {string} items[].value - combobox item's value written in HTML tag 
     */
    static buildElement(items) {
        var element = document.createElement('select');
        element.classList.add('form-control');

        for (var i = 0; i < items.length; i++) {
            var option = document.createElement('option');
            option.innerText = items[i]['text'];
            option.value = items[i]['value'];

            element.appendChild(option);
        }

        return element;
    }

    /**
     * Rebuild existing combobox element's content
     * @param {Element} element - HTML combobox, tagname is SELECT 
     * @param {object[]} items - combobox's item description
     * @param {string} items[].text - combobox item's display name
     * @param {string} items[].value - combobox item's value written in HTML tag 
     */
    static rebuildItems(element, items) {
        while (element.firstChild)
            element.removeChild(element.firstChild);

        for (var i = 0; i < items.length; i++) {
            var option = document.createElement('option');
            option.innerText = items[i]['text'];
            option.value = items[i]['value'];

            element.appendChild(option);
        }

        return element;
    }
}
//# sourceURL=btsHelper.js