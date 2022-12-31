import XeniumRequire from "../classes/XeniumRequire.js";

export default class XeniumQuery extends XeniumRequire {
    /**
     * gets nodes from within a parent node
     * 
     * @param {string|number|array} selector 
     * the node identifier if a number or array is passed in it 
     * will output either a number or array
     * 
     * @return {array|number}
     */
    within (selector, ctx) {
        const {query, context} = super.require("query", "context");

        query.updateSelector(this, selector);

        if (ctx) {
            query.replaceSelector(this, context.ini(query.getNodes(this), ctx, selector, this));
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
    goto (direction, identifier) {
        const {query, helper} = super.require("query", "helper");

        if (direction.match(/parents|parent|up/ig)) {
            query.replaceSelector(this, helper.arrayGet("nodes", helper.nodeRelatives(this[0], "parentNode"), identifier));
        }
        else if (direction.match(/children|child|down/ig)) {
            const children = this[0].querySelectorAll("*");

            query.replaceSelector(this, helper.arrayGet("nodes", children, identifier));
        }
        else if (direction.match(/next|right/ig)) {
            query.replaceSelector(this, helper.arrayGet("nodes", helper.nodeRelatives(this[0], "nextElementSibling"), identifier));
        }
        else if (direction.match(/prev|previous|left/ig)) {
            query.replaceSelector(this, helper.arrayGet("nodes", helper.nodeRelatives(this[0], "previousElementSibling"), identifier));
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
    query (selector, ctx) {
        const {query, context} = super.require("query", "context");

        query.replaceSelector(this, query.selector(selector));

        if (ctx) {
            query.replaceSelector(this, context.ini(query.selector(selector), ctx, selector, this));
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
    exclude (...selector) {
        const {query, helper} = super.require("query", "helper");

        for (let i = 0; i < selector.length; i++) {
            var exclude = query.selector(selector[i]),
                newQuery = [];

            helper.each(this, node => {
                if (exclude.indexOf(node) === -1) {
                    newQuery.push(node);
                }
            });

            query.replaceSelector(this, newQuery);
        }

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
    iframe (part) {
        const {query} = super.require("query");

        for (let i = 0; i < this.length; i++) {
            if (part && part.match(/head|header|h/)) query.replaceSelector(this, this[i].contentDocument.head);
            else if (part && part.match(/body|b/)) query.replaceSelector(this, this[i].contentDocument.body);
            else query.replaceSelector(this, this[i].contentDocument);
        }

        return this;
    }
} // end class
