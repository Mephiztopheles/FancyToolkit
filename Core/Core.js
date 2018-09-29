var class2type = {}, toString = class2type.toString;
"Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function (name) {
    class2type["[object " + name + "]"] = name.toLowerCase();
});
function getType(obj) {
    if (obj === null)
        return obj + "";
    return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
}
function getClass(elem) {
    return elem.getAttribute && elem.getAttribute("class") || "";
}
var rnothtmlwhite = (/[^\x20\t\r\n\f]+/g);
function stripAndCollapse(value) {
    var tokens = value.match(rnothtmlwhite) || [];
    return tokens.join(" ");
}
function classesToArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (typeof value === "string") {
        return value.match(rnothtmlwhite) || [];
    }
    return [];
}
function copyObject(obj, depth) {
    depth = depth || 0;
    if (depth < 10 /* max depth */) {
        if (getType(obj) === "object") {
            var deepCopy = {};
            var props = Object.getOwnPropertyNames(obj);
            props.forEach(function (it) {
                if (getType(obj[it]) === "object") {
                    deepCopy[it] = copyObject(obj[it], depth + 1);
                }
                else if (getType(obj[it]) === "array") {
                    deepCopy[it] = [];
                    obj[it].forEach(function (x) {
                        deepCopy[it].push(copyObject(x, depth + 1));
                    });
                }
                else {
                    Object.defineProperty(deepCopy, it, Object.getOwnPropertyDescriptor(obj, it));
                }
            });
            return deepCopy;
        }
    }
    return Core.copy(obj);
}
export default class Core extends Array {
    constructor(element) {
        super();
        this.init(element);
    }
    get children() {
        return new Core(this[0].children);
    }
    applySettings(settings, defaults) {
        this.settings = {};
        for (let i in defaults)
            this.settings[i] = defaults[i];
        for (let i in settings)
            this.settings[i] = defaults[i];
    }
    init(element) {
        if (element instanceof HTMLElement) {
            this.push(element);
        }
        else if (element instanceof HTMLCollection) {
            for (let i = 0; i < element.length; i++)
                this.push(element.item(i));
        }
        else {
            if (element[0] == "<" && element[element.length - 1] == ">") {
                let match = element.match(/^<([^ />]+)/);
                if (match == null)
                    throw new Error(`Cannot create element: ${element}`);
                this.push(document.createElement(match[1]));
            }
            else {
                document.querySelectorAll(element).forEach((it) => {
                    this.push(it);
                });
            }
        }
    }
    get(index) {
        return new Core(this[index]);
    }
    addClass(className) {
        this.forEach(element => {
            Core.addClass(element, className);
        });
        return this;
    }
    removeClass(className) {
        this.forEach(element => {
            Core.removeClass(element, className);
        });
        return this;
    }
    static addClass(element, className) {
        if (className != "" && className != null)
            className.split(" ").forEach(it => element.classList.add(it));
    }
    static removeClass(element, className) {
        if (typeof className == "function")
            Core.removeClass(element, className.call(element, 0, getClass(element)));
        let finalValue, curValue;
        const classes = classesToArray(className);
        if (classes.length != 0) {
            curValue = getClass(element);
            let cur = element.nodeType === 1 && (" " + stripAndCollapse(curValue) + " ");
            if (cur) {
                let clazz;
                let j = 0;
                while (clazz = classes[j++])
                    while (cur.indexOf(" " + clazz + " ") > -1)
                        cur = cur.replace(" " + clazz + " ", " ");
                finalValue = stripAndCollapse(cur);
                if (curValue !== finalValue)
                    element.setAttribute("class", finalValue);
            }
        }
    }
    fullHeight() {
    }
    find(selector) {
        return $(this).find(selector);
    }
    onRemove(callback) {
        if (this.mutationObserver != null)
            this.mutationObserver.disconnect();
        this.mutationObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(node => {
                    this.forEach((element, index) => {
                        if (node === element)
                            callback(index, element);
                    });
                });
            });
        });
        const options = { childList: true };
        this.forEach(element => {
            this.mutationObserver.observe(element.parentNode, options);
        });
    }
    append(element) {
        if (element instanceof Core)
            element.forEach(it => this[0].appendChild(it));
        else
            this[0].appendChild(element);
    }
    remove() {
        this.forEach(element => {
            if (element.parentNode != null)
                element.parentNode.removeChild(element);
        });
    }
    on(name, callback) {
        this.forEach(element => {
            element.addEventListener(name, callback);
        });
    }
    css(property, value) {
        if (value === undefined && Object.getPrototypeOf(property) != Object) {
            return Core.css(this[0], property);
        }
        if (Object.getPrototypeOf(property) === Object) {
            for (let key in property) {
                if (!property.hasOwnProperty(key))
                    continue;
                let value = property[key];
                this.forEach(element => {
                    Core.css(element, key, value);
                });
            }
        }
        else {
            this.forEach(element => {
                Core.css(element, property, value);
            });
        }
        return this;
    }
    static equals(object1, object2) {
        if (typeof object1 != typeof object2)
            return false;
        var propName;
        if (Fancy.getType(object1) === "array" || Fancy.getType(object1) === "object") {
            if (Object.keys(object1).length !== Object.keys(object2).length)
                return false;
            for (propName in object1)
                if (object1.hasOwnProperty(propName))
                    if (typeof object1[propName] != typeof object2[propName])
                        return false;
            for (propName in object2) {
                if (object2.hasOwnProperty(propName)) {
                    if (typeof object1[propName] != typeof object2[propName])
                        return false;
                    if ((Fancy.getType(object1[propName]) === "array" && Fancy.getType(object2[propName]) === "array") || (Fancy.getType(object1[propName]) === "object" && Fancy.getType(object2[propName]) === "object")) {
                        if (!Fancy.equals(object1[propName], object2[propName]))
                            return false;
                    }
                    else if (object1[propName] != object2[propName]) {
                        return false;
                    }
                }
            }
        }
        else if (object1 != object2) {
            return false;
        }
        return true;
    }
    static css(element, property, value) {
        switch (property) {
            case "marginLeft":
            case "marginRight":
            case "marginTop":
            case "marginBottom":
            case "left":
            case "top":
                if (value === undefined) {
                    value = element.style[property];
                    if (value == "")
                        return 0;
                    return parseInt(value);
                }
                else {
                    element.style[property] = value + "px";
                }
                break;
            default:
                if (value === undefined) {
                    return element.style[property];
                }
                else {
                    element.style[property] = value;
                }
        }
    }
    offset() {
        var rect, win, elem = this[0];
        if (!elem) {
            return;
        }
        if (!elem.getClientRects().length) {
            return { top: 0, left: 0 };
        }
        rect = elem.getBoundingClientRect();
        win = elem.ownerDocument.defaultView;
        return {
            top: rect.top + win.pageYOffset,
            left: rect.left + win.pageXOffset
        };
    }
    position() {
        if (!this[0]) {
            return;
        }
        var offsetParent, offset, doc, elem = this[0], parentOffset = { top: 0, left: 0 };
        // position:fixed elements are offset from the viewport, which itself always has zero offset
        if (jQuery.css(elem, "position") === "fixed") {
            // Assume position:fixed implies availability of getBoundingClientRect
            offset = elem.getBoundingClientRect();
        }
        else {
            offset = this.offset();
            // Account for the *real* offset parent, which can be the document or its root element
            // when a statically positioned element is identified
            doc = elem.ownerDocument;
            offsetParent = elem.offsetParent || doc.documentElement;
            while (offsetParent &&
                (offsetParent === doc.body || offsetParent === doc.documentElement) &&
                offsetParent.style.position === "static") {
                offsetParent = offsetParent.parentNode;
            }
            if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
                // Incorporate borders into its offset, since they are outside its content origin
                parentOffset = jQuery(offsetParent).offset();
                parentOffset.top += offsetParent.style.borderTopWidth;
                parentOffset.left += offsetParent.style.borderLeftWidth;
            }
        }
        // Subtract parent offsets and element margins
        return {
            top: offset.top - parentOffset.top - this.css("marginTop"),
            left: offset.left - parentOffset.left - this.css("marginLeft")
        };
    }
    hasClass(name) {
        const classString = getClass(this[0]);
        return classString.split(" ").indexOf(name) != -1;
    }
    text(value) {
        if (value === undefined)
            return this[0].innerText;
        this.forEach(it => it.innerText = value);
    }
    width() {
        return $(this[0]).width();
    }
    static copy(object, copyProperties) {
        if (object === undefined) {
            return undefined;
        }
        else if (object === null) {
            return null;
        }
        else if (copyProperties) {
            if (getType(object) === "object") {
                return copyObject(object);
            }
            else if (getType(object) === "array") {
                var list = [];
                object.forEach(function (it, i) {
                    list[i] = copyObject(it);
                });
                return list;
            }
            else {
                return JSON.parse(JSON.stringify(object));
            }
        }
        else {
            return JSON.parse(JSON.stringify(object));
        }
    }
    static getType(object) {
        return getType(object);
    }
    static undefined(v) { return v === undefined || v === null; }
}
//# sourceMappingURL=Core.js.map