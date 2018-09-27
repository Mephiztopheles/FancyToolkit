var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AbstractJsonConverter, serializable, Wire } from "../../Wire/Wire.js";
class ProjectConverter extends AbstractJsonConverter {
    encode(data) {
        return this.convert(new Project(), data);
    }
}
let Project = class Project {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
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
};
Project = __decorate([
    serializable("name", "id")
], Project);
const w = new Wire(new ProjectConverter());
w.transport(new Project("test", 1));
w.transport({ name: "programming", id: 2 });
//# sourceMappingURL=index.js.map