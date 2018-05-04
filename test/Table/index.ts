import Table                   from "../../Table/Table.js";
import { AbstractTableModel }  from "../../Table/AbstractTableModel.js";
import AbstractTableRenderer   from "../../Table/AbstractTableRenderer.js";
import { AbstractRowSorter }   from "../../Table/AbstractRowSorter.js";
import { OrFilter, RowFilter } from "../../Table/RowFilter.js";

class Projekt {
    constructor( public id:number, public name:string ) {

    }
}

class TestTable extends Table<Projekt> {

}

class ProjektRowSorter extends AbstractRowSorter<Projekt> {

    compare( a:Projekt, b:Projekt ):number {

        if ( a.name.toLowerCase() < b.name.toLowerCase() ) {
            return 1;
        }
        if ( a.name.toLowerCase() > b.name.toLowerCase() ) {
            return -1;
        }

        return 0;
    }
}

class TestModel extends AbstractTableModel<Projekt> {

    getNameAt( index:number ):string {

        switch ( index ) {
            case 0:
                return "#";
            case 1:
                return "ID";
            case 2:
                return "Name";
        }
        return "";
    }

    getCellCount():number {
        return 3;
    }

    getValueAt( row:number, cell:number, index ):string {

        const projekt = this.get( row );

        switch ( cell ) {
            case 0:
                return ( index + 1 ).toString();
            case 1:
                return projekt.id.toString();
            case 2:
                return projekt.name;
        }
        return "";
    }
}

class TestTableRenderer extends AbstractTableRenderer {

    getCellClass( cellIndex:number ):string {

        switch ( cellIndex ) {
            case 0:
                return "index";
            case 1:
                return "id";
            case 2:
                return "name";
        }
    }

    interceptRow( htmlDivElement:HTMLElement, index:number ):HTMLElement {
        htmlDivElement.style.cursor = "pointer";
        return htmlDivElement;
    }
}

class Filter implements RowFilter<Projekt> {

    include( entry:Projekt, index:number ):boolean {

        const value = <string>input.val();

        if ( value == "" )
            return true;

        const nameMatch = entry.name.toLowerCase().indexOf( value.toLowerCase() ) != -1;
        const idMatch = entry.id.toString().indexOf( value ) != -1;

        return nameMatch || idMatch;
    }
}

class IDFilter implements RowFilter<Projekt> {

    include( entry:Projekt, index:number ):boolean {

        const value = <string>input.val();

        if ( value == "" )
            return true;

        const arr = value.trim().split( " " );

        for ( let i = 0; i < arr.length; i++ )
            if ( entry.id.toString().indexOf( arr[ i ] ) != -1 )
                return true;

        return false;
    }
}

class NameFilter implements RowFilter<Projekt> {

    include( entry:Projekt, index:number ):boolean {

        const value = <string>input.val();

        if ( value == "" )
            return true;

        const arr = value.trim().split( " " );

        for ( let i = 0; i < arr.length; i++ )
            if ( entry.name.toLowerCase().indexOf( arr[ i ].toLowerCase() ) != -1 )
                return true;

        return false;
    }
}


const input = $( "input" );

const button = $( "button" );
button.on( "click", () => {
    model.add( new Projekt( 9, "Lel" ) );
} );

const filter = new OrFilter();
filter.addFilter( new IDFilter() );
filter.addFilter( new NameFilter() );

const projekt1 = new Projekt( 1, "test" );
const model = new TestModel( [
    projekt1,
    new Projekt( 2, "Mars" )
], new ProjektRowSorter(), filter );

model.setMultiSelection( true );

console.log( model );


const renderer = new TestTableRenderer();

$( () => {

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for ( var i = 0; i < 5; i++ )
            text += possible.charAt( Math.floor( Math.random() * possible.length ) );

        return text;
    }


    const table = new TestTable( ".table", model, renderer );
    table.paint();

    input.on( "input", event => {
        model.sort();
    } );

    setTimeout( () => {

        projekt1.name = "Douglas";
        model.setDirty( true, projekt1 );

        for ( let i = 3; i < 100; i++ )
            model.add( new Projekt( i, makeid() ) );

        model.sort();

        setTimeout( () => {
            model.splice( 2, 3 );
        }, 2000 );
    }, 2000 );
} );