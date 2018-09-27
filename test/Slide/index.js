import Slide from "../../Slide/Slide.js";
$(() => {
    var slide = new Slide("#slide", {interval:1000,itemWidth:"calc((100% / 3) - 10px)"});
	console.log(slide.settings);
	slide.start();
});
//# sourceMappingURL=index.js.map