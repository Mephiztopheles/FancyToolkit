const privates = new WeakMap();

export class Point {

    constructor( x, y ) {

        this.x = x;
        this.y = y;
    }
}

function value( a, b ) {
    return a == null ? b : a;
}

export class Side {

    constructor( polygon, index, start, end ) {


        this.polygon = polygon;

        this.index = index;
        this.start = start;
        this.end = end;
        this.style = new CanvasStyle;
    }

    paintIndex( context ) {

        if ( !this.style.paintIndex )
            return;

        const font = context.font;
        const fillStyle = context.fillStyle;
        context.font = "11px Arial";
        context.fillStyle = "black";
        let x = this.start.x;
        let y = this.start.y;


        x += ( this.end.x - this.start.x ) / 2;
        if ( x < this.polygon.middle.x )
            x -= 10;
        else
            x += 5;

        y += ( this.end.y - this.start.y ) / 2;
        if ( y < this.polygon.middle.y )
            y -= 5;
        else
            y += 10;


        context.fillText( this.index, x, y );
        context.font = font;
        context.fillStyle = fillStyle;
    }
}

export class CanvasStyle {

    static defaults() {

        let style = new CanvasStyle();

        style.fillStyle = "transparent";
        style.strokeStyle = "#000000";
        style.shadowBlur = 0;
        style.shadowColor = "#000000";
        style.shadowOffsetX = 0;
        style.shadowOffsetY = 0;
        style.lineCap = "butt";
        style.lineJoin = "miter";
        style.lineWidth = 1;
        style.miterLimit = 10;
        style.paintIndex = false;

        return style;
    }
}

function getRadius( polygon ) {
    return polygon.lengthOfSide / ( 2 * Math.sin( Math.PI / polygon.edgesCount ) );
}

function getCentralAngle( polygon ) {
    return 2 * Math.PI * polygon.winding / polygon.edgesCount;
}

function getAngle( polygon ) {
    return 180 - 360 / polygon.edgesCount;
}

export class Polygon {

    constructor( edgesCount, lengthOfSide, middle, rotation = 0, winding = 1 ) {

        let style = CanvasStyle.defaults();
        privates.set( this, {
            lengthOfSide,
            rotation,
            winding,
            middle,
            style
        } );

        this.edgesCount = edgesCount;

        this.calculateSides();
    }

    get edgesCount() {
        return privates.get( this ).edgesCount;
    }

    set edgesCount( value ) {

        if ( value < 3 )
            throw new Error( "Did you ever see a polygon with less than 3 sides?" );

        privates.get( this ).edgesCount = value;
        privates.get( this ).centralAngle = getCentralAngle( this );
        privates.get( this ).angle = getAngle( this );
        this.calculateSides();
        return value;
    }

    get radius() {
        return privates.get( this ).radius;
    }

    set radius( value ) {

        privates.get( this ).radius = value;
        privates.get( this ).lengthOfSide = value * ( 2 * Math.sin( Math.PI / this.edgesCount ) );
        this.calculateSides();

        return value;
    }

    get lengthOfSide() {
        return privates.get( this ).lengthOfSide;
    }

    set lengthOfSide( value ) {

        privates.get( this ).lengthOfSide = value;
        privates.get( this ).radius = getRadius( this );

        return value;
    }

    get centralAngle() {
        return privates.get( this ).centralAngle;
    }

    set centralAngle( value ) {

        privates.get( this ).centralAngle = value;
        this.calculateSides();
        return value;
    }

    get rotation() {
        return privates.get( this ).rotation;
    }

    set rotation( value ) {

        privates.get( this ).rotation = value;
        this.calculateSides();
        return value;
    }

    get style() {
        return privates.get( this ).style;
    }

    get middle() {
        return privates.get( this ).middle;
    }

    set middle( value ) {
        return privates.get( this ).middle = value;
    }

    get winding() {
        return privates.get( this ).winding;
    }

    set winding( value ) {

        privates.get( this ).winding = value;
        this.centralAngle = getCentralAngle( this );
        return value;
    }

    paint( context ) {

        if ( this.style.fillStyle && this.style.fillStyle !== "transparent" ) {

            context.beginPath();
            context.fillStyle = this.style.fillStyle;


            context.moveTo( this.sides[ 0 ].start.x, this.sides[ 0 ].start.y );

            this.sides.forEach( ( side ) => {
                context.lineTo( side.end.x, side.end.y );
            } );
            context.fill();
            context.closePath();
        }

        this.sides.forEach( ( side, index ) => {

            context.beginPath();
            this.applyStyle( context, side.style || this.style );
            context.moveTo( side.start.x, side.start.y );
            context.lineTo( side.end.x, side.end.y );
            context.stroke();

            side.paintIndex( context );

            context.closePath();
        } );
    }

    applyStyle( context, style ) {

        context.strokeStyle = value( style.strokeStyle, this.style.strokeStyle );
        context.shadowBlur = value( style.shadowBlur, this.style.shadowBlur );
        context.shadowColor = value( style.shadowColor, this.style.shadowColor );
        context.shadowOffsetX = value( style.shadowOffsetX, this.style.shadowOffsetX );
        context.shadowOffsetY = value( style.shadowOffsetY, this.style.shadowOffsetY );
        context.lineCap = value( style.lineCap, this.style.lineCap );
        context.lineJoin = value( style.lineJoin, this.style.lineJoin );
        context.lineWidth = value( style.lineWidth, this.style.lineWidth );
        context.miterLimit = value( style.miterLimit, this.style.miterLimit );
    }

    calculateSides() {

        this.edges = [];
        this.sides = [];
        for ( let k = 1; k <= this.edgesCount; k++ ) {

            let x1 = this.radius * Math.cos( k * this.centralAngle + this.rotation ) + this.middle.x;
            let y1 = this.radius * Math.sin( k * this.centralAngle + this.rotation ) + this.middle.y;


            let x2 = this.radius * Math.cos( ( k + 1 ) * this.centralAngle + this.rotation ) + this.middle.x;
            let y2 = this.radius * Math.sin( ( k + 1 ) * this.centralAngle + this.rotation ) + this.middle.y;

            let side = new Side( this, k, new Point( x1, y1 ), new Point( x2, y2 ) );
            this.sides.push( side );
            this.edges.push( side.start );
        }
    }
}
