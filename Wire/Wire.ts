export class Wire<I, O> {


    constructor( private converter:AbstractJsonConverter<I, O> ) {

    }

    transport( object:O | I ) {

        if ( Object.getPrototypeOf( object ) == Object.prototype )
            console.log( this.converter.encode( <I>object ) );
        else
            console.log( this.converter.decode( <O>object ) );
    }
}


export abstract class AbstractJsonConverter<I, O> {

    abstract encode( data:I ):O;

    public decode( data:O ):I {
        return <I> this.convert( data );
    }

    protected convert( entry:O, data?:I ):I | O {

        const props = glue[ entry.constructor.name ];
        if ( props == null )
            throw new Error( `${entry.constructor.name} is not serializable!` );
        if ( data != undefined ) {


            props.forEach( key => {
                entry[ key ] = data[ key ];
            } );

            return entry;

        } else {

            data = <I>{};

            props.forEach( key => {
                data[ key ] = entry[ key ];
            } );
            return data;
        }
    }
}

const glue = {};


export function serializable( ...proeprties:string[] ) {

    return function ( constructor:Function ) {
        glue[ constructor.name ] = proeprties;
    };
}