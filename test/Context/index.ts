import { Context, MenuItem, Seperator } from "../../Context/Context.js";

const context = new Context( "div" );

const edit = new MenuItem( "Bearbeiten", "fancy-icon-pencil", null, "Strg + E" );

edit.add( new MenuItem( "Name", "fancy-icon-pencil", event => {

    last.setDisabled( !last.isDisabled() );
} ) );

edit.add( new MenuItem( "Name", "fancy-icon-pencil", event => {

} ) );

edit.add( new Seperator() );
edit.add( new MenuItem( "Name", "fancy-icon-pencil", event => {

} ) );


const last = new MenuItem( "Name", "fancy-icon-pencil", event => {
    last.setDisabled( !last.isDisabled() );
} );
last.add( new MenuItem( "Name", "fancy-icon-pencil", event => {

} ) );
last.add( new MenuItem( "Name", "fancy-icon-pencil", event => {

}, "Strg + Alt + Z" ) );
edit.add( last );

const remove = new MenuItem( "Löschen", "fancy-icon-pencil", event => {

    Context.close();
} );


context.setMenu( edit, remove );

