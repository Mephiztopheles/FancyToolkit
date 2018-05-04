import { AbstractJsonConverter, serializable, Wire } from "../../Wire/Wire.js";

class ProjectConverter extends AbstractJsonConverter<ProjectJson, Project> {

    encode( data:ProjectJson ):Project {
        return <Project>this.convert( new Project(), data );
    }
}


@serializable( "name" )
class Project {

    private _name:string;
    private _id:number;

    get id():number {
        return this._id;
    }

    set id( value:number ) {
        this._id = value;
    }

    get name():string {
        return this._name;
    }

    set name( value:string ) {
        this._name = value;
    }

    constructor( name?:string, id?:number ) {
        this.name = name;
        this.id = id;
    }
}


interface ProjectJson {

    id:number
    name?:string
}

const w = new Wire( new ProjectConverter() );

w.transport( new Project( "test", 1 ) );
w.transport( { name: "programming", id: 2 } );