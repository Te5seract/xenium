// selector
import { xeniumSelector } from "./selector.js";

// helpers
import { xeniumHelpers } from "./helpers.js";

export const xeniumContext = (function () {
    function do_context (element, context, instance) {
        console.log(context);
    }

    return {
        ini : function (element, context, instance) {
            do_context(element, context, instance);
        }
    }
})();
