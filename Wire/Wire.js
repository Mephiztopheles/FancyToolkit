export class Wire {
    constructor(converter) {
        this.converter = converter;
    }
    transport(object) {
        console.log(object);
        console.log(this.converter.decode(object));
    }
}
class AbstractJsonConverter {
}
class ProjektConverter extends AbstractJsonConverter {
    enode(data) {
        return new Projekt(data.name, data.id);
    }
    decode(data) {
        return { name: data.name, id: data.id };
    }
}
class Projekt {
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}
const w = new Wire(new ProjektConverter());
w.transport(new Projekt("test", 1));
//# sourceMappingURL=Wire.js.map