export class Wire<I, O> {


    constructor(private converter: AbstractJsonConverter<I, O>) {

    }

    transport(object: O) {
        console.log(object);
        console.log(this.converter.decode(object));
    }
}


abstract class AbstractJsonConverter<I, O> {

    abstract enode(data: I): O;

    abstract decode(data: O): I;
}

class ProjektConverter extends AbstractJsonConverter<ProjektJson, Projekt> {

    enode(data: ProjektJson): Projekt {
        return new Projekt(data.name, data.id);
    }

    decode(data: Projekt): ProjektJson {
        return {name: data.name, id: data.id}
    }
}


class Projekt {

    private _name: string;
    private _id: number;

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    constructor(name: string, id: number) {
        this.name = name;
        this.id = id;
    }
}


interface ProjektJson {

    id: number
    name?: string
}

const w = new Wire(new ProjektConverter());

w.transport(new Projekt("test", 1));