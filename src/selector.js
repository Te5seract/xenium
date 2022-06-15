import { xeniumHelpers } from "./helpers.js";

export const xeniumSelector = (function () {
    var helper = xeniumHelpers;
    //////////////////////////////////////
    // --private

    /**
     * duplicates the selector string 
     * intended for the rand flag: {rand = single}
     * automatically duplicated the same selector item based on the number
     * passed into the copy parameters:
     * 
     * (copy(5) : query {rand = single})
     * 
     * @param {string} selector 
     * the selector
     * 
     * @return {string}
     */
    function selectorCopy (selector) {
        selector = selector.replace(/ /g, "").replace(/, | ,/, ",").split(",");

        var queryString = "";

        for (let i = 0; i < selector.length; i++) {
            if (selector[i].match(/\(( |)copy\(\d+\)( |):( |).*?( |)({.*}|)( |)\)/igm)) {
                var colonSplit = selector[i].replace(/ :|: /g, ":").split(":"),
                    amount = Number(colonSplit[0].replace(/\(|\)|copy/ig, "")),
                    subject = colonSplit[1].replace(/\(|\)| /ig, "");

                var comma = i !== selector.length - 1 ? "," : "";

                for (let x = 0; x < amount; x++) {
                    queryString += x + 1 !== amount ? subject+", " : subject+comma;
                }
            } else {
                queryString += i !== selector.length - 1 ? selector[i]+", " : selector[i];
            }
        }

        return queryString;
    }

    /**
     * intended for the group flag: {1 & 2 & 3}
     * automatically selects a group based on the number passed
     * into the group parameters:
     * 
     * (group(5) : query {i})
     * 
     * @param {string} selector 
     * the selector
     * 
     * @return {string}
     */
    function groupIterator (selector) {
        selector = selector.replace(/ /g, "").replace(/, | ,/, ",").split(",");

        var queryString = "";

        for (let i = 0; i < selector.length; i++) {
            if (selector[i].match(/\(( |)group\(\d+\)( |):( |).*?( |)({.*})( |)\)/igm)) {
                var colonSplit = selector[i].replace(/ :|: /g, ":").split(":"),
                    amount = Number(colonSplit[0].replace(/\(|\)|group/ig, "")),
                    subject = colonSplit[1].replace(/\(|\)| |{.*}/ig, "");

                queryString += subject+"{";

                for (let x = 0; x < amount; x++) {
                    var cap = "}";

                    if (i !== selector.length - 1) cap = cap+", ";

                    queryString += x + 1 !== amount ? (x + 1)+" & " : (x + 1)+cap;
                }
            } else {
                queryString += i !== selector.length - 1 ? selector[i]+", " : selector[i];
            }
        }

        return queryString;
    }

    /**
     * prepares the selector for the query
     * 
     * @param {string|array|object|number} selector 
     * the selector to prepare
     * 
     * @param {function} callback 
     * callback function returns the result of the code performed within the callback
     */
    function prepareSelector (selector, callback) {
        if (selector) {
            // prevent unnecessary nesting of arrays in the selector, eg: [[["hi"]]]
            var originalSelector = selector;

            //////////////////////////////////////
            // quick selectors
            if (isString(selector) && selector.match(/{#}|{dom}|{d}/i)) selector = document;
            else if (isString(selector) && selector.match(/{body}|{b}/i)) selector = document.body;
            else if (isString(selector) && selector.match(/{w}/i)) selector = window;
            else if (isString(selector) && selector.match(/{head}|{h}/i)) selector = document.head;
            else if (isString(selector) && selector.match(/@/) && !selector.match(/,/)) selector = `[${selector.replace(/@/g, "")}]`;

            //////////////////////////////////////
            // selector wrappers

            // copy selector
            if (isString(selector) && selector.match(/\(( |)copy\(\d+\)( |):( |).*?( |)({.*}|)( |)\)/igm)) {
                selector = selectorCopy(selector);
            }
            // group iterator
            if (isString(selector) && selector.match(/\(( |)group\(\d+\)( |):( |).*?( |)({.*})( |)\)/igm)) {
                selector = groupIterator(selector);
            }

            selector = unravelArray(selector);

            selector = typeof selector === "string" ? selector.replace(/, |,| ,/gm, ",").split(",") : selector;

            if (selector.length) {
                selector.forEach((sel, i) => {
                    if (sel.match(/@/)) selector[i] = `[${selector[i].replace(/@/g, "")}]`;
                });
            }

            // if the selector is not an array turn it into one
            if (helper.type(selector) !== "array") selector = [selector];

            // make the prepare function return the result of its callback
            return callback(selector, originalSelector);
        }
    }

    /**
     * turns unnecessary nested arrays into just one array [[[["hi"]]]] = ["hi"]
     * @param {array} array 
     * the array to unravel
     * 
     * @returns
     */
    function unravelArray (array) {
        var object = array;

        if (helper.type(object[0]) === "array") object = unravelArray(object[0]);

        return object;
    }

    /**
     * checks if the selector is a string
     * 
     * @param {string|array|object|number} selector 
     * the selector
     * 
     * @return {boolean}
     */
    function isString (selector) {
        if (typeof selector === "string") return true;

        return;
    }

    /**
     * makes sure the selector is readable
     * 
     * @param {string} selector 
     * the selector to validate
     * 
     * @param {string} type 
     * the type of selector to validate to, eg "class", "id", "node"
     * 
     * @return {string}
     */
    function validateSelector (selector, type) {
        if (!isString(selector)) return selector;

        if (selector.match(/\.|#/g)) return selector; 

        selector = selector.replace(/{.*?}/, "");

        switch (type) {
            case "class":
                if (!selector.match(/\./)) return "."+selector;
            case "id":
                if (!selector.match(/#/)) return "#"+selector;
            case "node":
                if (!selector.match(/\[|\]/)) return `[${selector.replace(/@/, "")}]`;
            default:
                return selector;
        }
    }

    function querySelector (query, within, isSingle) {
        var nodes;

        if (isSingle) {
            try {
                within.querySelector(query);
            } catch (e) {
                return [];
            }

            nodes = within.querySelector(query) ? [within.querySelector(query)] : [];
        } else {
            nodes = [];

            try {
                within.querySelectorAll(query);
            } catch (e) {
                return [];
            }

            for (let i = 0; i < within.querySelectorAll(query).length; i++) {
                nodes.push(within.querySelectorAll(query)[i]);
            }
        }

        if (nodes.length !== 0) nodes.filter(Boolean);

        return nodes;
    }

    /**
     * returns a queried element
     * 
     * @param {string|object} selector 
     * the selector to query
     * 
     * @param {string|object} within 
     * (optional) the element for which the selected node is within
     * 
     * @param {boolean} isSingle 
     * (optional) default true, if the query selector is to be a single element 
     * 
     * @return {object}
     */
    function query (selector, within, isSingle) {
        var classQuery = validateSelector(selector, "class"),
            idQuery = validateSelector(selector, "id"),
            attrQuery = validateSelector(selector, "node"),
            nodeQuery = validateSelector(selector),
            within = within ? within : document,
            isSingle = isSingle === undefined ? true : false,
            elements;

        if (querySelector(classQuery, within, isSingle).length !== 0) {
            elements = querySelector(classQuery, within, isSingle); 
        }
        else if (querySelector(idQuery, within, isSingle).length !== 0) {
            elements = querySelector(idQuery, within, isSingle);
        }
        else if (querySelector(attrQuery, within, isSingle).length !== 0) {
            elements = querySelector(attrQuery, within, isSingle);
        }
        else if (querySelector(nodeQuery, within, isSingle).length !== 0) {
            elements = querySelector(nodeQuery, within, isSingle);
        }

        return elements;
    }

    /**
     * makes sure the selector is in an array format
     *
     * @param {*} selector
     * the selector to wrap
     *
     * @return {array}
    */
    function wrapSelector (selector) {
        if (helper.type(selector) === "array") return selector;

        if (helper.type(selector) === "object") {
            return [selector];
        }
    }

    /**
     * checks if the selector has a flag
     * @param {string} selector 
     * the element identifier
     * 
     * @param {object} within
     * (optional) the element for which the selected node is within
     * 
     * @return {array}
     */
    function noFlag (selector, within) {
        if (!isString(selector) && !within) return wrapSelector(selector);

        selector = query(selector, within);

        return selector;
    }
    // end no flag

    /**
     * get all elements of a specified identifier
     * 
     * @param {string} selector
     * the element identifier
     * 
     * @param {object} within
     * (optional) the element for which the selected node is within
     * 
     * @return {array}
    */
    function allFlag (selector, within) {
        if (!isString(selector) && !within) return;
        
        selector = selector.replace(/{( |)(all|\*)( |)}/igm, "");

        selector = query(selector, within, false);

        return selector;
    }

    /**
     * selects elements that fall fall on even numbers in the dom
     * 
     * @param {string} selector 
     * the element identifier
     * 
     * @param {object} within 
     * (optional) the element for which the selected node is within
     * 
     * @return {array}
     */
    function evenFlag (selector, within) {
        if (!isString(selector) && !within) return;

        var nodes = [];

        selector = selector.replace(/{( |)(even|evn)( |)}/igm, "");

        selector = query(selector, within, false);

        if (selector) {
            for (let i = 0; i < selector.length; i++) {
                if ((i * 2) - 1 > 0) {
                    if (!selector[(i * 2) - 1]) break;

                
                    nodes.push(selector[(i * 2) - 1]);
                }
            }

            return nodes;
        }
    }

    /**
     * selects elements that fall on odd numbers in the dom
     * 
     * @param {string} selector 
     * the element identifier
     * 
     * @param {object} within 
     * (optional) the element for which the selected node is within
     * 
     * @return {array}
     */
    function oddFlag (selector, within) {
        if (!isString(selector) && !within) return;

        var nodes = [];

        selector = selector.replace(/{( |)(odd)( |)}/igm, "");

        selector = query(selector, within, false);

        if (selector) {
            for (let i = 0; i < selector.length; i++) {
                if (!selector[i * 2]) break;

                nodes.push(selector[i * 2]);
            }

            return nodes;
        }
    }

    /**
     * directly selects a specified element
     * 
     * @param {string} selector 
     * the element identifier
     * 
     * @param {object} within 
     * (optional) the element for which the selected node is within
     * 
     * @return {array}
     */
    function directFlag (selector, within) {
        if (!isString(selector) && !within) return;

        var flag = selector.split("{")[1].replace(/{|}/igm, "");

        selector = selector.replace(/{( |)(\d+|last)( |)}/igm, "");

        selector = query(selector, within, false);

        if (selector) {
            // determine if the flag is a number or a word (if it's a word it's assumed to be the "last" keyword)
            flag = flag.match(/\d+/) ? Number(flag) - 1 : selector.length - 1;

            // if the flag's number is lower than 0 set the flag number to 0
            flag = flag < 0 ? 0 : flag,

            // if the flag number is greater than the number of selected nodes set the number to the length of the node list
            flag = flag > selector.length - 1 ? selector.length - 1 : flag;

            return selector[flag];
        }
    }

    /**
     * gets a range of nodes between and including two specified numbers, eg {1 > 10} or {1 > last}
     * the last keyword obviously gets the last node
     * 
     * @param {string} selector 
     * the element identifier
     * 
     * @param {object} within 
     * (optional) the element for which the selected node is within
     * 
     * @return {array}
     */
    function rangeFlag (selector, within) {
        if (!isString(selector) && !within) return;

        selector = selector.replace(/>>/igm, ">");

        var flag = selector.split("{")[1].replace(/{|}/igm, ""),
            rangeA = Number(flag.split(">")[0]),
            rangeB = flag.split(">")[1];

        selector = selector.replace(/{( |)(\d+( |)>( |)(\d+|last))}/igm, "");

        selector = query(selector, within, false);

        if (selector) {
            var nodes = [];

            // if the initial range number is lower than 0 set it to 0
            rangeA = rangeA - 1 < 0 ? 0 : rangeA - 1;

            // if the initial range is greater than the length of the node list
            rangeA = rangeA > selector.length - 1 ? selector.length - 1 : rangeA;

            // determine if the secondary range number is a number or the "last" keyword
            rangeB = rangeB.match(/\d+/) ? Number(rangeB) : selector.length;

            // if the secondary range number is less than 0 set it to 0
            rangeB = rangeB < 0 ? 0 : rangeB;

            // if the secondary range number is greater than the length of the node list
            rangeB = rangeB > selector.length ? selector.length : rangeB;

            for (let i = rangeA; i < rangeB; i++) {
                if (i === rangeB) break;

                nodes.push(selector[i]);
            }

            return nodes;
        }
    }

    /**
     * selects multiple elements directly into a group
     * 
     * @param {string} selector 
     * the element identifier
     * 
     * @param {object} within 
     * (optional) the element for which the selected node is within
     * 
     * @return {array}
     */
    function groupFlag (selector, within) {
        if (!isString(selector) && !within) return;

        var flag = selector.split("{")[1].replace(/{|}/igm, "");

        selector = selector.replace(/{.*?}/igm, "");

        selector = query(selector, within, false);

        if (selector) {
            var nodes = [];

            flag = flag.replace(/last|final/igm, selector.length);

            var indexes = flag.replace(/( |)&( |)/igm, "&").split("&");

            for (let i = 0; i < indexes.length; i++) {
                var index = indexes[i] - 1 < 0 ? 0 : indexes[i] - 1,
                    index = index > selector.length - 1 ? selector.length - 1 : index;

                nodes.push(selector[index]);
            }

            return nodes;
        }
    }

    /**
     * selects a random amount of elements
     * 
     * @param {string} selector 
     * the element identifier
     * 
     * @param {object} within 
     * (optional) the element for which the selected node is within
     * 
     * @return {array}
     */
    function randFlag (selector, within) {
        if (!isString(selector) && !within) return;

        var flag = selector.split("{")[1].replace(/{|}/igm, "");

        selector = selector.replace(/{( |)(rand|random)( |)=( |).*?}/igm, "");

        selector = query(selector, within, false);

        if (selector) {
            var rand = Math.floor(Math.random(1) * selector.length),
                flagAmount = flag.replace(/( |)=( |)/g, "=").split("=")[1],
                nodes = [];

            rand = rand < 0 ? 0 : rand;
            rand = rand === selector.length ? selector.length - 1 : rand;

            if (flagAmount.match(/all/i) && rand > 0) {
                for (let i = 0; i < rand; i++) {
                    nodes.push(selector[i]);
                }
            } 
            else if (flagAmount.match(/single/i) || rand === 0) {
                nodes.push(selector[rand]);
            }

            return nodes;
        }
    }

    //////////////////////////////////////
    // --public
    var lib = {};

    /**
     * gets the selector type
     *
     * @param {string} selector
     * the selector string
     *
     * @return {string|boolean}
    */
    lib.selectorType = function (selector) {
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
     * main selector
     * 
     * @param {string|array|object|number} selector 
     * the query selector value
     * 
     * @param {object} within
     * a parent node to query a child element from within
     * 
     * @return {string|array|object|number}
     */
    lib.selector = function (selector, within) {
        // prepare selector for main query
        if (selector instanceof Array) return unravelArray(selector);

        var element = prepareSelector(selector, function (selector, original) {
            var node = [],
                nodeItem;

            for (let i = 0; i < selector.length; i++) {   
                // all flag
                if (isString(selector[i]) && selector[i].match(/{( |)(all|\*)( |)}/igm)) {
                    nodeItem = allFlag(selector[i], within);
                } 
                // even flag
                else if (isString(selector[i]) && selector[i].match(/{( |)(even|evn)( |)}/igm)) {
                    nodeItem = evenFlag(selector[i], within);
                } 
                // odd flag
                else if (isString(selector[i]) && selector[i].match(/{( |)(odd)( |)}/igm)) {
                    nodeItem = oddFlag(selector[i], within);
                } 
                // direct flag
                else if (isString(selector[i]) && selector[i].match(/{( |)(\d+|last|final)( |)}/igm)) {
                    nodeItem = directFlag(selector[i], within);
                }
                // range flag
                else if (isString(selector[i]) && selector[i].match(/{( |)(\d+( |)(>|>>)( |)(\d+|last|final))}/igm)) {
                    nodeItem = rangeFlag(selector[i], within);
                } 
                // group flag
                else if (isString(selector[i]) && selector[i].match(/{(( |)(\d+|last|final)( |)&( |)(\d+|last|final)( |)){1,}|(( |)&( |)(\d+|last|final)( |)){1,}}/igm)) {
                    nodeItem = groupFlag(selector[i], within);
                }
                // random flag
                else if (isString(selector[i]) && selector[i].match(/{( |)(rand( |)=( |)(single|all)|random( |)=( |)(single|all))( |)}/igm)) {
                    nodeItem = randFlag(selector[i], within);
                } else {
                    // no flag
                    nodeItem = noFlag(selector[i], within);
                }

                if (nodeItem) {
                    // remove already selected nodes
                    nodeItem.forEach((item, i) => {
                        if (node.indexOf(item) !== -1) {
                            nodeItem[i] = "";
                        }
                    });

                    if (nodeItem.length) {
                        for (let x = 0; x < nodeItem.length; x++) node.push(nodeItem[x]);
                    } else {
                        node.push(nodeItem);
                    }
                }
            }

            return node.filter(el => {
                if (el !== "") {
                    return el;
                }
            });
        });

        return element ? unravelArray(element) : element;
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
    lib.updateSelector = function (oldSelector, newSelector) {
        var nodes = [];

        // if the selector is a number send it to the nodes array
        if (helper.type(newSelector) === "number") nodes.push(newSelector);

        // get all the queried nodes and place them into the nodes array
        for (let i = 0; i < oldSelector.length; i++) {
            if (lib.selector(newSelector, oldSelector[i])) {
                for (let x = 0; x < lib.selector(newSelector, oldSelector[i]).length; x++) {
                    nodes.push(lib.selector(newSelector, oldSelector[i])[x]);
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
     * replaces the current selector with a new object
     * 
     * @param {object} oldSelector 
     * a reference to the main selector, expects "this" keyword
     * 
     * @param {object} newSelector 
     * an object to replace the main selector with
     */
    lib.replaceSelector = function (oldSelector, newSelector) {
        if (!newSelector || !newSelector instanceof Array || !newSelector.length) newSelector = [newSelector];

        for (let i = 0; i < oldSelector.length; i++) delete oldSelector[i];

        for (let i = 0; i < newSelector.length; i++) oldSelector[i] = newSelector[i];

        oldSelector.length = newSelector.length;
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
    lib.getNodes = function (instance) {
        let nodes = [];

        for (let i = 0; i < instance.length; i++) {
            nodes.push(instance[i]);
        }

        return nodes;
    }

    return lib;
})();
