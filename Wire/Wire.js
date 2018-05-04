export class Wire {
    constructor(converter) {
        this.converter = converter;
    }
    transport(object) {
        if (Object.getPrototypeOf(object) == Object.prototype)
            console.log(this.converter.encode(object));
        else
            console.log(this.converter.decode(object));
    }
}
export class AbstractJsonConverter {
    decode(data) {
        return this.convert(data);
    }
    convert(entry, data) {
        const props = glue[entry.constructor.name];
        if (props == null)
            throw new Error(`${entry.constructor.name} is not serializable!`);
        if (data != undefined) {
            props.forEach(key => {
                entry[key] = data[key];
            });
            return entry;
        }
        else {
            data = {};
            props.forEach(key => {
                data[key] = entry[key];
            });
            return data;
        }
    }
}
const glue = {};
export function serializable(...proeprties) {
    return function (constructor) {
        glue[constructor.name] = proeprties;
    };
}
//# sourceMappingURL=Wire.js.map