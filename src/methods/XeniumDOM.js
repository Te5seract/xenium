import XeniumRequire from "../classes/XeniumRequire.js";

export default class XeniumDOM extends XeniumRequire {
    /**
     * sets / removes / gets attributes
     * 
     * if the main selector has many nodes selected then this method will
     * return an array. If the main selector only has a single node selected
     * only a single boolean is returned
     * 
     * @param {string} action 
     * the type of action to perform 
     * 
     * to set an attribute: 
     * "set" or "setAttr" or "setAttribute" or "apply"
     * 
     * to delete an attribute:
     * "del" or "delAttr" or "delete" or "deleteAttribute" or "remove" or "removeAttr" or "removeAttribute"
     * 
     * to get an attribute value (if this action is used this method can't be chained):
     * "get" or "getAttr" or "getAttribute"
     * 
     * @param {string} value 
     * each value can be separated by a ","
     * 
     * set attribute value:
     * "class=value" or for multiple: "class=value, title=title-value"
     * 
     * to delete or get an attribute:
     * "title" for multiple: "title, id, class"
     * 
     * @return {any}
     */
    attr (value) {
        const {helper} = super.require("helper");

        if (!value) return this;

        // get or has attr
        if (!value.match(/=/g)) {
            let result = [];

            helper.each(this, node => {
                if (node.hasAttribute(value)) {
                    result.push(node.getAttribute(value));
                }
            });

            result = !result.length ? false : result;

            if (result.length === 1) {
                result = result[0];
            }

            return result;
        }

        // set attr
        if (value.match(/=/g)) {
            const values = value.replace(/, | ,/g, "").split(",");

            values.forEach(value => {
                const pairs = value.split("="),
                    key = pairs[0],
                    val = pairs[1];

                helper.each(this, node => {
                    node.setAttribute(key, val);
                });
            });
        }

        return this;
    }

    /**
     * deletes attributes from html elements or arrays
     *
     * @param {any} values
     * the attributes to delete or the array elements to
     * delete
     *
     * @return {self}
    */
    delete (...values) {
        const {query, helper} = super.require("query", "helper");

        helper.getHook("init_hook", ([node, selector]) => {
            switch (helper.type(selector)) {
                case "array":
                    values.forEach(value => {
                        const index = selector.indexOf(value);

                        if (index !== -1) {
                            delete selector[index];
                        }
                    });

                    selector = selector.filter(sel => sel !== undefined);

                    query.replaceSelector(this, selector);
                    break;
                case "string":
                    helper.each(this, node => {
                        values.forEach(value => {
                            node.removeAttribute(value);
                        });
                    });
                    break;
            }
        });

        return this;
    }

    /**
     * adds / removes / swaps a node's class name(s) or checks if a class exists
     * 
     * @param {string} action 
     * the type of action to perform
     * 
     * to add a class: 
     * "add" or "+"
     * 
     * to remove a class:
     * "delete" or "remove" or "-"
     * 
     * to swap classes:
     * "swap" or "switch"
     * 
     * @param {string} value 
     * each value can be separated by a ","
     * 
     * add or remove class items: "valueA, valueB"
     * 
     * swap a class: "old-valueA > new-valueA, old-valueB > new-valueB"
     * 
     * check if a class exists "has" or "hasClass" or "contains"
     * 
     * @return {any}
     */
    classList (action, value) {
        const {helper} = super.require("helper"),
            valueItems = value.replace(/ /g, "").split(",");

        helper.each(this, node => {
            valueItems.forEach(item => {
                const classList = node.classList;

                if (action.match(/add|\+/ig)) classList.add(item);

                else if (action.match(/delete|remove|-/ig)) classList.remove(item);

                else if (action.match(/hasClass|has|contains/ig)) return classList.contains(item);

                else if (action.match(/swap|switch/ig)) {
                    const swap = item.replace(/( |)>( |)/, ">").split(">");

                    classList.remove(swap[0]);
                    classList.add(swap[1]);
                }
            });
        });

        return this;
    }
    /**
     * adds css to an element
     * 
     * @param {string} css
     * css to apply to the element
     * 
     * @param {boolean} append
     * whether or not to append the css text to already existing text
     * 
     * @return {void}
     */
    css (css, append) {
        const {helper} = super.require("helper");

        helper.each(this, node => {
            append ? node.style.cssText += css : node.style.cssText = css;
        });

        return this;
    }

    /**
     * gets the value of a css property from an element
     * this method can't be chained 
     * 
     * @param {string} property 
     * the css property
     * 
     * @param {string} value
     * (optional) the value of the css property
     * 
     * if this parameter is used it will return a boolean
     * 
     * if this parameter is not used it will return the value of the css property
     *  
     * @return {string|boolean}
     */
    cssValue (property, value) {
        const {helper} = super.require("helper"),
            result = [];

        helper.each(this, node => {
            if (!value) result.push(node.style[property]);
            else result.push(node.style[property] === value);
        });

        return result.length > 1 ? result : result[0];
    }

    /**
     * writes html or text or outerHTML content
     * 
     * @param {string} method 
     * the write method
     * 
     * to write html:
     * "html" or "innerHTML"
     * 
     * to write outer html:
     * "outer" or "outerHTML",
     * 
     * to write text:
     * "text" or "txt"
     * 
     * @param {string} value 
     * text, html or outer html
     * 
     * @param {boolean} append
     * appends the value to pre-existing text
     * 
     * @return {void}
     */
    write (method, value, append) {
        const {helper} = super.require("helper");

        helper.each(this, node => {
            if (method.match(/html|innerHTML/i)) 
                !append ? node.innerHTML = value : node.innerHTML += value;

            else if (method.match(/outer|outerHTML/i)) 
                !append ? node.outerHTML = value : node.outerHTML += value;

            else if (method.match(/text|txt/i)) 
                !append ? node.textContent = value : node.textContent += value;
        });

        return this;
    }

    /**
     * makes elements
     * 
     * if the main query selector has selected one or more nodes a new element
     * will be made for each node in the main selector. The number will multiply 
     * if an amount more than 1 is specified
     * 
     * @param {string} node 
     * the type of elements to make
     * 
     * @param {int} amount 
     * (optional) the amount of elements to make
     * 
     * @param {string} attr 
     * (optional) attributes to give to the new elements. Each attribute can be 
     * separated by a comma, eg: "class=new-element, title=New Element"
     * 
     * @param {boolean} append 
     * (optional) if this parameter is not filled then this method
     * cannot be chained
     * 
     * @return {void|array}
     */
    $make (node, amount) {
        const {helper} = super.require("helper"),
            number = amount ? amount : 1,
            elems = [];

        for (let i = 0; i < number; i++) {
            const make = document.createElement(node);

            elems.push(make);
        }

        return elems;
    }

    /**
     * appends an element to  the main selector element
     * 
     * @param {array} nodes 
     * 
     * @return {void}
     */
    append (...nodes) {
        const {helper} = super.require("helper"),
            nodesList = [];

        nodes.forEach(node => {
            nodesList.push(node[0]);
        });

        for (let i = 0; i < this.length; i++) {
            for (let x = 0; x < nodesList.length; x++) {
                nodesList[x] = helper.unravelArray(nodesList[x]);

                if (nodesList[x] instanceof Array) nodesList[x] = nodesList[x][0];

                this[i].appendChild(nodesList[x]);
            }
        }

        return this;
    }

    /**
     * inserts a node before another node
     * @param {*} node 
     * @param {*} before 
     */
    prepend (node, before) {
        const {query} = super.require("query");

        for (let i = 0; i < node.length; i++) {
            this[0].insertBefore(node[i], query.selector(before)[0]);
        }
    }

    /**
     * selects the node next to the node in the main selector
     * 
     * @param {int} amount
     * how many elements to skip ahead to
     *  
     * @param {string} exclude 
     * what nodes to exclude from being selected
     * 
     * @return {void}
     */
    next (amount, ...exclude) {
        const {query, helper} = super.require("query", "helper"),
            nextElements = helper.nodeRelatives(this[0], "nextElementSibling").filter(Boolean),
            indexes = helper.arrayIndex(helper.htmlToString(nextElements), exclude),
            nextElementsFiltered = helper.removeArrayIndex(nextElements, indexes),
            next = [],
            amountIndex = amount ? amount - 1 : 0,
            amountValid = amountIndex > nextElementsFiltered.length ? nextElementsFiltered.length - 1 : amountIndex;

        for (let i = 0; i < nextElementsFiltered.length; i++) {
            if (i === amountValid) {
                next.push(nextElementsFiltered[i]);
            }
        }

        if (next.length > 0) {
            query.replaceSelector(this, next);
        }

        return this;
    }

    /**
     * selects the node previous to the node in the main selector
     * 
     * @param {int} amount
     * how many elements to skip back to
     *  
     * @param {string} exclude 
     * what nodes to exclude from being selected
     * 
     * @return {void}
     */
    prev (amount, ...exclude) {
        const {query, helper} = super.require("query", "helper"),
            previousElements = helper.nodeRelatives(this[0], "previousElementSibling").filter(Boolean),
            indexes = helper.arrayIndex(helper.htmlToString(previousElements), exclude),
            previousElementsFiltered = helper.removeArrayIndex(previousElements, indexes),
            prev = [],
            amountIndex = amount ? amount - 1 : 0,
            amountFiltered = amountIndex > previousElements.length ? previousElements.length - 1 : amountIndex;

        for (let i = 0; i < previousElementsFiltered.length; i++) {
            if (i === amountFiltered) {
                prev.push(previousElementsFiltered[i]);
            }
        }

        if (prev.length > 0) {
            query.replaceSelector(this, prev);
        }

        return this;
    }

    /**
     * gets child nodes of the main selector
     * 
     * @param {boolean} allChildren 
     * (optional) this is set to false by default returning only the child node(s) of the main selector
     * if it is set to true it will select all child nodes within the main selected node
     * 
     * @return {array}
     */
    children (allChildren) {
        const {query, helper} = super.require("query", "helper");

        let result;

        if (!allChildren) result = helper.exe(this[0], "children");
        else result = query.selector("* {all}", this[0]);

        return result;
    }

    /**
     * gets the parent nodes of the main selector node
     * 
     * @return {array}
     */
    parents () {
        const {helper} = super.require("helper");

        return helper.nodeRelatives(this[0], "parentNode");
    }

    /**
     * gets a parent element from a specified level
     *
     * @param {int} level 
     * the ancestor level to retrieve the parent element from
     *
     * @return {bool|HTMLElement}
    */
    parentLevels (level) {
        const {helper} = super.require("helper");

        let found = false;

        level = level === undefined ? 0 : level;

        helper.nodeRelatives(this[0], "parentNode").forEach((node, i) => {
            if (i === level) {
                found = node;
            }
        });

        return found;
    }

    /**
     * gets the dom index for a particular node, intended to be used with the 
     * events method. This method must be stored in a variable to work correctly
     * 
     * @return {int}
     */
    nodeIndex () {
        const {helper, query} = super.require("helper", "query"),
            indexes = [];

        for (let i = 0; i < this.length; i++) {
            const { classList, id, tag } = helper.extractIdentifier(this[i], true);
            let identifier = 0;

            if (classList && !identifier) identifier = classList;
            else if (id && !identifier) identifier = id;
            else if (tag && !identifier) identifier = tag;

            let sameElements = query.selector(`${identifier} {all}`, document);

            for (let x = 0; x < sameElements.length; x++) {
                if (sameElements[x] === this[i]) indexes.push(x);
            }
        }

        return indexes.length > 1 ? indexes : indexes[0];
    }

    /**
     * checks if the selected element contains another type of element
     * this method cannot be chained
     * 
     * @param {string} value 
     * the element to check the existence of
     * 
     * @return {boolean}
     */
    contains (value) {
        const {query} = super.require("query");

        return query.selector(value, this[0]).length > 0;
    }

    /**
     * checks if the identifier passed into the method is a parent
     * of the element in the main selector
     * 
     * this method cannot be chained
     * 
     * @param {string} value 
     * the value can be a classname id or tagname
     * 
     * @param {function} callback
     * fires a callback function on success
     * 
     * @return {boolean}
     */
    childOf (value, callback) {
        const {helper} = super.require("helper"),
            parents = helper.nodeRelatives(this[0], "parentNode");

        callback ? callback(parents) : null;

        return helper.elementIdentifier(parents, value);
    }

    /**
     * checks if the identifier passed into the method is a child
     * of the element in the main selector
     * 
     * this method cannot be chained
     * 
     * @param {string} value 
     * the value can be a classname or tagname
     * 
     * @param {function} callback
     * fires a callback function on success
     * 
     * @return {boolean}
     */
    parentOf (value, callback) {
        const {helper} = super.require("helper"),
            children = helper.nodeRelatives(this[0], "children");

        callback ? callback(children) : null;

        return helper.elementIdentifier(children, value);
    }

    /**
     * moves the contents of an element from one element to another
     * 
     * @param {string|object} moveTo 
     * the element to move the content to (flags can be used with this)
     * 
     * multiple destination elements can be selected: ".elem1, .elem2 {all}, .elem3"
     * 
     * @param {string} method 
     * to move all content:
     * "*" or "all"
     * 
     * to move specific content specify the classname, id, tagname or 
     * [attribue="value"] (flags can be used with this) eg:
     * 
     * "div {all}"
     * 
     * multiple elements can be selected:
     * 
     * "img, .elem1, .elem2 {all}"
     * 
     * @return {void}
     */
    moveContent (moveTo, method, deleteOnMove) {
        const {helper, query} = super.require("helper", "query"),
            selector = query.selector(moveTo),
            methods = method.split(/ ,|, /g),
            isDeleteOnMove = deleteOnMove === undefined || deleteOnMove ? true : false;
        
        for (let i = 0; i < this.length; i++) {
            for (let x = 0; x < selector.length; x++) { 
                for (let j = 0; j < methods.length; j++) {

                    if (methods[i].match(/\B\*\B|\Ball\B/)) {
                        var content = this[i].innerHTML;

                        selector[x].innerHTML += content;

                        if (isDeleteOnMove && x === selector.length - 1) {
                            this[i].innerHTML = "";
                        }
                    } else {
                        var moveItem = query.selector(methods[j], this[i]);

                        for (let z = 0; z < moveItem.length; z++) {
                            selector[x].innerHTML += moveItem[z].outerHTML;

                            if (isDeleteOnMove && x === selector.length - 1) {
                                moveItem[z].remove();
                            }
                        }
                    }

                }

            }
        }
    }

    /**
     * checks if a selected node has a particular data attribute with
     * a particular value
     *
     * x(node).isDataType("x-example", "value");
     * 
     * @param {string} dataAttr
     * the attribute name
     *
     * @param {string} value
     * the attribute value
     *
     * @return {boolean}
    */
    isDataType (dataAttr, value) {
        const attributes = this[0].attributes,
            keys = Object.keys(attributes);

        dataAttr = dataAttr.replace(/@/gm, "");

        if (!this[0].dataset[dataAttr]) {
            for (let i = 0; i < keys.length; i++) {
                const nodeName = attributes[keys[i]].nodeName,
                    nodeValue = attributes[keys[i]].nodeValue;

                if (nodeName === dataAttr && nodeValue === value) {
                    return true;
                }
            }
        } else {
            if (this[0].dataset[dataAttr] === value) {
                return true;
            }
        }

        return false;
    }
} // end class
