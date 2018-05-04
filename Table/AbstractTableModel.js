const push = Array.prototype.push;
const sort = Array.prototype.sort;
const splice = Array.prototype.splice;
export class AbstractTableModel {
    constructor(items, sorter, rowFilter) {
        this.observers = [];
        this.dirtyRows = [];
        this.selectedItems = [];
        if (items != null)
            this.setItems(items);
        if (rowFilter != null)
            this.setRowFilter(rowFilter);
        if (sorter != null)
            this.setRowSorter(sorter);
        this.setDirty(true);
    }
    sort(compareFn) {
        if (compareFn == null)
            compareFn = this.rowSorter.compare;
        sort.call(this.items, compareFn);
        this.setDirty(true);
        this.dataChanged();
        return this;
    }
    setRowFilter(rowFilter) {
        this.rowFilter = rowFilter;
    }
    setRowSorter(sorter) {
        this.rowSorter = sorter;
        this.sort();
    }
    include(index) {
        return this.rowFilter != null ? this.rowFilter.include(this.get(index), index) : true;
    }
    setDirty(dirty, ...entries) {
        this.dirty = false;
        if (entries.length == 0) {
            this.dirty = dirty;
            this.dirtyRows.length = 0;
        }
        else {
            if (dirty) {
                this.dirtyRows.push.apply(this.dirtyRows, entries);
            }
            else {
                entries.forEach(entry => {
                    let start = this.dirtyRows.indexOf(entry);
                    this.dirtyRows.splice(start, 1);
                });
            }
        }
    }
    get(index) {
        return this.items[index];
    }
    getMultiSelection() {
        return this.multiSelection;
    }
    setMultiSelection(value) {
        this.multiSelection = value;
    }
    setSelected(selected) {
        this.selectedItems.length = 0;
        this.selectedItems.push(selected);
    }
    toggleSelection(dragging, item) {
        if (typeof item == "number") {
            item = this.get(item);
        }
        let index = this.selectedItems.indexOf(item);
        if (!this.multiSelection || (this.multiSelection && !dragging)) {
            this.selectedItems.length = 0;
            index = -1;
        }
        if (index != -1)
            this.selectedItems.splice(index, 1);
        else
            this.selectedItems.push(item);
    }
    addSelectedItem(item) {
        if (this.selectedItems.indexOf(item) == -1)
            this.selectedItems.push(item);
    }
    removeSelectedItem(item) {
        let index = this.selectedItems.indexOf(item);
        if (index != -1)
            this.selectedItems.splice(index, 1);
    }
    getIndex(entry) {
        return this.items.indexOf(entry);
    }
    getCount() {
        return this.items.length;
    }
    isDirty(entry) {
        return this.dirty ? true : this.dirtyRows.indexOf(entry) != -1;
    }
    add(...elements) {
        return this.addAll(elements);
    }
    addAll(elements) {
        const length = push.apply(this.items, elements);
        let args = [true];
        args.push.apply(args, elements);
        this.setDirty.apply(this, args);
        this.dataChanged();
        return length;
    }
    remove(element) {
        let index = this.items.indexOf(element);
        if (index != -1)
            this.items.splice(index, 1);
        return this.items.length;
    }
    splice(start, deleteCount) {
        const elements = splice.call(this.items, start, deleteCount);
        for (start; start < this.items.length; start++)
            this.setDirty.call(this, true, this.items[start]);
        elements.forEach(item => {
            let index = this.selectedItems.indexOf(item);
            if (index != -1)
                this.selectedItems.splice(index, 1);
        });
        this.dataChanged();
        return elements;
    }
    dataChanged() {
        this.observers.forEach(it => {
            it.dataChanged();
        });
        this.setDirty(false);
    }
    structureChanged() {
        this.observers.forEach(it => {
            it.structureChanged();
            it.dataChanged();
        });
    }
    addObserver(observer) {
        observer.structureChanged();
        observer.dataChanged();
        this.observers.push(observer);
    }
    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        this.observers.splice(index, 1);
    }
    setItems(items) {
        this.items = items;
    }
    isSelected(item) {
        if (typeof item == "number")
            item = this.get(item);
        return this.selectedItems.indexOf(item) != -1;
    }
}
//# sourceMappingURL=AbstractTableModel.js.map