import { xeniumSelector } from "../src/selector.js";
import { xeniumHelpers } from "../src/helpers.js";

// context
import { xeniumContext } from "../src/selector-context.js";

export const xeniumQuery = (function () {
    var query = xeniumSelector,
        helper = xeniumHelpers;

    function methods (proto) {
        /**
         * gets nodes from within a parent node
         * 
         * @param {string|number|array} selector 
         * the node identifier if a number or array is passed in it 
         * will output either a number or array
         * 
         * @return {array|number}
         */
        proto.within = function (selector) {
            query.updateSelector(this, selector);

            this.__proto__.selectorString = function () {
                return selector;
            }

            return this;
        }

        /**
         * goes to a node local to the main selector
         * 
         * @param {string} direction 
         * the direction the desired node is in
         * 
         * go to parent node:
         * "parents" or "parent" or "up"
         * 
         * go to child node:
         * "children" or "child" or "down"
         * 
         * go to the next node:
         * "next" or "right"
         * 
         * go to the previous node:
         * "prev" or "previous" or "left"
         * 
         * @param {string} identifier 
         * the node identifier to go to
         * 
         * @return {void}
         */
        proto.goto = function (direction, identifier) {
            if (direction.match(/parents|parent|up/ig)) {
                query.replaceSelector(this, helper.arrayGet("nodes", helper.nodeRelatives(this[0], "parentNode"), identifier));
            }
            else if (direction.match(/children|child|down/ig)) {
                var children = this[0].querySelectorAll("*");

                query.replaceSelector(this, helper.arrayGet("nodes", children, identifier));
            }
            else if (direction.match(/next|right/ig)) {
                query.replaceSelector(this, helper.arrayGet("nodes", helper.nodeRelatives(this[0], "nextElementSibling"), identifier));
            }
            else if (direction.match(/prev|previous|left/ig)) {
                query.replaceSelector(this, helper.arrayGet("nodes", helper.nodeRelatives(this[0], "previousElementSibling"), identifier));
            }

            this.__proto__.selectorString = function () {
                return identifier;
            }

            return this;
        }

        /**
         * replaces the main selector nodes with ones specified 
         * 
         * @param {string|array|object|number} selector 
         * 
         * @return {void}
         */
        proto.query = function (selector, context) {
            query.replaceSelector(this, query.selector(selector));

            this.__proto__.selectorString = function () {
                return selector;
            }

            if (context) {
                query.replaceSelector(this, xeniumContext.ini(this, context, this));
            }
            
            return this;
        }

        /**
         * removes items from the query selector that has a particular 
         * type of identifier
         * 
         * @param {string} selector 
         * multiple selectors can be used so long as they're split by
         * a comma
         * 
         * @return {void}
         */
        proto.exclude = function (selector) {
            var selectorSplit = selector.split(",");

            for (let i = 0; i < selectorSplit.length; i++) {
                var exclude = query.selector(selectorSplit[i]),
                    newQuery = [];

                for (let x = 0; x < this.length; x++) {
                    if (this[x] !== exclude[0]) {
                        newQuery.push(this[x]);
                    }
                }

                query.replaceSelector(this, newQuery);
            }

            return this;
        }

        /**
         * applies a flag to each node in the main selector
         * 
         * @param {string} delimiter 
         * what to separate each flag values with
         * 
         * @param  {...any} flag 
         * the flag to use
         * 
         * to get groups: flag("&", 1, 5, 12) will act like "elem {1 & 5 & 12}"
         * 
         * @return {void}
         */
        proto.flag = function (delimiter, ...flag) {
            if (!this.__proto__.selectorString() || typeof this.__proto__.selectorString() === "object") return this;

            var selector = this.__proto__.selectorString().replace(/( |){.*?}( |)/g, "").split(",");

            for (let i = 0; i < this.length; i++) {
                if (!helper.elementIdentifier(this[i], selector)) {
                    var node = this[0];

                    this.__proto__.selectorString = function () {
                        return helper.getElementIdentifier(node);
                    }
                }
            }

            selector = this.__proto__.selectorString().replace(/( |){.*?}( |)/g, "").split(",");

            var delimiter = delimiter ? delimiter : " ",
                newQuery = "";

            for (let i = 0; i < selector.length; i++) {
                var newSelector = i !== selector.length - 1 ? selector[i]+`{${flag.join(delimiter)}}, ` : selector[i]+`{${flag.join(delimiter)}}`;

                newQuery += newSelector;
            }

            query.replaceSelector(this, query.selector(newQuery));

            return this;
        }

        /**
         * gets the inner content of an iframe
         * 
         * @param {string} part 
         * (optional) gets the part of an iframe
         * if this parameter is not used it will just return the 
         * iframe document object
         * 
         * to get the head: "head" or "header" or "h"
         * 
         * to get the boyd: "body" or "b"
         * 
         * @return {void}
         */
        proto.iframe = function (part) {
            for (let i = 0; i < this.length; i++) {
                if (part && part.match(/head|header|h/)) query.replaceSelector(this, this[i].contentDocument.head);
                else if (part && part.match(/body|b/)) query.replaceSelector(this, this[i].contentDocument.body);
                else query.replaceSelector(this, this[i].contentDocument);
            }

            return this;
        }
    }

    return {
        /**
         * binds the methods into the library
         * 
         * @param {object} proto 
         * the xenium prototype
         */
        set : function (proto) {
            methods(proto);
        }
    }
})();