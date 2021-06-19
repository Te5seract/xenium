const x = (function () {
    //////////////////////////////////////
    // selector
    const xeniumSelector = (function () {
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
    
                        if (i !== selector.length - 1) {
                            cap = cap+", "
                        }
    
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
    
                // if the selector is not an array turn it into one
                if (!selector.length) 
                    selector = [selector];
    
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
    
            if (object[0] instanceof Array) {
                object = unravelArray(object[0]);
            }
    
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
                    if (!selector.match(/\[|\]/)) return `[${selector}]`;
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
    
            if (nodes.length !== 0) {
                nodes.filter(Boolean);
            }
    
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
            if (!isString(selector) && !within) return selector;
            
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
         * main selector
         * 
         * @param {string|array|object|number} selector 
         * the query selector value
         * 
         * @param {object} within
         * a parent node to query a child element from within
         * 
         * @return {string|array|object|number}
         * 
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
                        if (nodeItem.length) {
                            for (let x = 0; x < nodeItem.length; x++) {
                                node.push(nodeItem[x]);
                            }
                        } else {
                            node.push(nodeItem);
                        }
                    }
                }
    
                return node;
            });
            
            return unravelArray(element);
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
            if (typeof newSelector === "number") {
                nodes.push(newSelector);
            }
    
            // get all the queried nodes and place them into the nodes array
            for (let i = 0; i < oldSelector.length; i++) {
                if (lib.selector(newSelector, oldSelector[i])) {
                    for (let x = 0; x < lib.selector(newSelector, oldSelector[i]).length; x++) {
                        nodes.push(lib.selector(newSelector, oldSelector[i])[x]);
                    }
                }
            }
    
            // remove what is currently displayed in the main selector
            for (let i = 0; i < oldSelector.length; i++) {
                delete oldSelector[i];
            }
    
            // if the nodes array is empty make it null
            if (nodes.length === 0) {
                nodes = null;
            }
    
            // if there are nodes pass them to the main selector
            if (nodes) {
                if (!nodes.length) {
                    nodes = [nodes];
                }
    
                for (let i = 0; i < nodes.length; i++) {
                    oldSelector[i] = nodes[i];
                }
            
                oldSelector.length = nodes.length;
            } else {
                oldSelector.length = 0;
            }
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
    
            for (let i = 0; i < oldSelector.length; i++) {
                delete oldSelector[i];
            }
    
            for (let i = 0; i < newSelector.length; i++) {
                oldSelector[i] = newSelector[i];
            }
    
            oldSelector.length = newSelector.length;
        }
    
        return lib;
    })();
    // end selector
    //////////////////////////////////////

    //////////////////////////////////////
    // helpers
    const xeniumHelpers = (function () {
        var f = {};
    
        /**
         * executes a function 
         * 
         * @param {array} element
         * element to perform the exe function on
         * 
         * @param {string} hook
         * javascript function to call
         * 
         * @param {string|array|number|object} values
         * parameters for the javascript function
         * 
         * @return {any}
         */
        f.exe = function (element, hook, ...values) {
            values = this.unravelArray(values);
    
            var result = values.length > 0 ? element[hook].apply(element, values) : element[hook];
    
            return result;
        }
    
        /**
         * turns unnecessary nested arrays into just one array [[[["hi"]]]] = ["hi"]
         * @param {array} array 
         * the array to unravel
         * 
         * @returns
         */
        f.unravelArray = function (array) {
            var object = array;
    
            if (object[0] instanceof Array) {
                object = this.unravelArray(object[0]);
            }
    
            return object;
        }
    
        /**
         * gets an entire list of the selected node's relatives
         * 
         * @param {object} element 
         * the element to get the parent nodes for
         * 
         * @param {string} method 
         * a hook to the method in which to get the node list can, eg:
         * "children" or "parentNode" or "nextElementSibling"
         * 
         * @return {array}
         */
        f.nodeRelatives = function (element, method) {
            var nodes = [];
    
            if (!method.match(/children|childNodes/ig)) {
                while (element) {
                    nodes.push(element[method]);
    
                    element = element[method];
                }
            } else {
                var children = element.querySelectorAll("*");
    
                for (let i = 0; i < children.length; i++) {
                    nodes.push(children[i]);
                }
            }
    
            return nodes.filter(Boolean);
        }
    
        /**
         * gets an item from an array
         * 
         * @param {string} mode 
         * the filter mode
         * 
         * to filter HTML elements:
         * "node" or "nodes" or "query"
         * 
         * to filter standard arrays:
         * "item" or "items" or "number" or "numbers" or "string" or "standard"
         * 
         * @param {array} array 
         * the array to get an item from
         * 
         * @param {string} identifier 
         * the array item to search for
         * 
         * @return {string|number|object}
         */
        f.arrayGet = function (mode, array, identifier) {
            var idClear = identifier.replace(/\.|#/g, "");
    
            for (let i = 0; i < array.length; i++) {
    
                if (array[i] !== document) {
                    if (mode.match(/node|nodes|query/i)) {
                        if (array[i].hasAttribute("class") && array[i].classList.contains(idClear) 
                            || array[i].hasAttribute("id") && array[i].getAttribute("id") === idClear 
                            || array[i].localName === idClear) {
                            return array[i];
                        }
                    }
                    else if (mode.match(/item|items|number|numbers|string|standard/i)) {
                        if (array[i] === identifier) {
                            return array[i];
                        }
                    }
                }
    
            }
        }
    
        /**
         * converts HTML nodes to a string
         * 
         * @param {array} array 
         * the HTML node list
         * 
         * @return {array}
         */
        f.htmlToString = function (array) {
            if (!array.length || !array instanceof Array) array = [array];
    
            var strNodes = [];
    
            for (let i = 0; i < array.length; i++) {
                if (array[i].hasAttribute("class")) {
                    strNodes.push(array[i].localName+"."+array[i].getAttribute("class").split(" ").join(","));
                }
                else if (array[i].hasAttribute("id")) {
                    strNodes.push(array[i].localName+"#"+array[i].getAttribute("id"));
                } else {
                    strNodes.push(array[i].localName);
                }
            }
    
            return strNodes;
        }

        /**
         * escapes special characters
         * 
         * @param {string} string 
         * the string to escape
         * 
         * @return {string}
         */
        f.escape = function (string) {
            var modified = "";

            modified = string.match(/(\[)/igm) ? string.replace(/(\[)/igm, "\\$1") : string;
            modified = modified.match(/(\])/igm) ? modified.replace(/(\])/igm, "\\$1") : modified;
            modified = modified.match(/(\{)/igm) ?  modified.replace(/(\{)/igm, "\\$1") : modified;
            modified = modified.match(/(\})/igm) ?  modified.replace(/(\})/igm, "\\$1") : modified;
            modified = modified.match(/(\()/igm) ?  modified.replace(/(\()/igm, "\\$1") : modified;
            modified = modified.match(/(\))/igm) ?  modified.replace(/(\))/igm, "\\$1") : modified;
            modified = modified.match(/(\.)/igm) ?  modified.replace(/(\.)/igm, "\\$1") : modified;
            modified = modified.match(/(\*)/igm) ?  modified.replace(/(\*)/igm, "\\$1") : modified;
            modified = modified.match(/(\.)/igm) ?  modified.replace(/(\.)/igm, "\\$1") : modified;
            modified = modified.match(/(\+)/igm) ?  modified.replace(/(\+)/igm, "\\$1") : modified;
            modified = modified.match(/(\|)/igm) ?  modified.replace(/(\|)/igm, "\\$1") : modified;
            modified = modified.match(/(\?)/igm) ?  modified.replace(/(\?)/igm, "\\$1") : modified;
            modified = modified.match(/(\^)/igm) ?  modified.replace(/(\^)/igm, "\\$1") : modified;
            modified = modified.match(/(\$)/igm) ?  modified.replace(/(\$)/igm, "\\$1") : modified;

            return modified;
        }
    
        /**
         * escapes special characters for regular expressions
         * 
         * @param {string} items 
         * a string to escape
         * 
         * @return {string}
         */
        f.quote = function (items) {
            var quoted = items.replace(/(\\|\^|\$|\.|\||\?|\*|\+|\(|\))/g, "\\$1");
    
            return quoted;
        } 
    
        /**
         * gets the indexes specified array items
         * 
         * @param {array} subject 
         * the subject array
         * 
         * @param {array} needle 
         * the items to index in the array
         * 
         * @return {array}
         */
        f.arrayIndex = function (subject, needle) {
            var indexes = [];
    
            for (let i = 0; i < subject.length; i++) {
                for (let x = 0; x < needle.length; x++) {
                    var reg = new RegExp(`${this.quote(needle[x])}`);
    
                    if (subject[i].match(reg)) {
                        indexes.push(i);
                    }
                }
            }
    
            return indexes;
        }
    
        /**
         * removes items from an array based on its index
         * 
         * @param {array} subject 
         * the array to remove items from
         * 
         * @param {array} index 
         * array containing the index of the array item to remove
         * 
         * @return {array}
         */
        f.removeArrayIndex = function (subject, index) {
            for (let i = 0; i < index.length; i++) {
                subject[index[i]] = "";
            }
    
            return subject.filter(Boolean);
        }
    
        /**
         * splits a string up while preserving the HTML tags
         * 
         * @param {string} html 
         * the html to preserve
         * 
         * @return {array}
         */
        f.splitHTML = function (html, letter) {
            var nodeMatches = html.match(/(<.*?>)/ig);
    
            for (let i = 0; i < nodeMatches.length; i++) {
                if (nodeMatches[i]) {
                    var nodeSpaces = html.match(/(<.*?>)/ig)[i].replace(/ /g, "{#nodeSpace}"),
                        node = html.match(/(<.*?>)/ig)[i],
                        node = new RegExp(`${node}`, "ig");
    
                    html = html.replace(node, nodeSpaces);
                }
            }
    
            html = html.split(" ");
    
            for (let i = 0; i < html.length; i++) {
                if (html[i].match(/<.*?>/ig)) {
                    html[i] = html[i].replace(/(<.*?>)/ig, " $1 ");
                }
            }
    
            if (!letter) {
                return html.join(" ").replace(/ {2,}|{#nodeSpace}/g, " ").split(" ");
            } else {
                var letters = [];
                
                html = html.join(" ").replace(/ /g, " {#splitSpace};");
                
                html = html.split("{#splitSpace};");
    
                for (let i = 0; i < html.length; i++) {
                    if (!html[i].match(/<.*?>/ig)) {
                        html[i] = html[i].split("");
    
                        for (let x = 0; x < html[i].length; x++) {
                            if (letters.length > 1 && letters[i - 1] !== " ") letters.push(html[i][x]);
                            else letters.push(html[i][x]);
                        }
                    } else {
                        letters.push(html[i].replace(/{#nodeSpace}/g, " "));
                    }
                }
    
                return letters;
            }
        }
    
        /**
         * checks if an element identifier (className, id or tagName) 
         * exists in a node list
         * 
         * @param {array} nodes 
         * a list of nodes to check an identifier for
         * 
         * @param {string} identifier 
         * the node identifier
         * 
         * @return {boolean}
         */
        f.elementIdentifier = function (nodes, identifier) {
            var noIdChars = identifier.replace(/\.|#/g, "");
    
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i] !== document)
                    if (nodes[i].hasAttribute("class") && nodes[i].classList.contains(noIdChars) || 
                    nodes[i].hasAttribute("id") && nodes[i].getAttribute("id") === noIdChars ||
                    nodes[i].localName === identifier) {
                        return true;
                    }
            }
    
            return false;
        }

        /**
         * get item type
         * 
         * @param {array|object|int|string|boolean} item 
         * the item to extract its type from
         * 
         * @return {string}
         */
        f.type = function (item) {
            if (item instanceof Array) return "array";
            else if (item instanceof Object) return "object";

            return typeof item;
        }
    
        return f;
    })();
    // end helpers
    //////////////////////////////////////

    //////////////////////////////////////
    // selector context start
    const xeniumContext = (function () {
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
    // selector context end
    //////////////////////////////////////

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

    //////////////////////////////////////
    // query methods 
    (function () {
        /**
         * gets nodes from within a parent node
         * 
         * @param {string|number|array} selector 
         * the node identifier if a number or array is passed in it 
         * will output either a number or array
         * 
         * @return {array|number}
         */
        proto.within = function (selector) {
            query.updateSelector(this, selector);

            this.__proto__.selectorString = function () {
                return selector;
            }

            return this;
        }

        /**
         * goes to a node local to the main selector
         * 
         * @param {string} direction 
         * the direction the desired node is in
         * 
         * go to parent node:
         * "parents" or "parent" or "up"
         * 
         * go to child node:
         * "children" or "child" or "down"
         * 
         * go to the next node:
         * "next" or "right"
         * 
         * go to the previous node:
         * "prev" or "previous" or "left"
         * 
         * @param {string} identifier 
         * the node identifier to go to
         * 
         * @return {void}
         */
        proto.goto = function (direction, identifier) {
            if (direction.match(/parents|parent|up/ig)) {
                query.replaceSelector(this, helper.arrayGet("nodes", helper.nodeRelatives(this[0], "parentNode"), identifier));
            }
            else if (direction.match(/children|child|down/ig)) {
                var children = this[0].querySelectorAll("*");

                query.replaceSelector(this, helper.arrayGet("nodes", children, identifier));
            }
            else if (direction.match(/next|right/ig)) {
                query.replaceSelector(this, helper.arrayGet("nodes", helper.nodeRelatives(this[0], "nextElementSibling"), identifier));
            }
            else if (direction.match(/prev|previous|left/ig)) {
                query.replaceSelector(this, helper.arrayGet("nodes", helper.nodeRelatives(this[0], "previousElementSibling"), identifier));
            }

            this.__proto__.selectorString = function () {
                return identifier;
            }

            return this;
        }

        /**
         * replaces the main selector nodes with ones specified 
         * 
         * @param {string|array|object|number} selector 
         * 
         * @return {void}
         */
        proto.query = function (selector, context) {
            query.replaceSelector(this, query.selector(selector));

            this.__proto__.selectorString = function () {
                return selector;
            }

            if (context) {
                query.replaceSelector(this, xeniumContext.ini(this, context, this));
            }
            
            return this;
        }

        /**
         * applies a flag to each node in the main selector
         * 
         * @param {string} delimiter 
         * what to separate each flag values with
         * 
         * @param  {...any} flag 
         * the flag to use
         * 
         * to get groups: flag("&", 1, 5, 12) will act like "elem {1 & 5 & 12}"
         * 
         * @return {void}
         */
        proto.flag = function (delimiter, ...flag) {
            if (!this.__proto__.selectorString() || typeof this.__proto__.selectorString() === "object") return this;

            var selector = this.__proto__.selectorString().replace(/( |){.*?}( |)/g, "").split(",");

            for (let i = 0; i < this.length; i++) {
                if (!helper.elementIdentifier(this[i], selector)) {
                    var node = this[0];

                    this.__proto__.selectorString = function () {
                        return helper.getElementIdentifier(node);
                    }
                }
            }

            selector = this.__proto__.selectorString().replace(/( |){.*?}( |)/g, "").split(",");

            var delimiter = delimiter ? delimiter : " ",
                newQuery = "";

            for (let i = 0; i < selector.length; i++) {
                var newSelector = i !== selector.length - 1 ? selector[i]+`{${flag.join(delimiter)}}, ` : selector[i]+`{${flag.join(delimiter)}}`;

                newQuery += newSelector;
            }

            query.replaceSelector(this, query.selector(newQuery));

            return this;
        }

        /**
         * gets the inner content of an iframe
         * 
         * @param {string} part 
         * (optional) gets the part of an iframe
         * if this parameter is not used it will just return the 
         * iframe document object
         * 
         * to get the head: "head" or "header" or "h"
         * 
         * to get the boyd: "body" or "b"
         * 
         * @return {void}
         */
        proto.iframe = function (part) {
            for (let i = 0; i < this.length; i++) {
                if (part && part.match(/head|header|h/)) query.replaceSelector(this, this[i].contentDocument.head);
                else if (part && part.match(/body|b/)) query.replaceSelector(this, this[i].contentDocument.body);
                else query.replaceSelector(this, this[i].contentDocument);
            }

            return this;
        }
    })();
    // end query methods
    //////////////////////////////////////

    //////////////////////////////////////
    // dom methods
    (function () {
        /**
         * sets / removes / gets attributes
         * 
         * if the main selector has many nodes selected then this method will
         * return an array. If the main selector only has a single node selected
         * only a single boolean is returned
         * 
         * @param {string} action 
         * the type of action to perform 
         * 
         * to set an attribute: 
         * "set" or "setAttr" or "setAttribute" or "apply"
         * 
         * to delete an attribute:
         * "del" or "delAttr" or "delete" or "deleteAttribute" or "remove" or "removeAttr" or "removeAttribute"
         * 
         * to get an attribute value (if this action is used this method can't be chained):
         * "get" or "getAttr" or "getAttribute"
         * 
         * @param {string} value 
         * each value can be separated by a ","
         * 
         * set attribute value:
         * "class=value" or for multiple: "class=value, title=title-value"
         * 
         * to delete or get an attribute:
         * "title" for multiple: "title, id, class"
         * 
         * @return {array}
         */
         proto.attr = function (action, value) {
            if (!action | !value) return this;

            var valueItems = value.replace(/ ,|, /g, ",").split(","),
                attrVals = [];;

            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < valueItems.length; x++) {

                    // set attribute
                    if (action.match(/set|setAttr|setAttribute|apply/i)) {
                        var values = valueItems[x].split("=");

                        helper.exe(this[i], "setAttribute", values[0], values[1]);
                    }

                    // delete attribute
                    else if (action.match(/del|delAttr|delete|deleteAttribute|remove|removeAttr|removeAttribute/)) {
                        helper.exe(this[i], "removeAttribute", valueItems[x]);
                    }

                    // get attribute
                    else if (action.match(/get|getAttr|getAttribute/)) {
                        attrVals.push(helper.exe(this[i], "getAttribute", valueItems[x]));
                    }
                }
            }

            attrVals = attrVals.filter(Boolean);

            attrVals = attrVals.length === 1 ? attrVals[0] : attrVals;

            return attrVals.length > 0 ? attrVals : false;
        }

        /**
         * adds / removes / swaps a node's class name(s)
         * 
         * @param {string} action 
         * the type of action to perform
         * 
         * to add a class: 
         * "add" or "+"
         * 
         * to remove a class:
         * "delete" or "remove" or "-"
         * 
         * to swap classes:
         * "swap" or "switch"
         * 
         * @param {string} value 
         * each value can be separated by a ","
         * 
         * add or remove class items: "valueA, valueB"
         * 
         * swap a class: "old-valueA > new-valueA, old-valueB > new-valueB"
         * 
         * @return {void}
         */
        proto.classList = function (action, value) {
            var valueItems = value.replace(/ ,|, /g, ",").split(",");

            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < valueItems.length; x++) {

                    // add classes
                    if (action.match(/add|\+/)) {
                        helper.exe(
                            helper.exe(this[i], "classList"), // get class list
                            "add", // chain the add method
                            valueItems[x] // param
                        );
                    }

                    // remove classes
                    else if (action.match(/delete|remove|\-/)) {
                        helper.exe(
                            helper.exe(this[i], "classList"), // get class list
                            "remove", // chain the remove method
                            valueItems[x] // param
                        );
                    }

                    // swap classes
                    else if (action.match(/swap|switch|/)) {
                        var swap = valueItems[x].replace(/( |)>( |)/, ">").split(">");
                            
                        helper.exe(
                            helper.exe(this[i], "classList"), // get class list
                            "remove", // chain the remove method
                            swap[0] // param
                        );

                        helper.exe(
                            helper.exe(this[i], "classList"), // get class list
                            "add", // chain the add method
                            swap[1] // param
                        );
                    }
                }
            }

            return this;
        }

        /**
         * adds css to an element
         * 
         * @param {string} css
         * css to apply to the element
         * 
         * @param {boolean} append
         * whether or not to append the css text to already existing text
         * 
         * @return {void}
         */
        proto.css = function (css, append) {
            for (let i = 0; i < this.length; i++) {
                append ? this[i].style.cssText += css : this[i].style.cssText = css;
            }

            return this;
        }
        /**
         * gets the value of a css property from an element
         * this method can't be chained 
         * 
         * @param {string} property 
         * the css property
         * 
         * @param {string} value
         * (optional) the value of the css property
         * 
         * if this parameter is used it will return a boolean
         * 
         * if this parameter is not used it will return the value of the css property
         *  
         * @return {string|boolean}
         */
        proto.cssValue = function (property, value) {
            for (let i = 0; i < this.length; i++) {
                if (!value) return this[i].style[property];
                else return this[i].style[property] === value;
            }
        }

        /**
         * writes html or text or outerHTML content
         * 
         * @param {string} method 
         * the write method
         * 
         * to write html:
         * "html" or "innerHTML"
         * 
         * to write outer html:
         * "outer" or "outerHTML",
         * 
         * to write text:
         * "text" or "txt"
         * 
         * @param {string} value 
         * text, html or outer html
         * 
         * @param {boolean} append
         * appends the value to pre-existing text
         * 
         * @return {void}
         */
        proto.write = function (method, value, append) {
            for (let i = 0; i < this.length; i++) {
                if (method.match(/html|innerHTML/i)) 
                !append ? this[i].innerHTML = value : this[i].innerHTML += value;

                else if (method.match(/outer|outerHTML/i)) 
                !append ? this[i].outerHTML = value : this[i].outerHTML += value;

                else if (method.match(/text|txt/i)) 
                !append ? this[i].textContent = value : this[i].textContent += value;
            }

            return this;
        }

        /**
         * makes elements
         * 
         * if the main query selector has selected one or more nodes a new element
         * will be made for each node in the main selector. The number will multiply 
         * if an amount more than 1 is specified
         * 
         * @param {string} node 
         * the type of elements to make
         * 
         * @param {int} amount 
         * (optional) the amount of elements to make
         * 
         * @param {string} attr 
         * (optional) attributes to give to the new elements. Each attribute can be 
         * separated by a comma, eg: "class=new-element, title=New Element"
         * 
         * @param {boolean} append 
         * (optional) if this parameter is not filled then this method
         * cannot be chained
         * 
         * @return {void|array}
         */
        proto.make = function (node, amount, attr, append) {
            if (!node) return;

            var amount = !amount ? 1 : amount,
                attrSplit = attr ? attr.replace(/ ,|, /g, ",").split(",") : null,
                nodes = [];

            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < amount; x++) {
                    var newNode = document.createElement(node);

                    if (attr) {
                        for (let j = 0; j < attrSplit.length; j++) {
                            var attrSegs = attrSplit[j].replace(/( |)=( |)/g, "=").split("=");

                            helper.exe(newNode, "setAttribute", attrSegs[0], attrSegs[1]);
                        }
                    }

                    if (!append) nodes.push(newNode);
                    else this[i].append(newNode);
                }
            }

            if (!append) {
                return nodes;
            }

            return this;
        }

        /**
         * appends an element to  the main selector element
         * 
         * @param {array} nodes 
         * 
         * @return {void}
         */
         proto.append = function (...nodes) {
            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < nodes.length; x++) {
                    nodes[x] = helper.unravelArray(nodes[x]);

                    if (nodes[x] instanceof Array) nodes[x] = nodes[x][0];

                    this[i].appendChild(nodes[x]);
                }
            }

            return this;
        }

        /**
         * inserts a node before another node
         * @param {*} node 
         * @param {*} before 
         */
        proto.prepend = function (node, before) {
            for (let i = 0; i < node.length; i++) {
                this[0].insertBefore(node[i], query.selector(before)[0]);
            }
        }

        /**
         * selects the node next to the node in the main selector
         * 
         * @param {int} amount
         * how many elements to skip ahead to
         *  
         * @param {string} exclude 
         * what nodes to exclude from being selected
         * 
         * @return {void}
         */
        proto.next = function (amount, ...exclude) {
            var nextElements = helper.nodeRelatives(this[0], "nextElementSibling").filter(Boolean),
                indexes = helper.arrayIndex(helper.htmlToString(nextElements), exclude),
                nextElements = helper.removeArrayIndex(nextElements, indexes),
                next = [],
                amount = amount ? amount - 1 : 0,
                amount = amount > nextElements.length ? nextElements.length - 1 : amount;

            for (let i = 0; i < nextElements.length; i++) {
                if (i === amount) {
                    next.push(nextElements[i]);
                }
            }

            if (next.length > 0) {
                query.replaceSelector(this, next);
            }

            return this;
        }

        /**
         * selects the node previous to the node in the main selector
         * 
         * @param {int} amount
         * how many elements to skip back to
         *  
         * @param {string} exclude 
         * what nodes to exclude from being selected
         * 
         * @return {void}
         */
        proto.prev = function (amount, ...exclude) {
            var previousElements = helper.nodeRelatives(this[0], "previousElementSibling").filter(Boolean),
                indexes = helper.arrayIndex(helper.htmlToString(previousElements), exclude),
                previousElements = helper.removeArrayIndex(previousElements, indexes),
                prev = [],
                amount = amount ? amount - 1 : 0,
                amount = amount > previousElements.length ? previousElements.length - 1 : amount;

            for (let i = 0; i < previousElements.length; i++) {
                if (i === amount) {
                    prev.push(previousElements[i]);
                }
            }

            if (prev.length > 0) {
                query.replaceSelector(this, prev);
            }

            return this;
        }

        /**
         * gets child nodes of the main selector
         * 
         * @param {boolean} allChildren 
         * (optional) this is set to false by default returning only the child node(s) of the main selector
         * if it is set to true it will select all child nodes within the main selected node
         * 
         * @return {array}
         */
        proto.children = function (allChildren) {
            var result;

            if (!allChildren) result = helper.exe(this[0], "children");
            else result = query.selector("* {all}", this[0]);

            return result;
        }

        /**
         * gets the parent nodes of the main selector node
         * 
         * @return {array}
         */
        proto.parents = function () {
            return helper.nodeRelatives(this[0], "parentNode");
        }

        /**
         * gets the dom index for a particular node, intended to be used with the 
         * events method. This method must be stored in a variable to work correctly
         * 
         * @param {string} selector 
         * a reference to the element to index
         * 
         * @return {int}
         */
        proto.nodeIndex = function (selector) {
            var nodesOfType = query.selector(selector+"{all}");

            for (let i = 0; i < nodesOfType.length; i++) {
                if (this[0] === nodesOfType[i]) {
                    return i + 1;
                }
            }
        }

        /**
         * checks if the selected element contains another type of element
         * this method cannot be chained
         * 
         * @param {string} value 
         * the element to check the existence of
         * 
         * @return {boolean}
         */
        proto.contains = function (value) {
            return query.selector(value, this[0]).length > 0;
        }

        /**
         * checks if the identifier passed into the method is a parent
         * of the element in the main selector
         * 
         * this method cannot be chained
         * 
         * @param {string} value 
         * the value can be a classname id or tagname
         * 
         * @param {function} callback
         * fires a callback function on success
         * 
         * @return {boolean}
         */
        proto.childOf = function (value, callback) {
            var parents = helper.nodeRelatives(this[0], "parentNode"),
                found = helper.elementIdentifier(parents, value);

            if (found) callback ? callback(parents) : null;

            return found;
        }

        /**
         * checks if the identifier passed into the method is a child
         * of the element in the main selector
         * 
         * this method cannot be chained
         * 
         * @param {string} value 
         * the value can be a classname ir or tagname
         * 
         * @param {function} callback
         * fires a callback function on success
         * 
         * @return {boolean}
         */
        proto.parentOf = function (value, callback) {
            var children = helper.nodeRelatives(this[0], "children"),
                found = helper.elementIdentifier(children, value);

            if (found) callback ? callback(children) : null;

            return found;
        }

        /**
         * moves the contents of an element from one element to another
         * 
         * @param {string|object} moveTo 
         * the element to move the content to (flags can be used with this)
         * 
         * multiple destination elements can be selected: ".elem1, .elem2 {all}, .elem3"
         * 
         * @param {string} method 
         * to move all content:
         * "*" or "all"
         * 
         * to move specific content specify the classname, id, tagname or 
         * [attribue="value"] (flags can be used with this) eg:
         * 
         * "div {all}"
         * 
         * multiple elements can be selected:
         * 
         * "img, .elem1, .elem2 {all}"
         * 
         * @return {void}
         */
        proto.moveContent = function (moveTo, method, deleteOnMove) {
            var selector = query.selector(moveTo),
                methods = method.split(/ ,|, /g),
                deleteOnMove = deleteOnMove === undefined || deleteOnMove ? true : false;
            
            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < selector.length; x++) { 
                    for (let j = 0; j < methods.length; j++) {

                        if (methods[i].match(/\B\*\B|\Ball\B/)) {
                            var content = this[i].innerHTML;

                            selector[x].innerHTML += content;

                            if (deleteOnMove && x === selector.length - 1) {
                                this[i].innerHTML = "";
                            }
                        } else {
                            var moveItem = query.selector(methods[j], this[i]);

                            for (let z = 0; z < moveItem.length; z++) {
                                selector[x].innerHTML += moveItem[z].outerHTML;

                                if (deleteOnMove && x === selector.length - 1) {
                                    moveItem[z].remove();
                                }
                            }
                        }

                    }

                }
            }
        }
    })();
    // end dom methods
    //////////////////////////////////////

    //////////////////////////////////////
    // events
    (function () {
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
                if (target.hasAttribute("class") && target.classList.contains(identifier[i]) || target.hasAttribute("id") && target.getAttribute("id") === identifier[i]
                || target.hasAttribute(identifier)) {
                    found = true;
                }
                else if (target.localName === identifier[i]) {
                    found = true;
                }
            }

            return found;
        }

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
                    helper.exe(this[i], "addEventListener", type[x], fn);
                }
            }

            function fn (e) {
                var target = e.target;

                /**
                 * checks if the target of the event has the same class / id / tag name
                 * as the clicked element 
                 * 
                 * @param {string} identifier 
                 * the target identifier (could be a class name or id or tag name)
                 * 
                 * @param {function} callback 
                 * (optional) when the target is found the callback will execute
                 * 
                 */
                e.isTarget = function (identifier, callback) {
                    identifier = identifier.replace(/\.|#/g, "").replace(/ ,|, /g, ",").split(",");
                    var callbackResult;

                    if (isTarget(target, identifier)) {

                        if (callback) callbackResult = callback();
                        else callbackResult = true;

                    } else {
                        if (callback) callbackResult = null;
                        else callbackResult = false;
                    }

                    return callbackResult;
                }

                /**
                 * checks for an event type
                 * 
                 * @param {string} eventType 
                 * the type of event to listen for
                 * 
                 * @param {function} callback 
                 * if the event is detected the callback will fire
                 */
                e.isEvent = function (eventType, callback) {
                    var result = false,
                        callbackResult;

                    if (e.type === eventType) {
                        if (callback) callbackResult = callback();
                        result = true;
                    }

                    return callbackResult;
                }

                callback ? callback(e, target) : null;
            }

            return this;
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
    })();
    // end events
    //////////////////////////////////////

    //////////////////////////////////////
    // misc methods
    (function () {
        /**
         * gets the value of an element or multiple elements
         * this method cannot be chained
         * 
         * if the main selector has many nodes selected then this method will
         * return an array. If the main selector only has a single node selected
         * only a single boolean is returned 
         * 
         * @param {string} type 
         * (optional) the type of value to get. If this parameter is not used then 
         * it's assumed that the value is for an input node
         * 
         * get attribute values:
         * use the attribute name, eg: "class"
         * 
         * get text content:
         * "text" or "textContent"
         * 
         * get html content:
         * "html" or "innerHTML"
         * 
         * get outer html content:
         * "outer" or "outerHTML"
         * 
         * @return {string|array}
         */
        proto.value = function (type) {
            var values = [];

            for (let i = 0; i < this.length; i++) {
                if (!type && this[i].value) {
                    values.push(this[i].value);
                }
                
                if (type) {
                    if (type.match(/text|textContent/ig)) {
                        values.push(this[i].textContent);
                    }
                    else if (type.match(/html|innerHTML/ig)) {
                        values.push(this[i].innerHTML);
                    }
                    else if (type.match(/outer|outerHTML/ig)) {
                        values.push(this[i].outerHTML);
                    } else {
                        if (this[i].hasAttribute(type)) {
                            values.push(this[i].getAttribute(type));
                        }
                    }
                }
            }

            return values.length === 1 || values.length === 0 ? values[0] : values;
        }

        /**
         * checks if checkboxes are checked or not
         * 
         * if the main selector has many nodes selected then this method will
         * return an array. If the main selector only has a single node selected
         * only a single boolean is returned
         * 
         * @return {boolean|array}
         */
        proto.checked = function () {
            var checks = [];

            for (let i = 0; i < this.length; i++) {
                checks.push(this[i].checked);
            }

            return checks.length === 1 ? checks[0] : checks;
        }

        /**
         * copies text to a clipboard
         * 
         * @param {string} text 
         * the text to copy
         * 
         * @return {void}
         */
        proto.copy = function (text) {
            var textarea = document.createElement("textarea");

            textarea.textContent = text;

            textarea.setAttribute("class", "_xenium_clipboard");
            
            document.body.appendChild(textarea);

            textarea.focus();

            textarea.select();

            document.execCommand("copy");

            return this;
        }

        /**
         * unravels unecessarily nested arrays, eg: [[[[1, 2, 3]]]] 
         * will end up looking like [1, 2, 3]
         * 
         * cannot be chained
         * 
         * @param {array} array 
         * the array to unravel
         * 
         * @return {array}
         */
        proto.unravelArray = function (array) {
            return helper.unravelArray(array);
        }

        /**
         * turns an html nodelist into string format cannot be chained
         * 
         * @param {array} array 
         * (optional) html nodelist if this parameter is not used it will use the main selector nodes
         * 
         * @return {string array}
         */
        proto.htmlToString = function (array) {
            if (!array) array = this;

            return helper.htmlToString(array);
        }

        /**
         * escapes sensitive characters 
         * 
         * @param {string} text 
         * 
         * @returns {string}
         */
        proto.strEscape = function (text) {
            return helper.quote(text)[0];
        }

        /**
         * iterates through arrays or objects
         * 
         * @param {function} callback 
         * the callback has two parameters 
         * 
         * param 1: current object in the loop
         * 
         * param 2: iterator
         * 
         * @return {void}
         */
        proto.foreach = function (callback) {
            if (this[0] instanceof Array || this.length > 1) {
                for (let i = 0; i < this.length; i++) {
                    callback ? callback(this[i], i) : null;
                }
            }
            else if (this[0] instanceof Object) {
                for (let i in this[0]) {
                    callback ? callback(this[0][i], i) : null;
                }
            }

            return this;
        }

        /**
         * performs ajax requests 
         * 
         * @param {object} options 
         * ajax options:
         * 
         * @param {string} options.method
         * @param {string} options.type
         * the ajax method: "POST", "GET"...
         * 
         * @param {string} options.url
         * @param {string} options.open
         * @param {string} options.link
         * @param {string} options.location
         * @param {string} options.action
         * the url to the file that performs the action
         * 
         * @param {string} options.data
         * @param {string} options.send
         * @param {string} options.content
         * @param {string} options.payload
         * (optional) the information to send
         * 
         * if using the "GET" method this parameter isn't needed
         * 
         * @param {function} callback 
         * the ajax callback function
         * 
         * @param {boolean} includeHeaders 
         * whether or not to include request headers
         */
         proto.ajax = function (options, callback, includeHeaders) {
            var xh = new XMLHttpRequest(),
                method = options.method || options.type,
                url = options.url || options.open || options.link || options.location || options.action,
                data = options.data || options.send || options.content || options.payload || "",
                includeHeaders = includeHeaders === undefined || includeHeaders ? true : false,
                ajaxData = {};

            xh.open(method, url);

            if (includeHeaders) xh.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            xh.onreadystatechange = function () {
                if (xh.readyState === 4 && xh.status === 200) {
                    var response = xh.responseText,
                        json = "";
                        
                        try {
                            json = JSON.parse(response);
                        } catch (er) {
                            // 
                        }

                        ajaxData = {
                            response : response,
                            json : json
                        };

                    callback ? callback(ajaxData) : null;
                }
            }

            xh.send(data);
        }

        /**
         * gets the file list from an input node
         * 
         * @param {function} callback 
         * (optional) if this parameter is used the files method can be chained
         * the callback function takes 1 parameter that returns each indiviual file one
         * by one
         * 
         * @return {void|array}
         */
        proto.files = function (callback) {
            if (callback) {
                for (let i = 0; i < this[0].files.length; i++) {
                    callback(this[0].files);
                }

                return this;
            } else {
                return this[0].files;
            }
        }

        /**
         * removes HTML elements from the document
         * 
         * @return {void}
         */
        proto.remove = function () {
            for (let i = 0; i < this.length; i++) {
                this[i].remove();
            }

            return this;
        }

        /**
         * limits the amount of text in the selected node
         * 
         * @param {string} type 
         * whether to limit text by letter or word
         * 
         * to limit by word: "word" or "words"
         * 
         * to limit by letter: "letter" or "letters" or "text" or "txt"
         * 
         * @param {int} amount 
         * how many letters or words to display
         * 
         * @param {string} tail 
         * the end of the limited text, can be anything, usually: "..." eg: 
         * 
         * "this is some text"
         * 
         * "this is so..."
         * 
         * @return {void}
         */
        proto.limit = function (type, amount, tail) {
            var limited = [],
                subject,
                joinMethod,
                iteration = 0,
                tail = tail ? tail : "";

            if (type.match(/word|words/ig)) {
                subject = helper.splitHTML(this[0].innerHTML);
                joinMethod = " ";
            }
            else if (type.match(/letter|letters|text|txt/ig)) {
                subject = helper.splitHTML(this[0].innerHTML, true);
                joinMethod = "";
                amount = amount + 1;
            }

            for (let i = 0; i < subject.length; i++) {
                if (iteration === amount) break;

                if (!subject[i].match(/<.*?>| |<.*?|.*?>/)) iteration++;

                limited.push(subject[i]);
            }

            this[0].innerHTML = limited.join(joinMethod).replace(/ {2,}/g, " ")+tail;

            return this;
        }

        /**
         * changes the case of the text inside a selected element
         * 
         * @param {string} type 
         * the type of case to set
         * 
         * set uppercase: "upper" or "upperCase"
         * 
         * set lowercase: "lower" or "lowerCase"
         * 
         * set camelcase: "camel" or "camelCase"
         * 
         * set sentencecase: "sentence" or "sentenceCase"
         * 
         * @return {void}
         */
        proto.changeCase = function (type) {
            for (let i = 0; i < this.length; i++) {
                if (this[i].textContent.length > 0) {

                    var html = helper.splitHTML(this[i].innerHTML);

                    if (type.match(/upper|upperCase/ig)) {
                        this[i].innerHTML = this[i].innerHTML.toUpperCase();
                    }
                    else if (type.match(/lower|lowerCase/)) {
                        this[i].innerHTML = this[i].innerHTML.toLowerCase();
                    }
                    else if (type.match(/camel|camelCase/ig)) {
                        for (let x = 0; x < html.length; x++) {
                            if (!html[x].match(/<.*?>| |<.*?|.*?>/)) {
                                var wordSplice = html[x].replace(/\n/g, "").split(""),
                                    firstLetter = wordSplice.splice(0, 1).join("").toUpperCase(),
                                    finalLetters = wordSplice.join("");

                                html[x] = firstLetter+finalLetters;
                            }
                        }

                        this[i].innerHTML = html.join(" ");
                    }
                    else if (type.match(/sentence|sentenceCase/ig)) {
                        var letters = html[0].split(""),
                            firstLetter = "",
                            firstLetterIndex;

                        for (let x = 0; x < letters.length; x++) {
                            if (letters[x].match(/\w/)) {
                                firstLetter = letters[x];
                                firstLetterIndex = x;
                                break;
                            }
                        }

                        html.splice(0, 1);

                        letters[firstLetterIndex] = firstLetter.toUpperCase();

                        this[i].innerHTML = letters.join("")+html.join(" ");
                    }

                }
            }
    
            return this;
        }

        /**
         * checks if the value in the main selector is the same as 
         * the value(s) passed into the is function
         * 
         * @param {string|number|array} values 
         * the value to check the main selector for
         * 
         * @param {function} callback 
         * 
         * @return {boolean}
         */
        proto.is = function (values, callback) {
            if (!(values instanceof Array) || typeof values !== "object") values = [values];

            for (let i = 0; i < this.length; i++) {
                for (let x = 0; x < values.length; x++) {
                    if (this[i] === values[x]) {
                        callback ? callback() : null;

                        return true;
                    }
                }
            }

            return false;
        }

        /**
         * gets the first element within in the xenium selector array
         * 
         * @return {any}
         */
        proto.single = function () {
            return this[0];
        }

        /**
         * checks if the value in the selector exists or not
         * 
         * @param {function} callback
         * if the searched for element exists the function will execute
         * 
         * @return {boolean}
         */
        proto.exists = function (callback) {
            if (this[0]) {
                if (this[0].length !== 0) {
                    callback = callback ? callback() : null;

                    return true;
                }
            }

            return false;
        }

        /**
         * focuses on selected input
         * 
         * @return {void}
         */
        proto.focus = function () {
            this[0].focus();

            return this;
        }

        /**
         * selects text content of an input
         */
        proto.select = function () {
            this[0].select();

            return this;
        }

        /**
         * fills out an HTML module works with an ajax request
         * 
         * @param {function} callback 
         * @callback 
         * 
         * @param {object} module
         * the module editing library
         * 
         * @param {*} before 
         * @param {*} after 
         * @returns 
         */
         proto.module = function (callback, before, after) {
            var markup = this[0],
                beforeOriginal = before ? before : "{{",
                afterOriginal = after ? after : "}}",
                lib = {};

            before = helper.escape(beforeOriginal);
            after = helper.escape(afterOriginal);

            /**
             * replaces placeholder content with the desired text/html
             * 
             * @param {string} placeholderName 
             * the name of the placeholder, eg: {{body}} would be "body"
             * 
             * @param {string} content 
             * the content to replace the placeholder with, eg
             * 
             * {{body}} will turn into the value passed in
             * 
             * @return {string}
             */
            lib.placeholder = function (placeholderName, content) {
                var reg = new RegExp(`${before}${placeholderName}${after}`, "igm");

                markup = markup.replace(reg, content);

                return markup;
            }

            /**
             * wraps the placeholder in an element
             * 
             * @param {string} placeholderName 
             * the name of the placeholder, eg: {{body}} would be "body"
             * 
             * multiple placeholders can be wrapper in an element at once, separate
             * each placeholder with a comma, eg:
             * 
             * "body, header, footer"
             * 
             * @param {string} wrap 
             * the type of element to wrap the placeholder in
             * 
             * @param {string} attr 
             * the attributes to give to the wrapper element, multiple new attributes 
             * can be applied at once, eg:
             * 
             * "class=wrapper, title=Wrapper Element"
             * 
             * @return {string}
             */
            lib.wrap = function (placeholderName, wrap, attr) {
                var placeholders = placeholderName.split(/ ,|, |,/g);

                for (let i = 0; i < placeholders.length; i++) {
                    var elem = document.createElement(wrap);

                    if (attr) {
                        var attrs = attr.split(/ ,|, |,/);
    
                        for (let x = 0; x < attrs.length; x++) {
                            var key = attrs[x].split(/=/)[0],
                                value = attrs[x].split(/=/)[1];
    
                            helper.exe(elem, "setAttribute", key, value);
                        }
                    }

                    var reg = new RegExp(`${before}${placeholders[i]}${after}`, "igm");

                    elem.innerHTML = `${beforeOriginal}${placeholders[i]}${afterOriginal}`;

                    markup = markup.replace(reg, elem.outerHTML);
                }

                return markup;
            }

            /**
             * the container to wrap the entire module in
             * 
             * @param {string} element 
             * the type of element to wrap the module in
             * 
             * @param {string} attr 
             * the attributes to give to the wrapper element, multiple new attributes 
             * can be applied at once, eg:
             * 
             * "class=wrapper, title=Wrapper Element"
             * 
             * @return {string}
             */
            lib.container = function (element, attr) {
                var elem = document.createElement(element);

                elem.innerHTML = markup;

                if (attr) {
                    var attrs = attr.split(/ ,|, |,/);

                    for (let x = 0; x < attrs.length; x++) {
                        var key = attrs[x].split(/=/)[0],
                            value = attrs[x].split(/=/)[1];

                        helper.exe(elem, "setAttribute", key, value);
                    }
                }

                markup = elem;

                return markup;
            }

            /**
             * removes unused placeholders
             * 
             * @param  {...any|string} placeholder 
             * multiple unused placeholders can be defined, eg:
             * 
             * "unused1", "unused2", "unused3"
             * 
             * @return {string}
             */
            lib.clear = function (...placeholder) {
                for (let i = 0; i < placeholder.length; i++) {
                    var reg = new RegExp(`${before}${placeholder[i]}${after}`, "igm");

                    markup = markup.replace(reg, "");
                }
            }

            callback ? callback(lib) : null;

            return markup;
        }

        /**
         * stores the module for editing in another script
         * 
         * @param {string} name 
         * the name to save the module as
         * 
         * @param {string} module 
         * the module to save
         * 
         * @return {void}
         */
        proto.pushModule = function (name, module) {
            this.pullModule[name] = module;
        }

        /**
         * gets the saved module
         * 
         * @param {string} name 
         * the name of the saved module to get
         * 
         * @return {string}
         */
        proto.pullModule = function (name) {
            return this.pullModule[name];
        }
    })();
    // end misc methods
    //////////////////////////////////////

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