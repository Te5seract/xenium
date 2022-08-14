// selector
import { xeniumSelector } from "./selector.js";

// helpers
//import { xeniumHelpers } from "./helpers.js";
import XeniumHelpers from "./helpers.js";

export const xeniumContext = (function () {
    var fn = {},
        query = xeniumSelector,
        helper = new XeniumHelpers();

    /**
     * toggles between attribute values, this function
     * takes an array as a parameter and will select the next
     * element in the array in sequential order to replace the value
     * of an attribute
    */
    fn.toggle = function ([node, context, selector, instance]) {
        var sel = selector.replace(/ |{.*?}/g, ""),
            selectors = sel.split(","),
            contextLength = context.length - 1,
            current = [];

        selectors.forEach(selStr => {
            const selType = query.selectorType(selStr);

            if (selType) {
                node.forEach(node => {
                    var value = helper.exe(node, "getAttribute", selType);

                    if (value) {
                        var index = context.indexOf(value),
                            attrVal = index !== contextLength ? context[index + 1] : context[0];

                        current[0] = attrVal;

                        helper.exe(node, "setAttribute", selType, attrVal);
                    }
                });
            }
        });

        return current;
    }

    /**
     * returns and list of data attributes
     *
     * @return {object}
    */
    fn.data = function ([node, context, selector, instance]) {
        var dataSel = `[${selector.replace(/@/g, "")}]`,
            data = {};

        for (let key in node[0].attributes) {
            const attr = node[0].attributes[key];

            if (typeof attr === "object" && attr.name.match(/x-|data-/)) {
                let attrName = attr.name.replace(/x-|data-/, ""),
                    key = helper.changeCase(attrName,  "-", "", "camel");

                attr.nodeValue ? data[key] = attr.nodeValue : null;
            }
        }

        return data;
    }

    /**
     * performs a context function, this will direct
     * an object based context to perform funtions in the
     * "fn" object above
     *
     * @param {array} context
     * this parameter is the entire context parameter which
     * includes the nodelist, context content, string based selector
     * and the xenium instance
     *
     * @return {voic}
    */
    function doFunc ([node, context, selector, instance]) {
        for (let key in context) {
            fn[key]([node, context, selector, instance], context[key]);
        }

        return;
    }

    return {
        ini : function (...params) {
            var [node, context, selector, instance] = params;

            if (context instanceof Array) return fn.toggle(params);

            if (context instanceof Object) {
                doFunc(params);

                return node;
            }

            if (helper.type(context) === "string") return fn[context](params);
        }
    }
})();
