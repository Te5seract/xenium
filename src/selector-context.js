// selector
import { xeniumSelector } from "./selector.js";

// helpers
import { xeniumHelpers } from "./helpers.js";

export const xeniumContext = (function () {
    var ctx = {},
        helper = xeniumHelpers,
        query = xeniumSelector;

    /**
     * initiates the context evaluator
     * 
     * @param {string|array|object|number} selector 
     * the main query selector
     * 
     * @param {object} context
     * context object 
     * 
     * @return {*} 
     */
    ctx.ini = function (selector, context, instance) {
        ctx.selector = selector;
        ctx.context = context;
        ctx.instance = instance;
        
        // methods
        if ("contains" in context) return ctx.contains();

        else if ("node" in context) return ctx.node();
        
        else if ("value" in context) return ctx.value();

        else if ("replace" in context) return ctx.replace();
    }

    /**
     * replaces one element with another
     * 
     * @return {void}
     */
    ctx.replace = function () {
        var selector = this.selector,
            context = this.context,
            instance = this.instance;

        for (let i = 0; i < selector.length; i++) {
            var elem = helper.exe(document, "createElement", context.replace);

            for (let item in selector[i].attributes) {
                if (!selector[i].attributes[item].name) break;

                helper.exe(elem, "setAttribute", selector[i].attributes[item].name, selector[i].attributes[item].nodeValue);

                elem.innerHTML = selector[i].innerHTML || selector[i].value;
                elem.value = selector[i].innerHTML || selector[i].value;
            }

            document.body.insertBefore(elem, selector[i]);
            
            selector[i].remove();
        }

        return instance;
    }

    /**
     * sets an input value
     * 
     * @return {boolean}
     */
    ctx.value = function () {
        var selector = this.selector,
            context = this.context;

        for (let i = 0; i < selector.length; i++) {
            selector[i].removeAttribute("value");

            selector[i].value = context.value;
        }

        return;
    }

    /**
     * returns an HTML node
     * 
     * @return {object}
     */
    ctx.node = function () {
        var context = this.context,
            selector = this.selector;

        return query.selector(context.node);
    }

    /**
     * checks if the main selector contains a value
     * 
     * @return {boolean}
     */
    ctx.contains = function () {
        var context = this.context,
            selector = this.selector,
            instance = this.instance,
            type = helper.type(context.contains);

        if (type === "array") {
            for (let i = 0; i < context.contains.length; i++) {
                if (this.selector.indexOf(context.contains[i]) !== -1) return true;
            }
        }
        else if (type === "object") {
            for (let item in context.contains) {
                if (this.selector.indexOf(context.contains[item]) !== -1) return true;
            }
        }

        return this.selector.indexOf(context["contains"]) !== -1 ? true : false;
    }

    return ctx;
})();