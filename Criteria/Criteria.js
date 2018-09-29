import AST from "../AST/AST.js";

function sort( arr, sort ) {

    return arr.sort( function ( a, b ) {

        const propertyA = Fancy.getKey( a, query.sort.split( "," )[ 0 ] ),
            propertyB = Fancy.getKey( b, query.sort.split( "," )[ 0 ] ),
            direction = query.sort.split( "," )[ 1 ];

        return direction === "desc" ? propertyA < propertyB : propertyA > propertyB;
    } );
}

function getKey( o, s ) {

    s = s.replace( /\[(\w+)\]/g, ".$1" ); // convert indexes to properties
    s = s.replace( /^\./, "" ); // strip a leading dot
    const a = s.split( "." );

    for ( let i = 0; i < a.length; i++ ) {

        const k = a[ i ];
        if ( k.indexOf( "(" ) === -1 ) {

            if ( o.hasOwnProperty( k ) )
                o = o[ k ];
            else
                return;

        } else {

            const K = k.split( "(" )[ 0 ];
            if ( o[ K ] !== null && o[ K ] !== null )
                o = o[ K ]();
            else
                return;
        }
    }

    return o;
}

export class Criteria {

    constructor( array ) {
        this.array = array;
    }

    list( index ) {

        try {

            const list = [],
                sortedArray = this.array;

            if ( this.query.sort )
                sortedArray = this.sort( sortedArray );

            sortedArray.forEach( ( it, i ) => {

                if ( this.query.matches( it ) ) {

                    if ( index )
                        list[ i ] = it;
                    else
                        list.push( it );
                }
            } );

            if ( this.query.offset ) {

                let i = 0;
                while ( i < this.query.offset ) {

                    list.shift();
                    i++;
                }
            }
            if ( this.query.max )
                list.splice( this.query.max );

            return list;

        } catch ( e ) {

            const error = new Error( `Error while matching. Query: ${this.query}. Message: ${e}` );
            error.stack = e.stack;
            throw error;
        }
    };

    sort( arr ) {

        function sort( settings, sortIndex, a, b ) {

            const propertyA = getKey( a, settings[ sortIndex ].field ),
                propertyB = getKey( b, settings[ sortIndex ].field );

            let position = 0;

            if ( settings[ sortIndex ].direction === "asc" ) {

                if ( propertyA < propertyB ) position = -1;
                else if ( propertyA > propertyB ) position = 1;

            } else {

                if ( propertyA > propertyB ) position = -1;
                else if ( propertyA < propertyB ) position = 1;
            }

            sortIndex++;
            if ( position === 0 && settings[ sortIndex ] )
                return sort( settings, sortIndex, a, b );

            return position;
        }

        return arr.sort( ( a, b ) => {
            return sort( this.query.sort, 0, a, b );
        } );
    }
}

/**
 *
 * @param {String} string
 * @returns {Query}
 * @constructor
 */
export class Query {

    constructor( string ) {

        this.offset = 0;
        this.max = null;
        this.sort = [];

        if ( string.match( /SORT/ ) ) {

            string.match( /((?:\w+):(?:asc|desc))+/g ).forEach( sort => {

                const parts = sort.split( ":" );
                this.sort.push( { field: parts[ 0 ], direction: parts[ 1 ] } );
            } );
        } else {
            this.sort = false;
        }

        const offset = string.match( /OFFSET (\d+)/ );
        if ( offset )
            this.offset = parseInt( offset[ 1 ] );

        const max = string.match( /MAX (\d+)/ );
        if ( max )
            this.max = parseInt( max[ 1 ] );

        function createCondition( string ) {


            let openings = 0,
                parts = [],
                i = 0;

            function parseCondition( string ) {

                const parts = string.match( /((?:\w)+):([a-z]+)\((.+)\)/ );

                return new Condition( parts[ 1 ], parts[ 2 ], parts[ 3 ] );
            }

            function parseConditions( string ) {

                let parts = [],
                    conditions;

                var eRegex = /^,?(?:(\w+:[a-z]+\(.+\)),)*(AND|OR)\{([^{}]+)\}(?:,(\w+:[a-z]+\(.+\)))*/,
                    dRegex = /^,?(?:(\w+:[a-z]+\(.+\)),)*(AND|OR)\{(.+)\}(?:,(\w+:[a-z]+\(.+\)))*/;

                const eMatches = string.match( eRegex );

                if ( eMatches )
                    conditions = eMatches;
                else
                    conditions = string.match( dRegex );

                if ( conditions ) {

                    function addCondition( match ) {


                        if ( match[ 1 ] ) {

                            match[ 1 ].split( ")," ).forEach( p => {
                                parts.push( parseCondition( p.replace( /([^)]$)/, ")" ) ) );
                            } );
                        }

                        const parsed = parseConditions( match[ 3 ] );
                        parsed.unshift( null );

                        if ( match[ 2 ] === "OR" )
                            parts.push( new ( Function.prototype.bind.apply( Or, parsed ) ) );
                        else
                            parts.push( new ( Function.prototype.bind.apply( And, parsed ) ) );


                        if ( match[ 4 ] ) {

                            match[ 4 ].substr( 1 ).split( ")," ).forEach( p => {
                                parts.push( parseCondition( p + ")" ) );
                            } );
                        }
                    }

                    let match;
                    while ( match = string.match( eMatches ? eRegex : dRegex ) ) {

                        string = string.replace( `${match[ 2 ]}{${match[ 3 ]}}`, "" );

                        addCondition( match );
                    }


                } else {

                    parts = string.match( /(\w+:[a-z]+\([^)]+\))/g ) || [];
                    if ( parts && parts.length ) {

                        parts.forEach( ( p, i ) => {
                            parts[ i ] = ( parseCondition( p ) );
                        } );
                    }

                }

                return parts;
            }

            const parsed = parseConditions( string );
            parsed.unshift( null );
            return new ( Function.prototype.bind.apply( And, parsed ) );
        }


        this.condition = createCondition( string );
        this.query = string;
    }

    toString() {
        return this.query.toString();
    }

    matches( item ) {
        return this.condition.matches( item );
    }
}

export class Condition {

    constructor( name, type, value ) {

        if ( arguments.length !== 0 ) {

            this.name = name;
            this.type = type;
            this.value = value;
        }
    }

    matches( object ) {

        if ( !this[ this.type ] )
            throw `${this.type} is not supported. If you want to use it add it to the Conditions prototype`;

        const matcher = this[ this.type ]();
        if ( !matcher )
            return false;


        let fn = Condition.generateFunction( matcher );
        try {
            return fn( object );
        } catch ( e ) {
            console.log( fn );
            throw e;
        }
    }

    toString() {
        return `${this.name}:${this.type}(${this.value})`;
    }

    static generateFunction( string ) {
        return new Function( new AST( string ).compile().generate() )();
    }

    eq() {
        return `${this.name} === ${this.value}`;
    }

    like() {

        if ( !this.value )
            return false;

        return `${this.name}.toLowerCase().indexOf(${this.value}.toLowerCase()) != -1`;
    }

    gt() {
        return `${this.name} > ${this.value}`;
    }

    lt() {
        return `${this.name} < ${this.value}`;
    }

    gte() {
        return `${this.name} >= ${this.value}`;
    }

    lte() {
        return `${this.name} <= ${this.value}`;
    }

    bt() {

        let s = this.value.split( "," );
        return `${this.name} > ${s[ 0 ]} && ${s[ 1 ]} > ${this.name}`;
    }
}

Condition.LIKE = "like";
Condition.EQUALS = "eq";
Condition.LOWER_THAN = "lt";
Condition.LOWER_THAN_EQUALS = "lte";
Condition.GREATER_THAN = "gt";
Condition.GREATER_THAN_EQUALS = "gte";
Condition.BETWEEN = "bt";
Condition.NOT = "not";

export class And extends Condition {

    constructor( ...conditions ) {

        super();
        this.conditions = conditions;
    }

    matches( object ) {

        for ( let i = 0; i < this.conditions.length; i++ )
            if ( !this.conditions[ i ].matches( object ) )
                return false;

        return true;
    }

    toString() {

        let string = "AND{";
        this.conditions.forEach( condition => ( string += condition ) );
        return string + "}";
    }
}

export class Or extends Condition {

    constructor( ...conditions ) {

        super();
        this.conditions = conditions;
    }

    matches( object ) {

        for ( let i = 0; i < this.conditions.length; i++ )
            if ( this.conditions[ i ].matches( object ) )
                return true;

        return false;
    }

    toString() {

        let string = "OR{";
        this.conditions.forEach( condition => ( string += condition ) );
        return string + "}";
    }
}