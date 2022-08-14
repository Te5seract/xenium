// classes
import MethodBuilder from "./classes/MethodBuilder.js";
import XeniumRequire from "./classes/XeniumRequire.js";

// methods
import XeniumDOM from "./methods/XeniumDOM.js";
import XeniumQuery from "./methods/XeniumQuery.js";
import XeniumEvents from "./methods/XeniumEvents.js";
import XeniumMisc from "./methods/XeniumMisc.js";

// context
import { xeniumContext } from "./selector-context.js";

export const x = (function () {
    const wrapper = [],
        proto = Xenium.prototype,
        {helper, query} = new XeniumRequire().require("helper", "query");

    let sel;

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
            query.replaceSelector(this, xeniumContext.ini(element, context, selector, this));
        }

        helper.setHook("init_hook", query.selector(selector), selector);
    }

    proto.splice = wrapper.splice;

    /**
     * @param {array|number|string|object} selector
     * if nothing is passed into the main selector, the main selector
     * will be #document
     * 
     * @return {array|number}
     */
    sel = function (selector, context) {
        if (selector && !context){
            return new Xenium(query.selector(selector), selector);
        } 
        else if (context) {
            const xenium = new Xenium(query.selector(selector), selector, context);

            return xenium.length > 1 ? xenium : xenium[0];
        } 

        const xenium = new Xenium([document]);

        helper.setHook("instance_hook", xenium);

        return xenium;
    }

    //const method = new MethodBuilder(proto, sel);
    const props = { proto : proto, sel : sel },
        method = new MethodBuilder(props, {
            "XeniumDOM" : XeniumDOM,
            "XeniumQuery" : XeniumQuery,
            "XeniumEvents" : XeniumEvents,
            "XeniumMisc" : XeniumMisc
        });

    // misc methods
    //xeniumMisc.set(proto, sel);

    return sel;
})();

window.x = x;
