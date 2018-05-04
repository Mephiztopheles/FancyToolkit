import { Context, MenuItem, Seperator } from "../../Context/Context.js";
const context = new Context("#container", { onSelection: false });
const edit = new MenuItem("Bearbeiten", "fancy-icon-pencil", null, "Strg + E");
edit.add(new MenuItem("Toggle last Item", "fancy-icon-pencil", event => {
    last.setDisabled(!last.isDisabled());
}));
edit.add(new MenuItem("Name"));
edit.add(new Seperator());
edit.add(new MenuItem("Description", null, null, "Alt + D"));
const last = new MenuItem("Disable", "fancy-icon-cancel", event => {
    last.setDisabled(!last.isDisabled());
});
last.add(new MenuItem("Redo"));
last.add(new MenuItem("Undo", null, null, "Strg + Alt + Z"));
edit.add(last);
const remove = new MenuItem("Löschen", "fancy-icon-pencil", event => {
    Context.close();
});
context.setMenu(edit, remove);
const context2 = new Context("#second");
const item = new MenuItem("Text without selection :(");
context2.setMenu(item);
context2.onShow = event => {
    event.preventDefault();
    let text = Context.getSelectedText();
    item.setName(text);
    return !!text;
};
//# sourceMappingURL=index.js.map