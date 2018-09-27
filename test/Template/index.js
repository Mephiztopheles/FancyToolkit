import Template from "../../Template/Template.js";

const scope = {
	name:"test"
};
const template = new Template("body", {scope:scope});

template.bootstrap();