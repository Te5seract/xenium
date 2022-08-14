export default class XeniumHelpers {
    constructor () {
        this.hooks = {};
    }

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
    exe (element, hook, ...values) {
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
    unravelArray (array) {
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
    nodeRelatives (element, method) {
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
    arrayGet (mode, array, identifier) {
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
    htmlToString (array) {
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
    escape (string) {
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
    quote (items) {
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
    arrayIndex (subject, needle) {
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
    removeArrayIndex (subject, index) {
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
    splitHTML (html, letter) {
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
    elementIdentifier (nodes, identifier) {
        if ((identifier instanceof Array)) identifier = identifier[0];

        var noIdChars = identifier.replace(/\.|#/g, "");

        if (!(nodes instanceof Array)) nodes = [nodes];

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] !== document) {
                if (nodes[i].hasAttribute("class") && nodes[i].classList.contains(noIdChars) || 
                nodes[i].hasAttribute("id") && nodes[i].getAttribute("id") === noIdChars ||
                nodes[i].localName === identifier) {
                    return true;
                }
            }
        }

        return false;
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
    elementIdentifier (nodes, identifier) {
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
    type (item) {
        if (item instanceof Array) return "array";
        else if (item instanceof HTMLElement) return "html";
        else if (item instanceof NodeList) return "node-list";
        else if (item && item.constructor.name === "Xenium") return "xenium";
        else if (item instanceof Object) return "object";

        return typeof item;
    }

    /**
     * extracts the class or id from the selected element
     * 
     * @param {HTMLElement} element 
     * 
     * @return {object}
     */
    extractIdentifier (element, validSelector) {
        var classes = [],
            id = "",
            tag = element.localName ? element.localName : "";

        for (let i = 0; i < element.classList.length; i++) {
            classes.push(element.classList[i]);
            tag = element.localName;
        }

        classes = classes.length > 1 ? classes : classes[0];

        if (validSelector) {
            if (classes) classes = this.type(classes) === "array" ? "."+classes.join(".") : "."+classes;

            if (element.getAttribute("id")) {
                id ? "#"+element.getAttribute("id") : element.getAttribute("id");
            }
        }


        let result = {
            id : id,
            classList : classes && classes.length ? classes : "",
            tag : tag,
            attributes : f.getAttributes(element, "class", "id")
        }

        return result;
    }

    /**
     * sets a hook that can be accessed throughout the internal
     * library for development
     *
     * @param {string} name
     * the name of the hook
     *
     * @param {array} ...params
     * parameters to send to the hook
     *
     * @return {void}
    */
    setHook (name, ...params) {
        this.hooks[name] = params;

        return;
    }

    /**
     * appends more content to an already defined hook
     *
     * @param {string} name
     * the hook you want to add data to
     *
     * @param {array} ...params
     * the data to store in the defined hook
     *
     * @return {void}
    */
    appendHook (name, ...params) {
        if (this.hooks[name]) {
            this.hooks[name].push(params);
        }
        
        return;
    }

    /**
     * gets a hook that has been set and if parameters
     * have been provided the callback param can get
     * them
     *
     * @param {string} name
     * the name of the hook to get
     *
     * @param {callable} callback
     * this function will execute if the hook is found
     *
     * @return {void}
    */
    getHook (name, callback) {
        if (this.hooks[name]) {
            return callback(this.hooks[name]);
        }

        return;
    }

    /**
     * changes the case for a string
     *
     * @param {string} subject
     * the string to change the case of
     *
     * @param {string} split
     * what character to split the string by
     *
     * @param {string} join what character to 
     * rejoin the string by
     *
     * @type {string} type
     * the change case type (upper, upperCase, lower, lowerCase, camel, camelCase)
     *
     * @return {string}
    */
    changeCase (subject, split, join, type) {
        if (type.match(/upper|upperCase/ig)) {
            subject = subject.toUpperCase();
        }
        else if (type.match(/lower|lowerCase/)) {
            subject.innerHTML = subject.innerHTML.toLowerCase();
        }
        else if (type.match(/camel|camelCase/ig)) {
            let wordSplit = subject.split(split);

            for (let x = 0; x < wordSplit.length; x++) {
                if (x > 0) {
                    var wordSplice = wordSplit[x].replace(/\n/g, "").split(""),
                        firstLetter = wordSplice.splice(0, 1).join("").toUpperCase(),
                        finalLetters = wordSplice.join("");

                    wordSplit[x] = firstLetter+finalLetters;
                }
            }

            subject = wordSplit.join(join);
        }

        return subject;
    }

    /**
     * loops through an array
     *
     * @param {array} iterable
     * the array to iterate through
     *
     * @param {callable} callback
     * this callback will execute for each iteration
     *
     * @return {void}
    */
    each (iterable, callback) {
        for (let i = 0; i < iterable.length; i++) {
            callback(iterable[i], i);
        }

        return;
    }

    getAttributes (element, ...exclude) {
        let attrs = element.attributes,
            attrList = [];

        for (let key in attrs) {
            let nodeName = attrs[key].nodeName;

            if (nodeName && f.type(nodeName) !== "function" && exclude.indexOf(nodeName) === -1) {
                attrList.push(!nodeName.match(/id|class/i) ? `[${nodeName}]` : nodeName);
            }
        }

        return !attrList.length ? null : attrList;
    }
} // end class
