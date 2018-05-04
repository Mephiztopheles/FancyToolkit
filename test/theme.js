
const button = document.createElement( "button" );


button.innerHTML = "Back";
button.className = "FancyToolkit-back-button";

button.addEventListener( "click", () => {

    if ( document.referrer === location.href.replace( /[^/]+\/?$/, "" ) )
        history.back();
    else
        location.href = "../";
} );

addEventListener( "load", () => {

    document.body.appendChild( button );

} );

const link = document.createElement( "link" );
link.href = "../theme.css";
link.rel = "stylesheet";
document.head.appendChild( link );