import Core from "../Core/Core.js";

export class Context extends Core<HTMLElement> {

    private menu:CoreMenuItem;

    private static MENU:CoreMenuItem;
    static CLASS_NAME = "Context-menu";

    constructor( element:string | HTMLElement ) {

        super( element );

        if ( this.length != 1 )
            throw new Error( "Context-Menu must be applied to one element" );

        this.on( "contextmenu", event => this.handle( <MouseEvent>event ) );
        this.menu = new CoreMenuItem();
    }

    public setMenu( ...menus:MenuItem[] ) {
        this.menu.set( menus );
    }

    private handle( event:MouseEvent ) {

        event.preventDefault();

        Context.close();

        if ( this.menu == null )
            return;

        Context.MENU = this.menu;
        const menu = new Core( this.menu.build() );
        console.log( window.innerWidth - menu.width(), event.pageX );

        this[ 0 ].parentNode.appendChild( menu[ 0 ] );
        menu.css( "left", Math.min( event.pageX, window.innerWidth - menu.width() - 5 ) );
        menu.css( "top", event.pageY );
    }

    static close() {

        if ( Context.MENU != null )
            Context.MENU.destroy();

        Context.MENU = null;
    }
}

export class MenuItem {

    protected items:Array<MenuItem> = [];
    protected element:Core<HTMLElement>;
    private entry:Core<HTMLElement>;
    private disabled:boolean;


    constructor( private name:string, private icon:string, private command:( event:Event ) => void, private shortcut?:string ) {

        if ( name == null && Object.getPrototypeOf( this ) == MenuItem )
            throw new Error( "Name cannot be null!" );
    }

    public add( item:MenuItem ) {

        if ( item == this )
            throw  new Error( "You cannot produce recursion here!" );

        this.items.push( item );
    }

    public clear() {
        this.items.length = 0;
    }

    public set( menus:Array<MenuItem> ) {

        this.clear();

        menus.forEach( item => {
            this.add( item );
        } );
    }

    public remove( item:MenuItem ) {

        let index = this.items.indexOf( item );

        if ( index != -1 )
            this.items.splice( index, 1 );
    }

    public setDisabled( disabled:boolean ) {

        this.disabled = disabled;

        if ( this.entry == null )
            return;

        if ( disabled ) {

            this.element.addClass( "disabled" );
            MenuItem.hover( $( this.entry[ 0 ] ) );

        } else {

            this.element.removeClass( "disabled" );
        }
    }

    public build():HTMLElement {

        this.element = new Core( "<div>" ).addClass( "Context-menu" );


        $( this.element[ 0 ] ).hover( event => {

            const target = $( event.target );

            MenuItem.hover( target );

        }, () => 0 );


        this.entry = new Core( "<div/>" );
        const name = new Core( "<div/>" );
        name.text( this.name );
        const icon = new Core( "<div/>" );

        this.entry.addClass( "Context-menu-entry" );
        name.addClass( "Context-menu-entry-name" );
        icon.addClass( "Context-menu-entry-icon" ).addClass( this.icon );


        const opener = new Core( "<div/>" ).addClass( "Context-menu-entry-opener" );

        this.entry.append( icon );
        this.entry.append( name );
        if ( this.shortcut != null ) {


            const shortcut = new Core( "<div/>" ).addClass( `${Context.CLASS_NAME}-entry-shortcut` );
            shortcut.text( this.shortcut );
            this.entry.append( shortcut );
        }

        this.entry.append( opener );

        this.element.append( this.entry );


        const handler = ( event:MouseEvent ) => {

            event.preventDefault();
            event.stopPropagation();

            if ( event.button != 0 || this.element.hasClass( "disabled" ) )
                return;

            if ( this.command != null )
                this.command( event );
        };

        this.entry.on( "click", handler );


        if ( this.items.length > 0 ) {

            const subMenu = new Core( "<div/>" ).addClass( "Context-menu-sub" );
            opener.addClass( "fancy-icon-right-open" );
            this.items.forEach( it => subMenu.append( it.build() ) );
            this.element.append( subMenu );
        }

        this.setDisabled( this.disabled );

        return this.element[ 0 ];
    }


    private static hover( target:JQuery ) {

        const parent = target.is( `.${Context.CLASS_NAME}` ) ? target : target.closest( `.${Context.CLASS_NAME}` );
        let parentMenu = parent.parent();

        parentMenu.find( `> .${Context.CLASS_NAME}` ).removeClass( "open" );

        if ( parent.hasClass( "disabled" ) || parent.find( `.${Context.CLASS_NAME}-sub` ).length == 0 )
            return;

        if ( target.hasClass( `${Context.CLASS_NAME}-entry` ) || parent.length > 0 ) {

            parent.addClass( "open" );
            const subMenu = parent.find( `> .${Context.CLASS_NAME}-sub` );

            if ( subMenu.offset().left + subMenu.outerWidth() > document.body.clientWidth )
                subMenu.addClass( "left" );
        }
    }

    isDisabled() {
        return this.disabled;
    }
}

export class Seperator extends MenuItem {

    constructor() {
        super( null, null, null );
    }

    public build():HTMLElement {

        const element = new Core( "<div/>" );

        element.append( new Core( "<div/>" ) );
        element.addClass( "Context-menu-separator" );
        return element[ 0 ];
    }
}

class CoreMenuItem extends MenuItem {

    constructor() {
        super( null, null, null );
    }

    setDisabled() {
        throw new Error( "disable is not supported on CoreMenuItem" );
    }

    public destroy() {
        this.element.remove();
    }

    build():HTMLElement {

        this.element = new Core( "<div/>" ).addClass( "Context-body Context-menu" );

        this.items.forEach( it => this.element.append( it.build() ) );

        return this.element[ 0 ];
    }
}


window.addEventListener( "click", () => {
    Context.close();
} );