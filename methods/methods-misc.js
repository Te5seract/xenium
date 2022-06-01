import { xeniumSelector } from "../src/selector.js";
import { xeniumHelpers } from "../src/helpers.js";

export const xeniumMisc = (function () {
    var query = xeniumSelector,
        helper = xeniumHelpers;

    function methods (proto, sel) {
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

            document.querySelector("._xenium_clipboard").remove();

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
                if (xh.readyState === 4) {
                    options.complete ? options.complete() : null;
                }

                if (xh.readyState === 4 && xh.status === 200) {
                    var response = xh.responseText,
                        json = "";
                        
                        try {
                            json = JSON.parse(response);
                        } catch (er) {
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
         * this function will unpack ajax data
         *
         * @param {object} data
         * the data to unpack
         *
         * @return {string}
        */
        function unpackData (data) {
            var dataStr = "",
                i = 0;

            if (data instanceof Object) {
                const size = Object.keys(data).length - 1;

                for (let item in data) {
                    dataStr += `${encodeURIComponent(item)}=${encodeURIComponent(data[item])}`;

                    dataStr += i !== size ? "&" : "";

                    i++;
                }
            }

            return dataStr;
        }

        /**
         * this function handles ajax requests
         *
         * @param {object} options
         *
         * @param {string} options.url
         * the url to send the request to
         *
         * @param {object} options.data
         * the data to send with the request (key value pairs)
         *
         * @param {string} options.method
         * the request method (GET, POST...)
         *
         * @param {callable} options.done
         * this callback will execute if the request is complete
         *
         * @param {callable} options.error
         * this callback will execute if there is an error
         *
         * @param {callable} options.success
         * this callback will execute if the request is successful
         *
         * @param {obect} options.headers
         * this is to set request headers, they're key/value pairs:
         * "Content-Type" : "application/json"
         *
         * @param {FormData} options.formData
         * this will take a form data object for media uploads or just
         * general form data stuff
         *
         * @return {void}
        */
        function xhr (options) {
            var xr = new XMLHttpRequest(),
                url = options.url ? options.url : "",
                data = options.data ? unpackData(options.data) : null,
                method = options.method ? options.method : "POST",
                done = options.done ? options.done : null,
                error = options.error ? options.error : null,
                success = options.success ? options.success : null,
                headers = options.headers ? options.headers : null,
                formData = options.formData ? options.formData : null;

            if (method.match(/GET/i) && data) {
                url = `${url}?${data}`;
            }

            xr.open(method, url);

            if (!formData) {
                xr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }

            if (headers) {
                for (let key in headers) {
                    xr.setRequestHeader(key, headers[key]);
                }
            }

            xr.onreadystatechange = function () {
                if (xr.readyState === 4 && xr.status === 200) {
                    let response = {};

                    try {
                        response.json = JSON.parse(xr.responseText);
                    } catch (e) {
                        response.json = null
                    }

                    response.text = xr.responseText;

                    success ? success(response) : success;
                }

                if (xr.status > 400 && xr.readyState === 4) {
                    error ? error() : error;
                }

                if (xr.readyState === 4) {
                    done ? done() : done;
                }
            }

            if (!method.match(/GET/i)) {
                xr.send(data || formData);
            } else {
                xr.send();
            }
        }

        /**
         * this method will send a post request
         *
         * @param {string} url
         * the url to send the request to
         *
         * @param {object} options
         *
         * @param {object} options.data
         * the data to send with the request (key value pairs)
         *
         * @param {callable} options.done
         * this callback will execute if the request is complete
         *
         * @param {callable} options.error
         * this callback will execute if there is an error
         *
         * @param {callable} options.success
         * this callback will execute if the request is successful
         *
         * @param {obect} options.headers
         * this is to set request headers, they're key/value pairs:
         * "Content-Type" : "application/json"
         *
         * @param {FormData} options.formData
         * this will take a form data object for media uploads or just
         * general form data stuff
         *
         * @return {void}
        */
        sel.post = function (url, options) {
            var data = options.data ? options.data : null,
                done = options.done ? options.done : null,
                error = options.error ? options.error : null,
                success = options.success ? options.success : null,
                headers = options.headers ? options.headers : null,
                formData = options.formData ? options.formData : null;

            xhr({
                method : "POST",
                url : url,
                data : data,
                done : () => {
                    done ? done() : done
                },
                error : () => {
                    error ? error() : error;
                },
                success : (data) => {
                    success ? success(data) : success;
                },
                formData : formData,
                headers : headers
            });
        }

        /**
         * this method will send a get request
         *
         * @param {string} url
         * the url to send the request to
         *
         * @param {object} options
         *
         * @param {object} options.data
         * the data to send with the request (key value pairs)
         *
         * @param {callable} options.done
         * this callback will execute if the request is complete
         *
         * @param {callable} options.error
         * this callback will execute if there is an error
         *
         * @param {callable} options.success
         * this callback will execute if the request is successful
         *
         * @param {obect} options.headers
         * this is to set request headers, they're key/value pairs:
         * "Content-Type" : "application/json"
         *
         * @param {FormData} options.formData
         * this will take a form data object for media uploads or just
         * general form data stuff
         *
         * @return {void}
        */
        sel.get = function (url, options) {
            var data = options.data ? options.data : null,
                done = options.done ? options.done : null,
                error = options.error ? options.error : null,
                success = options.success ? options.success : null,
                headers = options.headers ? options.headers : null,
                formData = options.formData ? options.formData : null;

            xhr({
                method : "GET",
                url : url,
                data : data,
                done : () => {
                    done ? done() : done
                },
                error : () => {
                    error ? error() : error;
                },
                success : (data) => {
                    success ? success(data) : success;
                },
                formData : formData,
                headers : headers
            });
        }

        /**
         * this method will send any request type that
         * is specified
         *
         * @param {string} url
         * the url to send the request to
         *
         * @param {object} options
         *
         * @param {object} options.data
         * the data to send with the request (key value pairs)
         *
         * @param {string} options.method
         * the request method (GET, POST...)
         *
         * @param {callable} options.done
         * this callback will execute if the request is complete
         *
         * @param {callable} options.error
         * this callback will execute if there is an error
         *
         * @param {callable} options.success
         * this callback will execute if the request is successful
         *
         * @param {obect} options.headers
         * this is to set request headers, they're key/value pairs:
         * "Content-Type" : "application/json"
         *
         * @param {FormData} options.formData
         * this will take a form data object for media uploads or just
         * general form data stuff
         *
         * @return {void}
        */
        sel.xhr = function (url, options) {
            var data = options.data ? options.data : null,
                method = options.method ? options.method : "POST",
                done = options.done ? options.done : null,
                error = options.error ? options.error : null,
                success = options.success ? options.success : null,
                headers = options.headers ? options.headers : null,
                formData = options.formData ? options.formData : null;

            xhr({
                method : method,
                url : url,
                data : data,
                done : () => {
                    done ? done() : done
                },
                error : () => {
                    error ? error() : error;
                },
                success : (data) => {
                    success ? success(data) : success;
                },
                formData : formData,
                headers : headers
            });
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
    }

    return {
        set : function (proto, sel) {
            methods(proto, sel);
        }
    }
})();
