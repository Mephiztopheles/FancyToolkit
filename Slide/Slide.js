import Core from "../Core/Core.js";

export default class Slide extends Core {

    constructor( element, settings ) {
        super( element );

        if ( this.length !== 1 )
            throw new Error( "Slide does need exactly one element" );

        this.applySettings(settings, {interval: 5000, itemWidth: null});
        new Core( this[ 0 ] ).addClass( "fancy-slide" );
        new Core( this[ 0 ].children[ 0 ] ).addClass( "fancy-slide-slider" );
		
		this.items = this[ 0 ].children[ 0 ].children;

        this.index = 0;
		this.resize();
    }
	
	resize(){
		
		
		let itemWidth = null;
		if(this.settings.itemWidth) {
			
			let node = document.createElement("div");
			this[0].appendChild(node);
			node.style.width = this.settings.itemWidth;
			itemWidth = `${node.offsetWidth}px`;
			this[0].removeChild(node);
		}
		
		this.width = 0;
		for(let i = 0; i < this.items.length; i++){
			
			if(this.settings.itemWidth)
				this.items[ i ].style.width = itemWidth;
			
			this.width += parseInt(this.items[ i ].offsetWidth);
			this.width += Slide.getMargin( this.items[ i ], "marginLeft" );
			this.width += Slide.getMargin( this.items[ i ], "marginRight" );
		}
		
        this[ 0 ].children[ 0 ].style.width = `${this.width}px`;
	}

    start() {

        this.interval = setInterval( () => {

            let index = this.index;
            index++;

            this.maxLength = this.items.length - 1;

            if ( index > this.maxLength )
                index = 0;

            this.scrollTo( index );

        }, this.settings.interval );
    }
	
	stop() {
		clearInterval(this.interval);
	}

    static getMargin( element, margin = "marginLeft" ) {

        var style = element.currentStyle || window.getComputedStyle(element);;

        if ( style[margin] != null )
            return parseInt( style[margin] );

        return 0;
    }

    scrollTo( index ) {

        if ( index === this.index )
            return;
		
		this.resize();
		if( this[0].offsetWidth >= this.width ) {
			
			this.stop();
			index = 0;
		}

        this.index = index;
        let margin = 0;
		

        if ( index !== 0 ) {

            margin = $( this.items[ index ] ).position().left;
            margin -= Slide.getMargin( this.items[ index ] );
            margin += Slide.getMargin( this.items[ 0 ] );
            margin -= parseInt( this[ 0 ].children[ 0 ].style.marginLeft || 0 );
			let max = this.width - this[ 0 ].offsetWidth;
			
			if(max <= margin){
				
				margin = max;
				this.index = this.maxLength+1;
			}
            margin *= -1;
        }
		
        $( this[ 0 ].children[ 0 ] ).animate( { marginLeft: margin } );
    }
}