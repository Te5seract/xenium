export default class XeniumFlags {
    /**
     * gets the first instance an HTML element with 
     * the specified selector
     *
     * @param {object} params
     * dynamic list of params from an object to
     * pass to the flag function
     *
     * @param {string} params.selector
     * the node selector string
     *
     * @param {HTMLElement} params.within
     * an element to query another element from within
     *
     * @return {HTMLElement}
    */
    _noFlag ({selector, within}) {
        return this._selector(selector, within)[0];
    }

    /**
     * get all elements of a specified identifier
     *
     * @param {object} params
     * dynamic list of params from an object to
     * pass to the flag function
     *
     * @param {string} params.selector
     * the node selector string
     *
     * @param {HTMLElement} params.within
     * an element to query another element from within
     *
     * @return {array}
    */
    _all ({selector, within}) {
        return this._selector(selector, within);
    }

    /**
     * directly selects a specified element
     *
     * @param {object} params
     * dynamic list of params from an object to
     * pass to the flag function
     *
     * @param {string} params.selector
     * the node selector string
     *
     * @param {HTMLElement} params.within
     * an element to query another element from within
     *
     * @param {string} params.value
     * the value for the flag function to evaluate
     *
     * @return {HTMLElement}
    */
    _direct ({selector, within, value}) {
        return this._selector(selector, within)[value];
    }

    /**
     * gets a range of nodes between and including two 
     * specified numbers, eg {1 > 10} or {1 > last}
     * the last keyword obviously gets the last node
     *
     * @param {object} params
     * dynamic list of params from an object to
     * pass to the flag function
     *
     * @param {string} params.selector
     * the node selector string
     *
     * @param {HTMLElement} params.within
     * an element to query another element from within
     *
     * @param {string} params.value
     * the value for the flag function to evaluate
     *
     * @return {array}
    */
    _range ({selector, within, value}) {
        const nodes = this._selector(selector, within),
            valueSplit = value.split(">");

        let valueOne = valueSplit[0].match(/last/i) ? 0 : Number(valueSplit[0]),
            valueTwo = valueSplit[1].match(/last/i) ? this._last(selector, within) : Number(valueSplit[1]);

        if (valueOne > valueTwo) {
            const valueOneOrigin = valueOne;

            valueOne = valueTwo;
            valueTwo = valueOneOrigin;
        }

        return nodes.filter((node, i) => i >= valueOne && i <= valueTwo ? node : null);
    }

    /**
     * get all even instances of nodes
     *
     * @param {object} params
     * dynamic list of params from an object to
     * pass to the flag function
     *
     * @param {string} params.selector
     * the node selector string
     *
     * @param {HTMLElement} params.within
     * an element to query another element from within
     *
     * @param {string} params.value
     * the value for the flag function to evaluate
     *
     * @return {array}
    */
    _even ({selector, within, value}) {
        const nodes = this._selector(selector, within);

        return nodes.map((node, i) => {
            if (i > 0 && nodes[(i * 2) - 1]) return nodes[(i * 2) - 1];
        }).filter(Boolean);
    }

    /**
     * get all odd instances of nodes
     *
     * @param {object} params
     * dynamic list of params from an object to
     * pass to the flag function
     *
     * @param {string} params.selector
     * the node selector string
     *
     * @param {HTMLElement} params.within
     * an element to query another element from within
     *
     * @param {string} params.value
     * the value for the flag function to evaluate
     *
     * @return {array}
    */
    _odd ({selector, within, value}) {
        const nodes = this._selector(selector, within);

        return nodes.map((node, i) => {
            if (nodes[i * 2]) return nodes[i * 2];
        }).filter(Boolean);
    }


    /**
     * get a specifically selected group of nodes
     *
     * @param {object} params
     * dynamic list of params from an object to
     * pass to the flag function
     *
     * @param {string} params.selector
     * the node selector string
     *
     * @param {HTMLElement} params.within
     * an element to query another element from within
     *
     * @param {string} params.value
     * the value for the flag function to evaluate
     *
     * @return {array}
    */
    _group ({selector, within, value}) {
        const nodes = this._selector(selector, within),
            valueSplit = value.split("&"),
            nodesFiltered = [];

        valueSplit.forEach(value => nodesFiltered.push(nodes[value.match(/last/i) ? this._last(selector, within) : Number(value)]));

        return nodesFiltered;
    }

    /**
     * randomly selects an element with the same
     * selector name
     *
     * @param {object} params
     * dynamic list of params from an object to
     * pass to the flag function
     *
     * @param {string} params.selector
     * the node selector string
     *
     * @param {HTMLElement} params.within
     * an element to query another element from within
     *
     * @param {string} params.value
     * the value for the flag function to evaluate
     *
     * @return {array}
    */
    _rand ({selector, within, value}) {
        const {helper} = this.libs.require("helper"),
            nodes = this._selector(selector, within),
            valueSplit = value.split("|"),
            range = valueSplit[1].match(/-/) ? valueSplit[1].split("-") : valueSplit[1];

        if (helper.type(range) === "array") {
            const min = Number(range[0]),
                max = range[1].match(/last/) ? this._last(selector, within) : Number(range[1]),
                rand = Math.floor(Math.random(min) * max);

            return nodes[rand];
        }

        return ;
    }

    /**
     * gets the index of the last instance of a
     * node with the specified selector
     *
     * @param {string} selector
     * the node selector string
     *
     * @param {HTMLElement} within
     * an element to query another element from within
     *
     * @return {int}
    */
    _last (selector, within) {
        const nodes = this._selector(selector, within);

        return nodes.length - 1;
    }

    /**
     * determines the flag function type and value
     *
     * @param {string} flag
     * the flag contents
     *
     * @return {string}
    */
    _flagType (flag) {
        return this._flagRouter(flag, {
            _noFlag : /none/i,
            _all : /^all$|^\*$/i,
            _even : /^even$|^evn$/i,
            _odd : /^odd/i,
            _direct : /^\d+$/g,
            _range : /\d+(| )>(| )(\d+|last)/g,
            _group : /\d+( & |&)/g,
            _rand : /rand|random/i
        });
    }

    /**
     * finds a matching flag and returns its function caller and value
     *
     * _func:flag value
     *
     * @param {string} flag
     * the flag type
     *
     * @param {object} key value pair, key is the function call and
     * value is the reg ex for the flag value
     *
     * @return {string}
    */
    _flagRouter (flag, flags) {
        for (let key in flags) {
            if (flag.match(flags[key])) {
                return `${key}:${flag}`;
            }
        }
    }

    /**
     * sets up parameters to pass to the flag
     * functions. This will be an object.
     *
     * @param {string} flag
     * the result of _flagType expecting _flagFunc:flag
     * key : value pair
     *
     * @param {object} append
     * custom params to append to the flagParams return 
     * object
     *
     * @return {object}
    */
    _flagParams (flag, append) {
        const params = {},
            flagSplit = flag.split(":"),
            value = flagSplit[1];

        if (value) params.value = value;

        if (append) {
            for (let key in append) params[key] = append[key];
        }

        return params;
    }

    /**
     * executes the flag function
     *
     * @param {string} type
     * the flag type
     *
     * @param {string} selector
     * the query selector string of an HTML element
     *
     * @param {HTMLElement} within
     * an element to query another element from within
    */
    _doFlag (type, selector, within) {
        if (!selector) return selector;

        const {helper} = this.libs.require("helper"),
            flag = type.split(":")[0],
            nodes = this[flag](this._flagParams(type, {selector : selector, within : within}));

        return nodes ? nodes : [];
    }
}
