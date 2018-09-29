import Core from "../Core/Core.js";
export default class Table extends Core {
    constructor(selector, model, renderer) {
        super(selector);
        this.rows = new Map();
        if (this.length == 0)
            throw new Error(`no element with selector "${selector}" found`);
        if (this.length > 1)
            throw new Error("Table only works with one element at a time");
        if (this[0].tagName != "TABLE")
            throw new Error("Table must be a real table for all features");
        if (renderer == null)
            throw new Error("Table needs a renderer to be painted");
        this.renderer = renderer;
        this.model = model;
        this.header = document.createElement("thead");
        this.body = document.createElement("tbody");
        this.header.className = "table-header";
        this.body.className = "table-body";
        Table.addClass(this.body, this.renderer.getBodyClass());
        Table.addClass(this.header, this.renderer.getHeaderClass());
        this[0].appendChild(this.header);
        this[0].appendChild(this.body);
        this[0].classList.add("table");
        model.addObserver(this);
        this.onRemove(() => {
            this.destroy();
        });
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
    paint() {
        this.paintHeader();
        this.paintBody();
    }
    paintBody() {
        const count = this.model.getCount();
        const cells = this.model.getCellCount();
        this.rows.forEach((value, key) => {
            if (this.model.getIndex(key) == -1) {
                if (this.body.contains(value))
                    this.body.removeChild(value);
                this.rows.delete(key);
            }
        });
        let itemIndex = 0;
        let rowIndex = 0;
        for (rowIndex; rowIndex < count; rowIndex++) {
            const entry = this.model.get(rowIndex);
            let row = this.rows.get(entry);
            if (!this.model.include(rowIndex)) {
                if (row != null && this.body.contains(row))
                    this.body.removeChild(row);
            }
            else {
                if (row == null)
                    row = this.createRow(rowIndex, entry);
                this.body.appendChild(row);
                if (this.model.isDirty(entry))
                    this.paintRow(row, rowIndex, cells, itemIndex);
                itemIndex++;
            }
        }
    }
    createRow(rowIndex, entry) {
        const row = this.renderer.interceptRow(document.createElement("tr"), rowIndex);
        const cells = this.model.getCellCount();
        row.className = "table-row";
        Table.addClass(row, this.renderer.getRowClass(rowIndex));
        this.rows.set(entry, row);
        let cellIndex = 0;
        for (cellIndex; cellIndex < cells; cellIndex++) {
            let cell = this.renderer.interceptCell(document.createElement("td"), cellIndex);
            cell.className = "table-cell";
            Table.addClass(cell, this.renderer.getCellClass(cellIndex));
            row.appendChild(cell);
        }
        row.addEventListener("click", event => {
            this.handleRowClick(event, entry);
        });
        row.addEventListener("mousedown", event => {
            this.dragging = true;
        });
        row.addEventListener("mouseup", event => {
            this.dragging = false;
        });
        row.addEventListener("mouseenter", event => {
            if (this.dragging)
                this.handleRowClick(event, entry);
        });
        return row;
    }
    handleRowClick(event, entry) {
        if (event.button == 0) {
            this.model.toggleSelection(event.ctrlKey || this.dragging, entry);
            this.rows.forEach((node, item) => {
                if (this.model.isSelected(item))
                    node.classList.add("selected");
                else
                    node.classList.remove("selected");
            });
        }
    }
    paintRow(row, rowIndex, cells, index) {
        let cellIndex = 0;
        for (cellIndex; cellIndex < cells; cellIndex++)
            row.children[cellIndex].innerHTML = this.model.getValueAt(rowIndex, cellIndex, index);
        if (this.model.isSelected(rowIndex))
            row.classList.add("selected");
    }
    paintHeader() {
        Table.clearElement(this.header);
        const cells = this.model.getCellCount();
        let cellIndex = 0;
        for (cellIndex; cellIndex < cells; cellIndex++) {
            const cell = this.renderer.interceptHeaderCell(document.createElement("th"));
            cell.className = "table-cell";
            Table.addClass(cell, this.renderer.getCellClass(cellIndex));
            cell.innerHTML = this.model.getNameAt(cellIndex);
            this.header.appendChild(cell);
        }
    }
    static clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
    destroy() {
        this.model.removeObserver(this);
    }
    dataChanged() {
        this.paintBody();
    }
    structureChanged() {
        this.paintHeader();
    }
}
//# sourceMappingURL=Table.js.map