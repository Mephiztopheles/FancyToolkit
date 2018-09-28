import {Polygon,Point,CanvasStyle} from "../../Polygon/Polygon.js";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var polygon = new Polygon(3, 0, new Point(canvas.width / 2, canvas.height / 2), 0);

polygon.setRadius((canvas.height - 10) / 2);


polygon.sides[0].style = new CanvasStyle();
polygon.sides[0].style.strokeStyle = "red";

polygon.style.fillStyle = "red";
polygon.style.lineWidth = 2;

polygon.paint(ctx);
console.log(polygon);



canvas = document.getElementById("canvas-2");
ctx = canvas.getContext("2d");

var polygon2 = new Polygon(8, 0, new Point(canvas.width / 2, canvas.height / 2), 0);

polygon2.setRadius((canvas.height - 10) / 2);

polygon2.style.fillStyle = "green";
polygon2.style.lineWidth = 2;

polygon2.paint(ctx);
