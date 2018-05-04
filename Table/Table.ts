import Core                             from "../Core/Core.js";
import AbstractTableRenderer            from "./AbstractTableRenderer.js";
import { AbstractTableModel, Observer } from "./AbstractTableModel.js";


export default abstract class Table<T extends Object> extends Core<HTMLElement> implements Observer {

    private header:HTMLElement;
    private body:HTMLElement;
    private model:AbstractTableModel<T>;
    private renderer:AbstractTableRenderer;

    private rows:Map<T, HTMLElement> = new Map();
    private dragging:boolean;

    constructor( selector:string, model:AbstractTableModel<T>, renderer:AbstractTableRenderer ) {

        super( selector );

        if ( this.length == 0 )
            throw new Error( `no element with selector "${selector}" found` );

        if ( this.length > 1 )
            throw new Error( "Table only works with one element at a time" );

        if ( this[ 0 ].tagName != "TABLE" )
            throw new Error( "Table must be a real table for all features" );

        if ( renderer == null )
            throw new Error( "Table needs a renderer to be painted" );


        this.renderer = renderer;
        this.model = model;

        this.header = document.createElement( "thead" );
        this.body = document.createElement( "tbody" );

        this.header.className = "table-header";
        this.body.className = "table-body";

        Table.addClass( this.body, this.renderer.getBodyClass() );
        Table.addClass( this.header, this.renderer.getHeaderClass() );

        this[ 0 ].appendChild( this.header );
        this[ 0 ].appendChild( this.body );
        this[ 0 ].classList.add( "table" );

        model.addObserver( this );

        this.onRemove( () => {
            this.destroy();
        } );
    }

    setRenderer( renderer:AbstractTableRenderer ) {
        this.renderer = renderer;
    }

    public paint() {

        this.paintHeader();
        this.paintBody();
    }

    private paintBody() {

        const count = this.model.getCount();
        const cells = this.model.getCellCount();

        this.rows.forEach( ( value, key ) => {

            if ( this.model.getIndex( key ) == -1 ) {

                this.body.removeChild( value );
                this.rows.delete( key );
            }
        } );

        let itemIndex = 0;
        let rowIndex = 0;
        for ( rowIndex; rowIndex < count; rowIndex++ ) {

            const entry = this.model.get( rowIndex );

            let row = this.rows.get( entry );

            if ( !this.model.include( rowIndex ) ) {

                if ( row != null && this.body.contains( row ) )
                    this.body.removeChild( row );

            } else {

                if ( row == null )
                    row = this.createRow( rowIndex, entry );

                this.body.appendChild( row );

                if ( this.model.isDirty( entry ) )
                    this.paintRow( row, rowIndex, cells, itemIndex );
                itemIndex++;
            }
        }
    }


    private createRow( rowIndex:number, entry:T ):HTMLElement {

        const row = this.renderer.interceptRow( document.createElement( "tr" ), rowIndex );
        const cells = this.model.getCellCount();

        row.className = "table-row";
        Table.addClass( row, this.renderer.getRowClass( rowIndex ) );
        this.rows.set( entry, row );

        let cellIndex = 0;
        for ( cellIndex; cellIndex < cells; cellIndex++ ) {

            let cell = this.renderer.interceptCell( document.createElement( "td" ), cellIndex );

            cell.className = "table-cell";
            Table.addClass( cell, this.renderer.getCellClass( cellIndex ) );
            row.appendChild( cell );
        }


        row.addEventListener( "click", event => {
            this.handleRowClick( event, entry );
        } );

        row.addEventListener( "mousedown", event => {
            this.dragging = true;
        } );

        row.addEventListener( "mouseup", event => {
            this.dragging = false;
        } );

        row.addEventListener( "mouseenter", event => {

            if ( this.dragging )
                this.handleRowClick( event, entry );
        } );

        return row;
    }

    protected handleRowClick( event:MouseEvent, entry:T ) {

        if ( event.button == 0 ) {

            this.model.toggleSelection( event.ctrlKey || this.dragging, entry );
            this.rows.forEach( ( node, item ) => {

                if ( this.model.isSelected( item ) )
                    node.classList.add( "selected" );
                else
                    node.classList.remove( "selected" );
            } );

        }
    }


    private paintRow( row:HTMLElement, rowIndex:number, cells:number, index:number ) {

        let cellIndex = 0;
        for ( cellIndex; cellIndex < cells; cellIndex++ )
            row.children[ cellIndex ].innerHTML = this.model.getValueAt( rowIndex, cellIndex, index );

        if ( this.model.isSelected( rowIndex ) )
            row.classList.add( "selected" );
    }

    private paintHeader() {

        Table.clearElement( this.header );

        const cells = this.model.getCellCount();
        let cellIndex = 0;
        for ( cellIndex; cellIndex < cells; cellIndex++ ) {

            const cell = this.renderer.interceptHeaderCell( document.createElement( "th" ) );
            cell.className = "table-cell";
            Table.addClass( cell, this.renderer.getCellClass( cellIndex ) );

            cell.innerHTML = this.model.getNameAt( cellIndex );
            this.header.appendChild( cell );
        }
    }

    private static clearElement( element:HTMLElement ) {

        while ( element.firstChild ) {
            element.removeChild( element.firstChild );
        }
    }

    public destroy() {
        this.model.removeObserver( this );
    }

    dataChanged() {
        this.paintBody();
    }

    structureChanged() {
        this.paintHeader();
    }
}