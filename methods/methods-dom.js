import { xeniumHelpers } from "../src/helpers.js";
import { xeniumSelector } from "../src/selector.js";

export const xeniumDom = (function () {
    function methods (proto) {
        var helper = xeniumHelpers,
            query = xeniumSelector;

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
        proto.attr = function (action, value) {
            if (!action | !value) return this;

            var valueItems = value.replace(/ ,|, /g, ",").split(","),
                attrVals = [];

            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < valueItems.length; x++) {

                    // set attribute
                    if (action.match(/set|setAttr|setAttribute|apply/i)) {
                        var values = valueItems[x].split("=");

                        helper.exe(this[i], "setAttribute", values[0], values[1]);
                    }

                    // delete attribute
                    else if (action.match(/del|delAttr|delete|deleteAttribute|remove|removeAttr|removeAttribute/)) {
                        helper.exe(this[i], "removeAttribute", valueItems[x]);
                    }

                    // get attribute
                    else if (action.match(/get|getAttr|getAttribute/)) {
                        attrVals.push(helper.exe(this[i], "getAttribute", valueItems[x]));
                    }
                }
            }

            attrVals = attrVals.filter(Boolean);

            attrVals = attrVals.length === 1 ? attrVals[0] : attrVals;

            return attrVals.length > 0 ? attrVals : false;
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
        proto.classList = function (action, value) {
            var valueItems = value.replace(/ ,|, /g, ",").split(",");

            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < valueItems.length; x++) {

                    // add classes
                    if (action.match(/add|\+/ig)) {
                        helper.exe(
                            helper.exe(this[i], "classList"), // get class list
                            "add", // chain the add method
                            valueItems[x] // param
                        );
                    }

                    // remove classes
                    else if (action.match(/delete|remove|\-/ig)) {
                        helper.exe(
                            helper.exe(this[i], "classList"), // get class list
                            "remove", // chain the remove method
                            valueItems[x] // param
                        );
                    }

                    // swap classes
                    else if (action.match(/swap|switch/ig)) {
                        var swap = valueItems[x].replace(/( |)>( |)/, ">").split(">");
                            
                        helper.exe(
                            helper.exe(this[i], "classList"), // get class list
                            "remove", // chain the remove method
                            swap[0] // param
                        );

                        helper.exe(
                            helper.exe(this[i], "classList"), // get class list
                            "add", // chain the add method
                            swap[1] // param
                        );
                    }

                    // has class
                    else if (action.match(/hasClass|has|contains/ig)) {
                        return helper.exe(
                            helper.exe(this[i], "classList"),
                            "contains",
                            valueItems[x]
                        );
                    }
                }
            }

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
        proto.css = function (css, append) {
            for (let i = 0; i < this.length; i++) {
                append ? this[i].style.cssText += css : this[i].style.cssText = css;
            }

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
        proto.cssValue = function (property, value) {
            for (let i = 0; i < this.length; i++) {
                if (!value) return this[i].style[property];
                else return this[i].style[property] === value;
            }
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
        proto.write = function (method, value, append) {
            for (let i = 0; i < this.length; i++) {
                if (method.match(/html|innerHTML/i)) 
                !append ? this[i].innerHTML = value : this[i].innerHTML += value;

                else if (method.match(/outer|outerHTML/i)) 
                !append ? this[i].outerHTML = value : this[i].outerHTML += value;

                else if (method.match(/text|txt/i)) 
                !append ? this[i].textContent = value : this[i].textContent += value;
            }

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
        proto.make = function (node, amount, attr, append) {
            if (!node) return;

            var amount = !amount ? 1 : amount,
                attrSplit = attr ? attr.replace(/ ,|, /g, ",").split(",") : null,
                nodes = [];

            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < amount; x++) {
                    var newNode = document.createElement(node);

                    if (attr) {
                        for (let j = 0; j < attrSplit.length; j++) {
                            var attrSegs = attrSplit[j].replace(/( |)=( |)/g, "=").split("=");

                            helper.exe(newNode, "setAttribute", attrSegs[0], attrSegs[1]);
                        }
                    }

                    if (!append) nodes.push(newNode);
                    else this[i].append(newNode);
                }
            }

            if (!append) {
                return nodes;
            }

            return this;
        }

        /**
         * appends an element to  the main selector element
         * 
         * @param {array} nodes 
         * 
         * @return {void}
         */
        proto.append = function (...nodes) {
            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < nodes.length; x++) {
                    nodes[x] = helper.unravelArray(nodes[x]);

                    if (nodes[x] instanceof Array) nodes[x] = nodes[x][0];

                    this[i].appendChild(nodes[x]);
                }
            }

            return this;
        }

        /**
         * inserts a node before another node
         * @param {*} node 
         * @param {*} before 
         */
        proto.prepend = function (node, before) {
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
        proto.next = function (amount, ...exclude) {
            var nextElements = helper.nodeRelatives(this[0], "nextElementSibling").filter(Boolean),
                indexes = helper.arrayIndex(helper.htmlToString(nextElements), exclude),
                nextElements = helper.removeArrayIndex(nextElements, indexes),
                next = [],
                amount = amount ? amount - 1 : 0,
                amount = amount > nextElements.length ? nextElements.length - 1 : amount;

            for (let i = 0; i < nextElements.length; i++) {
                if (i === amount) {
                    next.push(nextElements[i]);
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
        proto.prev = function (amount, ...exclude) {
            var previousElements = helper.nodeRelatives(this[0], "previousElementSibling").filter(Boolean),
                indexes = helper.arrayIndex(helper.htmlToString(previousElements), exclude),
                previousElements = helper.removeArrayIndex(previousElements, indexes),
                prev = [],
                amount = amount ? amount - 1 : 0,
                amount = amount > previousElements.length ? previousElements.length - 1 : amount;

            for (let i = 0; i < previousElements.length; i++) {
                if (i === amount) {
                    prev.push(previousElements[i]);
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
        proto.children = function (allChildren) {
            var result;

            if (!allChildren) result = helper.exe(this[0], "children");
            else result = query.selector("* {all}", this[0]);

            return result;
        }

        /**
         * gets the parent nodes of the main selector node
         * 
         * @return {array}
         */
        proto.parents = function () {
            return helper.nodeRelatives(this[0], "parentNode");
        }

        /**
         * gets the dom index for a particular node, intended to be used with the 
         * events method. This method must be stored in a variable to work correctly
         * 
         * @return {int}
         */
        proto.nodeIndex = function () {
            var indexes = [];

            for (let i = 0; i < this.length; i++) {
                var { classList, id } = helper.extractIdentifier(this[i], true),
                    sameElements = query.selector(`${classList+id} {all}`, document);

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
        proto.contains = function (value) {
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
        proto.childOf = function (value, callback) {
            var parents = helper.nodeRelatives(this[0], "parentNode");

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
         * the value can be a classname ir or tagname
         * 
         * @param {function} callback
         * fires a callback function on success
         * 
         * @return {boolean}
         */
        proto.parentOf = function (value, callback) {
            var children = helper.nodeRelatives(this[0], "children");

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
        proto.moveContent = function (moveTo, method, deleteOnMove) {
            var selector = query.selector(moveTo),
                methods = method.split(/ ,|, /g),
                deleteOnMove = deleteOnMove === undefined || deleteOnMove ? true : false;
            
            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < selector.length; x++) { 
                    for (let j = 0; j < methods.length; j++) {

                        if (methods[i].match(/\B\*\B|\Ball\B/)) {
                            var content = this[i].innerHTML;

                            selector[x].innerHTML += content;

                            if (deleteOnMove && x === selector.length - 1) {
                                this[i].innerHTML = "";
                            }
                        } else {
                            var moveItem = query.selector(methods[j], this[i]);

                            for (let z = 0; z < moveItem.length; z++) {
                                selector[x].innerHTML += moveItem[z].outerHTML;

                                if (deleteOnMove && x === selector.length - 1) {
                                    moveItem[z].remove();
                                }
                            }
                        }

                    }

                }
            }
        }
    } // end methods

    return {
        set : function (proto) {
            methods(proto);
        }
    }
})();