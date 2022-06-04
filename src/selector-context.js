// selector
import { xeniumSelector } from "./selector.js";

// helpers
import { xeniumHelpers } from "./helpers.js";

export const xeniumContext = (function () {
    var fn = {},
        query = xeniumSelector,
        helper = xeniumHelpers;

    fn.toggle = function ([node, context, selector, instance]) {
        var sel = selector.replace(/ /, ""),
            selectors = sel.split(","),
            contextLength = context.length - 1;

        selectors.forEach(selStr => {
            const selType = query.selectorType(selStr);

            if (selType) {
                node.forEach((node, i) => {
                    var value = helper.exe(node, "getAttribute", selType);


                    if (value) {
                        var index = context.indexOf(value),
                            attrVal = index !== contextLength ? context[index + 1] : context[0];

                        instance = attrVal;

                        helper.exe(node, "setAttribute", selType, attrVal);
                    }
                });
            }
        });

        return [instance];
    }

    return {
        ini : function (...params) {
            var [node, context, selector, instance] = params;

            if (context instanceof Array) return fn.toggle(params);
        }
    }
})();
