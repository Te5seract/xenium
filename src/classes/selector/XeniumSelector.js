import XeniumRequire from "../XeniumRequire.js";
import XeniumFlags from "./XeniumFlags.js";

export default class XeniumSelector extends XeniumFlags {
    constructor () {
        super();
         
        this.libs = new XeniumRequire();
    }

    ////////////////////////////////
    // private

    /**
     * evaluates the selector and shuttles its
     * value to a different place depending on what it is
     *
     * @param {any} selector
     * the query selector
     *
     * @param {object} within
     * used internally expecting the "this" keyword
     *
     * @return {array}
    */
    _prepare (selector, within) {
        const {helper} = this.libs.require("helper"),
            type = helper.type(selector);

        let nodes = [];

        switch (type) {
            case "html":
                nodes.push(selector);
                break;
            case "node-list":
            case "array":
            case "xenium":
                helper.each(selector, node => {
                    nodes.push(node);
                });
                break;
            case "string":
                const selSplit = selector.replace(/ /g, "").split(",");

                selSplit.forEach(sel => {
                    const shortHand = this._shortHand(selector);

                    if (helper.type(shortHand) === "string") {
                        selector = this._storeFlag(sel);

                        const queried = this._query(selector, within)

                        if (helper.type(queried) === "html") {
                            nodes.push(queried);
                            return;
                        }

                        queried.forEach(node => nodes.push(node));
                    } else {
                        nodes.push(shortHand);
                    }
                });
                break;
        }

        return nodes;
    }

    /**
     * short hand selector for either the document body or window
     *
     * @param {string} selector
     * the string to test for the {w} or {b} short hand selectors
     *
     * @return {string|object}
    */
    _shortHand (selector) {
        if (!selector.match(/^{.*?}$/)) return selector;

        if (selector.match(/w/i)) return window;
        else if (selector.match(/b/i)) return document.body;
    }

    /**
     * stores the selector flag in the current instance
     * of this class call
     *
     * @param {string} selector
     * the query selector to get the flag from
     *
     * @return {string}
    */
    _storeFlag (selector) {
        if (!selector.match(/{.*?}/g)) {
            this.flag = this._flagType("none");

            return selector
        }

        const flagSplit = selector.replace(/ |}/g, "").split("{"),
            flag = flagSplit[1];

        this.flag = this._flagType(flag);

        return flagSplit[0];
    }

    /**
     * prepares the selector ensuring that it's valid,
     * eg: the formatting is correct ".class", "#id", 
     * "@attr" or "[attr]"
     *
     * @param {string} selector
     * the selector to prepare and validate
     *
     * @param {object} within
     * used internally expecting the "this" keyword
     *
     * @return {string}
    */
    _query (selector, within) {
        const validSelector = this._validateSelector(selector);

        return this._doFlag(this.flag, validSelector, within);
    }

    /**
     * validates the query selector if no identifier is
     * present, eg: ".", "#", "@" or "[]"
     *
     * @param {string} selector
     * the selector string
     *
     * @return {string}
    */
    _validateSelector (selector) {
        if (selector.match(/\.|#|\[.*?\]/)) return selector;

        const validated = {
            tag : selector,
            className : `.${selector}`,
            id : `#${selector}`,
            attr : `[${selector.replace(/@/g, "")}]`,
            set : function () {
                for (let key in this) {
                    try {
                        const elem = document.querySelector(this[key]);

                        if (elem) return this[key];
                    } catch (e) {
                    }
                }
            }
        }

        return validated.set();
    }

    /**
     * sets the default within element if the
     * within param is undefined then within will
     * be document
     *
     * @param {HTMLElement} within 
     * the element to query from within
     *
     * @return {object}
    */
    _within (within) {
        return within ? within : document;
    }

    /**
     * query selector this will place all queried
     * nodes into an array for accessibility when
     * it's later processed
     *
     * @param {string} selector
     * the validated query selector
     *
     * @param {HTMLElement} within 
     * the element to query from within
     *
     * @return {array}
    */
    _selector (selector, within) {
        const nodes = within.querySelectorAll(selector),
            nodeList = [];

        nodes.forEach(node => nodeList.push(node));

        return nodeList;
    }

    ////////////////////////////////
    // public

    /**
     * the xenium query selector
     *
     * @param {any} selector
     * the main query selector
     *
     * @param {object} within
     * used internally expecting the "this" keyword
     *
     * @return {array}
    */
    selector (selector, within) {
        const {helper} = this.libs.require("helper");

        within = this._within(within);


        return helper.unravelArray(this._prepare(selector, within));
    }

    /**
     * replaces the current selector with a new object
     * 
     * @param {object} oldSelector 
     * a reference to the main selector, expects "this" keyword
     * 
     * @param {object} newSelector 
     * an object to replace the main selector with
     */
    replaceSelector (oldSelector, newSelector) {
        if (!newSelector || !newSelector instanceof Array || !newSelector.length) newSelector = [newSelector];

        for (let i = 0; i < oldSelector.length; i++) delete oldSelector[i];

        for (let i = 0; i < newSelector.length; i++) oldSelector[i] = newSelector[i];

        oldSelector.length = newSelector.length;
    }

    /**
     * updates the content displayed in the main selector
     * 
     * @param {object} oldSelector 
     * a reference to the main selector, typically expects "this" keyword
     * 
     * @param {string} newSelector 
     * the selector to update to
     * 
     * @return {void}
     */
    updateSelector (oldSelector, newSelector) {
        let nodes = [];

        const {helper} = this.libs.require("helper");

        // if the selector is a number send it to the nodes array
        if (helper.type(newSelector) === "number") nodes.push(newSelector);

        // get all the queried nodes and place them into the nodes array
        for (let i = 0; i < oldSelector.length; i++) {
            if (this.selector(newSelector, oldSelector[i])) {
                for (let x = 0; x < this.selector(newSelector, oldSelector[i]).length; x++) {
                    nodes.push(this.selector(newSelector, oldSelector[i])[x]);
                }
            }
        }

        // remove what is currently displayed in the main selector
        for (let i = 0; i < oldSelector.length; i++) delete oldSelector[i];

        // if the nodes array is empty make it null
        if (nodes.length === 0) nodes = null;

        // if there are nodes pass them to the main selector
        if (nodes) {
            if (!nodes.length) nodes = [nodes];

            for (let i = 0; i < nodes.length; i++) oldSelector[i] = nodes[i];
        
            oldSelector.length = nodes.length;
        } 

        if (!nodes) oldSelector.length = 0;
    }

    /**
     * gets the selector type
     *
     * @param {string} selector
     * the selector string
     *
     * @return {string|boolean}
    */
    selectorType (selector) {
        var type = "";

        if (selector.match(/\./g)) {
            type = "class";
        }
        else if (selector.match(/#/g)) {
            type = "id";
        }
        else if (selector.match(/@|\[.*?\]/g)) {
            type = selector.replace(/@|\[\]/g, "");
        } else {
            type = false;
        }

        return type;
    }

    /**
     * gets the selected elements from the instance
     * and turns the instance into an ordinary array
     *
     * @param {object} instance
     * the xenium object (usually use "this" keyword within library)
     *
     * @return {array}
    */
    getNodes (instance) {
        let nodes = [];

        for (let i = 0; i < instance.length; i++) {
            nodes.push(instance[i]);
        }

        return nodes;
    }
} // end class
