// selector
import { xeniumSelector } from "./selector.js";

// helpers
import { xeniumHelpers } from "./helpers.js";

// methods
import { xeniumQuery } from "../methods/methods-query.js";
import { xeniumDom } from "../methods/methods-dom.js";
import { xeniumEvents } from "../methods/methods-events.js";
import { xeniumMisc } from "../methods/methods-misc.js";

// context
import { xeniumContext } from "./selector-context.js";

export const x = (function () {
    var wrapper = [],
        sel,
        proto = Xenium.prototype,
        query = xeniumSelector,
        helper = xeniumHelpers;

    function Xenium (element, selector, context) {
        if (!element) return [];

        this.__proto__.selectorString = function () {
            return selector
        }

        for (let i = 0; i < element.length; i++) {
            this[i] = element[i];
        }

        this.length = element.length;

        if (context) {
            query.replaceSelector(this, xeniumContext.ini(element, context, this));
        }
    }

    proto.splice = wrapper.splice;

    // query methods 
    xeniumQuery.set(proto);

    // dom methods
    xeniumDom.set(proto);

    // events
    xeniumEvents.set(proto);

    // misc methods
    xeniumMisc.set(proto);

    /**
     * @param {array|number|string|object} selector
     * if nothing is passed into the main selector, the main selector
     * will be #document
     * 
     * @return {array|number}
     */
    sel = function (selector, context) {
        if (selector && !context) return new Xenium(query.selector(selector), selector);
        else if (context) {
            var xenium = new Xenium(query.selector(selector), selector, context);

            return xenium.length > 1 ? xenium : xenium[0];
        } 

        return new Xenium([document]);
    }

    return sel;
})();