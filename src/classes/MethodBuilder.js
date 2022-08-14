// selector
export default class MethodBuilder {
    constructor (props, instances) {
        const {proto, sel, helper, query} = props,
            instanceObjs = {};

        this.proto = proto;
        this.sel = sel;
        this.helper = helper;
        this.query = query;
        this.instances = instances;

        for (let key in this.instances) {
            const instance = new this.instances[key](),
                protos = Object.getPrototypeOf(instance),
                methods = Object.getOwnPropertyNames(protos);

            this.setProtos(protos, methods);
        }
    }

    setProtos (protos, methods) {
        methods.forEach(method => {
            if (method !== "constructor") {
                if (!method.match(/\$/)) this.proto[method] = protos[method];
                else this.sel[method.replace(/\$/g, "")] = protos[method];
            }
        });
    }
}
