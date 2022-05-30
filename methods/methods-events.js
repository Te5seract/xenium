import { xeniumHelpers } from "../src/helpers.js";
import { xeniumSelector } from "../src/selector.js";

export const xeniumEvents = (function () {
    var query = xeniumSelector;
    //////////////////////////////////////
    // --private

    /** 
     * checks if the selected event target contains the identifier
     * 
     * @param {string} target
     * event target
     * 
     * @param {string} identifier
     * identifier can be a class of id or tag
     * 
     * @return {boolean}
    */
     function isTarget (target, identifier) {
        var found = false;

        for (let i = 0; i < identifier.length; i++) {
            if (target.hasAttribute("class") && target.classList.contains(identifier[i]) || 
                target.hasAttribute("id") && target.getAttribute("id") === identifier[i] || 
                target.hasAttribute(identifier)) found = true;
            
            else if (target.localName === identifier[i]) found = true;
        }

        return found;
    }

    //////////////////////////////////////
    // --public

    function methods (proto) {
        var helper = xeniumHelpers;

        /**
         * creates an event listner 
         * 
         * @param {string} type 
         * the type of event
         * 
         * @param {function} callback 
         * the event function, takes 2 parameters:
         * 
         * e: the event object
         * the event object has a new function called "isTarget"
         * which checks if the target of the event has the same type of identifier
         * or identifiers as the ones passed into the isTarget method
         * 
         * the target identifier could be a class name or id or tag name
         * 
         * t: the event target
         * 
         * @return {void}
         */
        proto.events = function (type, callback) {
            type = type.replace(/ ,|, /g, ",").split(",");

            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < type.length; x++) {
                    helper.exe(this[i], "addEventListener", type[x], callback);
                }
            }

            return this;
        }

        /**
         * checks for an event type
         * 
         * @param {string} eventType 
         * the type of event to listen for
         * 
         * @param {function} [callback] 
         * if the event is detected the callback will fire
         */
        proto.isEvent = function (eventType, callback) {
            var result = false;

            if (this[0].type === eventType) {
                if (callback) {
                    callback();
                    return;
                }

                result = true;
            }

            return result;
        }

        /**
         * checks if the target of the event has the same class / id / tag name
         * as the clicked element 
         * 
         * @param {string} identifier 
         * the target identifier (could be a class name or id or tag name)
         * 
         * @param {function} [callback] 
         * (optional) when the target is found the callback will execute
         * 
         */
        proto.isTarget = function (identifier, callback) {
            identifier = identifier.replace(/\.|#/g, "").replace(/ ,|, /g, ",").split(",");
            var callbackResult;

            if (isTarget(this[0], identifier)) {

                if (callback) callbackResult = callback();
                else callbackResult = true;

            } else {
                if (callback) callbackResult = null;
                else callbackResult = false;
            }

            return callbackResult;
        }
        
        /**
         * executes once the document has loaded
         * 
         * @param {function} callback 
         * executes when the document has loaded
         * 
         * @return {void}
         */
        proto.loaded = function (callback) {
            helper.exe(window, "addEventListener", "load", () => {
                callback ? callback() : null;
            });

            return this;
        }

        proto.sendValue = function (elem, append) {
            var node = query.selector(elem),
                append = append ? true : false;

            for (let i = 0; i < node.length; i++) {
                for (let x = 0; x < this.length; x++) {
                    sendValue(this[x], node[i], append);
                }
            }

            return this;
        }
    }

    return {
        set : function (proto) {
            methods(proto);
        }
    }
})();
