import Core from "../Core/Core.js";
export default class Check extends Core {
    constructor(element, settings) {
        super(element);
        if (this.length != 1)
            throw new Error("Check must be instantiated with exact 1 element");
        this.parent = document.createElement("div");
        this[0].parentNode.insertBefore(this.parent, this[0]);
        this.parent.appendChild(this[0]);
        Check.addClass(this.parent, "fancy-check");
        this.checkBox = document.createElement("div");
        this.parent.appendChild(this.checkBox);
        Check.addClass(this.checkBox, "check-box");
        this.parent.addEventListener("click", event => {
            this.toggle();
        });
        this[0].addEventListener("change", event => {
            if (this[0].checked)
                this.check();
            else
                this.uncheck();
        });
        this.settings = settings || { design: "modern" };
        if (typeof this.settings.label == "string") {
            this.label = document.createElement("div");
            this.label.appendChild(new Text(this.settings.label));
            this.parent.appendChild(this.label);
            Core.addClass(this.label, "check-label");
        }
        else if (typeof this.settings.label == "object") {
            this.label = this.settings.label;
            this.parent.appendChild(this.label);
            Core.addClass(this.label, "check-label");
        }
    }
    get value() {
        return this[0].value;
    }
    isChecked() {
        return this[0].checked;
    }
    check() {
        this[0].checked = true;
        Check.addClass(this.checkBox, "fancy-icon-checked-" + this.settings.design);
    }
    uncheck() {
        this[0].checked = false;
        Check.removeClass(this.checkBox, (i, className) => (className.match(/(^|\s)fancy-icon-checked-\S+/g) || []).join(' '));
    }
    toggle() {
        if (this.isChecked())
            this.uncheck();
        else
            this.check();
    }
}
//# sourceMappingURL=Check.js.map