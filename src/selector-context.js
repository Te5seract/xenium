// selector
import { xeniumSelector } from "./selector.js";

// helpers
import { xeniumHelpers } from "./helpers.js";

export const xeniumContext = (function () {
    var fn = {},
        query = xeniumSelector,
        helper = xeniumHelpers;

    /**
     * toggles between attribute values, this function
     * takes an array as a parameter and will select the next
     * element in the array in sequential order to replace the value
     * of an attribute
    */
    fn.toggle = function ([node, context, selector, instance]) {
        var sel = selector.replace(/ /, ""),
            selectors = sel.split(","),
            contextLength = context.length - 1,
            current = [];

        selectors.forEach(selStr => {
            const selType = query.selectorType(selStr);

            if (selType) {
                node.forEach((node, i) => {
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

    return {
        ini : function (...params) {
            var [node, context, selector, instance] = params;

            if (context instanceof Array) return fn.toggle(params);

            if (helper.type(context) === "string") return fn[context](params);
        }
    }
})();
