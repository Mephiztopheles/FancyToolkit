export class Point {

    constructor(x, y) {

        this.x = x;
        this.y = y;
    }
}

function value(a, b) {
    return a == null ? b : a;
}

export class Side {

    constructor(start, end) {

        this.start = start;
        this.end = end;
    }

}

export class CanvasStyle {

    constructor() {
    }
	
	static defaults(){
		
		let style = new CanvasStyle();
		
		style.fillStyle = "transparent";
        style.strokeStyle = "#000000";
        style.shadowBlur = 0;
        style.shadowColor = "#000000";
        style.shadowOffsetX = 0
        style.shadowOffsetY = 0
        style.lineCap = "butt";
        style.lineJoin = "miter";
        style.lineWidth = 1;
        style.miterLimit = 10;
		
		return style;
	}
}

export class Polygon {

    constructor(edgesCount, lengthOfSide, middle, rotation = 0, winding = 1) {
		
		if(edgesCount <3)
			throw new Error("Did you ever see a polygon with less than 3 sides?")

        this.edgesCount = edgesCount;
        this.lengthOfSide = lengthOfSide;
        this.rotation = rotation;
        this.winding = winding;
        this.middle = middle;
        this.radius = this.lengthOfSide / (2 * Math.sin(Math.PI / this.edgesCount));
        this.centralAngle = 2 * Math.PI * this.winding / this.edgesCount;
        this.angle = 180 - 360 / this.edgesCount;
        this.style = CanvasStyle.defaults();

        this.regpoly();
    }

    setRadius(radius) {

        this.radius = radius;
        this.lengthOfSide = radius * (2 * Math.sin(Math.PI / this.edgesCount));
        this.regpoly();
    }

    paint(context) {

        if (this.style == null)
            throw new Error("can't draw without style");
		if(this.style.fillStyle && this.style.fillStyle != "transparent") {
			console.log("fill");
			
			context.beginPath();
			context.fillStyle = this.style.fillStyle;
			
			
				context.moveTo(this.sides[0].start.x, this.sides[0].start.y);
			
			this.sides.forEach((side) => {
				context.lineTo(side.end.x, side.end.y);
			});
			context.fill();
			context.closePath();
		}

        this.sides.forEach((side) => {

            context.beginPath();
			this.applyStyle(context, side.style || this.style);
            context.moveTo(side.start.x, side.start.y);
            context.lineTo(side.end.x, side.end.y);
            context.stroke();
            context.closePath();
        });
    }

    applyStyle(context, style) {

        context.strokeStyle = value(style.strokeStyle, this.style.strokeStyle);
        context.shadowBlur = value(style.shadowBlur, this.style.shadowBlur);
        context.shadowColor = value(style.shadowColor, this.style.shadowColor);
        context.shadowOffsetX = value(style.shadowOffsetX, this.style.shadowOffsetX);
        context.shadowOffsetY = value(style.shadowOffsetY, this.style.shadowOffsetY);
        context.lineCap = value(style.lineCap, this.style.lineCap);
        context.lineJoin = value(style.lineJoin, this.style.lineJoin);
        context.lineWidth = value(style.lineWidth, this.style.lineWidth);
        context.miterLimit = value(style.miterLimit, this.style.miterLimit);
    }

    regpoly() {

        this.edges = [];
        this.sides = [];
        for (var k = 1; k <= this.edgesCount; k++) {

            var x1 = this.radius * Math.cos(k * this.centralAngle + this.rotation) + this.middle.x;
            var y1 = this.radius * Math.sin(k * this.centralAngle + this.rotation) + this.middle.y;


            var x2 = this.radius * Math.cos((k + 1) * this.centralAngle + this.rotation) + this.middle.x;
            var y2 = this.radius * Math.sin((k + 1) * this.centralAngle + this.rotation) + this.middle.y;

            var side = new Side(new Point(x1, y1), new Point(x2, y2));
            this.sides.push(side);
            this.edges.push(side.start);
        }
    }
}
