import Core from "../Core/Core.js";
export class Context extends Core {
    constructor(element, options) {
        super(element);
        this.options = options;
        if (this.length != 1)
            throw new Error("Context-Menu must be applied to one element");
        if (options == null)
            this.options = {
                onSelection: true
            };
        this.on("contextmenu", event => this.handle(event));
        this.menu = new CoreMenuItem();
    }
    setMenu(...menus) {
        this.menu.set(menus);
    }
    handle(event) {
        Context.close();
        let show = true;
        if (!this.options.onSelection && Context.getSelectedText())
            show = false;
        if (this.menu == null || !show)
            return;
        Context.MENU = this.menu;
        const menu = new Core(this.menu.build());
        if (this._onShow != null) {
            if (this._onShow(event))
                this.show(event, menu);
        }
        else {
            this.show(event, menu);
        }
    }
    show(event, menu) {
        event.preventDefault();
        this[0].parentNode.appendChild(menu[0]);
        menu.css("left", Math.min(event.pageX + 2, window.innerWidth - menu.width() - 5));
        menu.css("top", event.pageY + 2);
    }
    static getSelectedText() {
        let text = "";
        let activeEl = document.activeElement;
        let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
        if ((activeElTagName == "textarea") || (activeElTagName == "input" &&
            /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
            (typeof activeEl.selectionStart == "number")) {
            text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
        }
        else if (window.getSelection) {
            const selection = window.getSelection();
            const menu = document.querySelector(`#${this.CLASS_NAME}`);
            text = selection.toString();
            if (menu != null && selection.containsNode(menu.firstChild, true)) {
                let parentText = menu.parentNode.innerText;
                let start = text.indexOf(parentText);
                let end = start + parentText.length - menu.innerText.length;
                const front = text.substr(0, end);
                text = front + text.substr(end).replace(menu.innerText, "");
            }
        }
        return text;
    }
    static close() {
        if (Context.MENU != null)
            Context.MENU.destroy();
        Context.MENU = null;
    }
    set onShow(value) {
        this._onShow = value;
    }
    get onShow() {
        return this._onShow;
    }
}
Context.CLASS_NAME = "Context-menu";
export class MenuItem {
    constructor(name, icon, command, shortcut) {
        this.name = name;
        this.icon = icon;
        this.command = command;
        this.shortcut = shortcut;
        this.items = [];
        if (name == null && Object.getPrototypeOf(this) == MenuItem)
            throw new Error("Name cannot be null!");
    }
    setName(value) {
        this.name = value;
        let children = this.entry.children;
        if (children.length > 1)
            children[1].innerText = this.name;
    }
    add(item) {
        if (item == this)
            throw new Error("You cannot produce recursion here!");
        this.items.push(item);
    }
    clear() {
        this.items.length = 0;
    }
    set(menus) {
        this.clear();
        menus.forEach(item => {
            this.add(item);
        });
    }
    remove(item) {
        let index = this.items.indexOf(item);
        if (index != -1)
            this.items.splice(index, 1);
    }
    setDisabled(disabled) {
        this.disabled = disabled;
        if (this.entry == null)
            return;
        if (disabled) {
            this.element.addClass("disabled");
            MenuItem.hover($(this.entry[0]));
        }
        else {
            this.element.removeClass("disabled");
        }
    }
    build() {
        this.element = new Core("<div>").addClass(Context.CLASS_NAME);
        $(this.element[0]).hover(event => {
            const target = $(event.target);
            MenuItem.hover(target);
        }, () => 0);
        this.entry = new Core("<div/>");
        const name = new Core("<div/>");
        name.text(this.name);
        const icon = new Core("<div/>");
        this.entry.addClass(`${Context.CLASS_NAME}-entry`);
        name.addClass(`${Context.CLASS_NAME}-entry-name`);
        icon.addClass(`${Context.CLASS_NAME}-entry-icon`).addClass(this.icon);
        const opener = new Core("<div/>").addClass("Context-menu-entry-opener");
        this.entry.append(icon);
        this.entry.append(name);
        if (this.shortcut != null) {
            const shortcut = new Core("<div/>").addClass(`${Context.CLASS_NAME}-entry-shortcut`);
            shortcut.text(this.shortcut);
            this.entry.append(shortcut);
        }
        this.entry.append(opener);
        this.element.append(this.entry);
        const handler = (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (event.button != 0 || this.element.hasClass("disabled"))
                return;
            if (this.command != null)
                this.command(event);
        };
        this.entry.on("click", handler);
        if (this.items.length > 0) {
            const subMenu = new Core("<div/>").addClass("Context-menu-sub");
            opener.addClass("fancy-icon-right-open");
            this.items.forEach(it => subMenu.append(it.build()));
            this.element.append(subMenu);
        }
        this.setDisabled(this.disabled);
        return this.element[0];
    }
    static hover(target) {
        const parent = target.is(`.${Context.CLASS_NAME}`) ? target : target.closest(`.${Context.CLASS_NAME}`);
        let parentMenu = parent.parent();
        parentMenu.find(`> .${Context.CLASS_NAME}`).removeClass("open");
        if (parent.hasClass("disabled") || parent.find(`.${Context.CLASS_NAME}-sub`).length == 0)
            return;
        if (target.hasClass(`${Context.CLASS_NAME}-entry`) || parent.length > 0) {
            parent.addClass("open");
            const subMenu = parent.find(`> .${Context.CLASS_NAME}-sub`);
            if (subMenu.offset().left + subMenu.outerWidth() > document.body.clientWidth)
                subMenu.addClass("left");
        }
    }
    isDisabled() {
        return this.disabled;
    }
}
export class Seperator extends MenuItem {
    constructor() {
        super(null, null, null);
    }
    build() {
        const element = new Core("<div/>");
        element.append(new Core("<div/>"));
        element.addClass("Context-menu-separator");
        return element[0];
    }
}
class CoreMenuItem extends MenuItem {
    constructor() {
        super(null, null, null);
    }
    setDisabled() {
        throw new Error("disable is not supported on CoreMenuItem");
    }
    destroy() {
        this.element.remove();
    }
    build() {
        this.element = new Core("<div/>").addClass("Context-body Context-menu");
        this.element[0].id = Context.CLASS_NAME;
        this.items.forEach(it => this.element.append(it.build()));
        return this.element[0];
    }
}
window.addEventListener("click", (event) => {
    /*
     * click on menuItem is prevented, but a click is only mousedown and mouseup on same element
     */
    if (!jQuery.contains($(`#${Context.CLASS_NAME}`)[0], event.target))
        Context.close();
});
//# sourceMappingURL=Context.js.map