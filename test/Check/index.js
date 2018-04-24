/**
 * New typescript file
 */
import Check from "../../Check/Check.js";
$(() => {
    const entypo = new Check("#entypo", { design: "entypo", label: "entypo" });
    const modern = new Check("#modern", { design: "modern" });
    const exclusive = new Check("#exclusive", { design: "exclusive", label: document.getElementsByTagName("label")[0] });
    console.log(entypo, modern, exclusive);
});
//# sourceMappingURL=index.js.map