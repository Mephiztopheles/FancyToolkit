import Core from "../Core/Core.ts";

class Switch extends Core {

    constructor( element, settings ) {
        super( element );

        this.settings = settings;
    }

    up( item, animated = false ) {

        item = $( item );

        const prev = item.prev();

        if ( prev.length ) {

            const index = this.items.index( item );

            if ( this.list.length )
                Switch.swapArrayElements( this.list, index, index - 1 );

            if ( animated === false || this.settings.animated === false ) {

                item.insertBefore( prev );
                this.items = $( this[ 0 ] ).find( this.settings.itemSelector );
                this.change( index, index - 1 );

            } else if ( !this.animating ) {

                this.animating = !this.animating;

                item.css( "position", "relative" ).animate( {
                    top: "-" + new Core( prev ).fullHeight() + "px"
                }, 500, () => {
                    item.css( "position", item.data( "position" ) ).css( "top", item.data( "top" ) );
                } );
                prev.css( "position", "relative" ).animate( {
                    top: "+" + new Core( item ).fullHeight() + "px"
                }, 500, () => {
                    prev.css( "position", prev.data( "position" ) ).css( "top", prev.data( "top" ) );
                    item.insertBefore( prev );
                    this.animating = !this.animating;
                    this.items     = $( this[ 0 ] ).find( this.settings.itemSelector );
                    this.change( index, index - 1 );
                } );
            }
        }
    }

    change( index, number ) {

    }

    down( item, animated = false ) {

        item = $( item );

        const next = item.next();

        if ( item.next().length ) {

            const index = this.items.index( item );
            if ( this.list.length > 0 )
                Switch.swapArrayElements( this.list, index, index + 1 );

            if ( animated === false || this.settings.animated === false ) {

                item.insertAfter( next );
                this.items = this.find( this.settings.itemSelector );
                this.change(  index, index + 1 );

            } else if ( !this.animating ) {

                this.animating = !this.animating;
                item.css( "position", "relative" ).animate( {
                    top: "+" + new Core( next ).fullHeight() + "px"
                }, 500, function () {
                    item.css( "position", item.data( "position" ) ).css( "top", item.data( "top" ) );
                } );
                next.css( "position", "relative" ).animate( {
                    top: "-" + new Core( item ).fullHeight() + "px"
                }, 500, () => {
                    next.css( "position", next.data( "position" ) ).css( "top", next.data( "top" ) );
                    item.insertAfter( next );
                    this.animating = !this.animating;

                    Switch.swapArrayElements( this.items, index, index + 1 );
                    this.items = this[ 0 ].find( this.settings.itemSelector );
                    this.change(  index, index + 1 );
                } );
            }
        }
    }

    static swapArrayElements( list, index, nextIndex ) {

    }
}

sw = new Switch( "#list", {
    drag: true
} );