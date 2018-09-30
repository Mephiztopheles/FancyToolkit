import { CanvasStyle, Point, Polygon } from "../../Polygon/Polygon.js";

let canvas = document.getElementById( "canvas" );
let context = canvas.getContext( "2d" );

let polygon = new Polygon( 3, 0, new Point( canvas.width / 2, canvas.height / 2 ), 0 );

polygon.radius = ( ( canvas.height - 20 ) / 2 );


polygon.sides[ 0 ].style = new CanvasStyle();
polygon.sides[ 0 ].style.strokeStyle = "red";

polygon.style.fillStyle = "red";
polygon.style.lineWidth = 2;

const module = angular.module( "app", [] );


function drawGrid( ctx ) {

    const data = "<svg width=\"100%\" height=\"100%\" xmlns=\"http://www.w3.org/2000/svg\"> \
        <defs> \
            <pattern id=\"smallGrid\" width=\"8\" height=\"8\" patternUnits=\"userSpaceOnUse\"> \
                <path d=\"M 8 0 L 0 0 0 8\" fill=\"none\" stroke=\"gray\" stroke-width=\"0.5\" /> \
            </pattern> \
            <pattern id=\"grid\" width=\"80\" height=\"80\" patternUnits=\"userSpaceOnUse\"> \
                <rect width=\"80\" height=\"80\" fill=\"url(#smallGrid)\" /> \
                <path d=\"M 80 0 L 0 0 0 80\" fill=\"none\" stroke=\"gray\" stroke-width=\"1\" /> \
            </pattern> \
        </defs> \
        <rect width=\"100%\" height=\"100%\" fill=\"url(#smallGrid)\" /> \
    </svg>";

    const DOMURL = window.URL || window.webkitURL || window;

    const img = new Image();
    const svg = new Blob( [ data ], { type: "image/svg+xml;charset=utf-8" } );
    const url = DOMURL.createObjectURL( svg );

    img.onload = function () {

        ctx.drawImage( img, 0, 0 );
        DOMURL.revokeObjectURL( url );
    };
    img.src = url;
}


module.controller( "AppController", [ "$scope", function ( $scope ) {

    drawGrid( context );
    polygon.paint( context );
    $scope.polygon = polygon;
    $scope.hidden = [];
    $scope.hideAll = false;
    $scope.repaint = function () {

        if ( $scope.hideAll )
            hideAll();

        if ( $scope.paintAllIndices )
            paintAllIndices( true );

        context.clearRect( 0, 0, canvas.width, canvas.height );
        drawGrid( context );
        polygon.paint( context );
    };

    function hideAll() {

        $scope.hidden.length = 0;

        if ( $scope.hideAll )
            for ( let i = 0; i < $scope.polygon.sides.length; i++ )
                $scope.hidden[ i ] = true;
    }

    $scope.$watch( "hideAll", hideAll );

    function paintAllIndices( value ) {

        $scope.polygon.sides.forEach( side => {
            side.style.paintIndex = value;
        } );
    }

    $scope.$watch( "paintAllIndices", function ( value, old ) {

        if ( value !== old ) {
            paintAllIndices( value );

            $scope.repaint();
        }
    } );
} ] );
angular.bootstrap( document.getElementById( "center" ), [ "app" ] );