// selector
import XeniumSelector from "./selector/XeniumSelector.js";

// helpers
//import { xeniumHelpers } from "../helpers.js";
import XeniumHelpers from "../helpers.js";

// context
import { xeniumContext } from "../selector-context.js";

export default class XeniumRequire {
    constructor (...require) {
        this.required = {};

        require.forEach(req => {
            if (req.match(/helpers|helper/i)) {
                this.required[req] = this.helpers();
            }
            else if (req.match(/query|selector/i)) {
                this.required[req] = this.selector();
            }
            else if (req.match(/context/i)) {
                this.required[req] = this.context();
            }
        });
    }

    require (...libs) {
        const required = {};

        libs.forEach(lib => {
            if (lib.match(/helpers|helper/i)) {
                required[lib] = new XeniumHelpers();
            }
            else if (lib.match(/query|selector/i)) {
                required[lib] = new XeniumSelector();
            }
            else if (lib.match(/context|selectorContext|ctx/i)) {
                required[lib] = xeniumContext;
            }
        });

        return required;
    }
}
