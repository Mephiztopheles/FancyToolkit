export default abstract class AbstractTableRenderer {

    abstract getCellClass( cellIndex:number ):string

    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    interceptCell( htmlDivElement:HTMLElement, index:number ):HTMLElement {
        return htmlDivElement;
    }

    // noinspection JSMethodCanBeStatic
    getHeaderClass():string {
        return "";
    };

    // noinspection JSMethodCanBeStatic
    getBodyClass() {
        return "";
    }

    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    interceptRow( htmlDivElement:HTMLElement, index:number ):HTMLElement {
        return htmlDivElement;
    }

    // noinspection JSMethodCanBeStatic
    getRowClass( rowIndex:number ):string {
        return "";
    }

    // noinspection JSMethodCanBeStatic
    interceptHeaderCell( htmlDivElement:HTMLElement ):HTMLElement {
        return htmlDivElement;
    }
}