import Core from "../Core/Core.js";

const core = new Core( "#test > div" );

core.onRemove( index => {
    console.log( index );
} );


const core2 = new Core( ".child" );


core2.onRemove( index => {
    console.log( index );
} );

setInterval( () => {
    $( $( "#test").find("> div" )[ 0 ] ).remove();


    $( $( ".child" )[ 0 ] ).remove();
}, 2000 );