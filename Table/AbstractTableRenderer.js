export default class AbstractTableRenderer {
    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    interceptCell(htmlDivElement, index) {
        return htmlDivElement;
    }
    // noinspection JSMethodCanBeStatic
    getHeaderClass() {
        return "";
    }
    ;
    // noinspection JSMethodCanBeStatic
    getBodyClass() {
        return "";
    }
    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    interceptRow(htmlDivElement, index) {
        return htmlDivElement;
    }
    // noinspection JSMethodCanBeStatic
    getRowClass(rowIndex) {
        return "";
    }
    // noinspection JSMethodCanBeStatic
    interceptHeaderCell(htmlDivElement) {
        return htmlDivElement;
    }
}
//# sourceMappingURL=AbstractTableRenderer.js.map