import Core from "../Core/Core.js";
import Lexer from "../Lexer/Lexer.js";

var id            = 0,
	NAME          = "FancyTemplate",
	VERSION       = "0.1.0",
	templateCache = {},
	NODETYPE      = {
		comment: 8,
		text   : 3
	},
	DIRECTIVES    = [],
	PROVIDER      = [],
	logged        = false;

var SCOPE_NAME = "s",
	EXTRA_NAME = "l";

function isKeyword( value ) {
	
	switch ( value ) {
		case "true":
		case "false":
			return true;
	}
	return false;
}

function replaceAt( string, index, regex, character ) {
	return string.substr( 0, index ) + string.substr( index ).replace( regex, character );
}

function $parse( $expression, $filter ) {
	
	var lexer    = Lexer.tokenise( $expression ),
		appendix = 0;

	function _in( o, v ) {
		return '(' + o + ' && "' + v + '" in ' + o + ')';
	}

	var varCount         = 0,
		fnString         = "return " + $expression.trim(),
		isFilterFunction = false,
		isParamHeader    = false;

	lexer.forEach( function ( it, i ) {
		
		var isParameter = it.key === "IDENTIFIER" && !isKeyword( it.value ),
			isFilter    = it.key === "PIPE",
			isAssign    = (lexer[ i + 1 ] ? lexer[ i + 1 ].key === "EQUALS" : false) && (lexer[ i + 2 ] ? lexer[ i + 2 ].key !== "EQUALS" : false),
			firstPart   = (lexer[ i - 1 ] ? lexer[ i - 1 ].key !== "DOT" : true),
			replacement;
			
		if ( isFilterFunction ) {
			
			if ( it.key === "COLON" ) {
				
				fnString = replaceAt( fnString, appendix, ":", "," );
				appendix += 1;
				
			} else if ( isParameter && firstPart && lexer[ i - 1 ].key !== "PIPE" ) {
				
				updateFn( "var v" + varCount + ";if" + _in( EXTRA_NAME, it.value ) + "{v" + varCount + "=" + EXTRA_NAME + "." + it.value + ";}else{v" + varCount + "=" + SCOPE_NAME + "." + it.value + ";}" );
			}
			if ( !lexer[ i + 1 ] )
				fnString += ")";
			
		}
		else if ( isFilter ) {
			
			isFilterFunction = true;
			var value;
			if ( lexer[ i - 1 ].key === "IDENTIFIER" )
				value = "v" + (varCount - 1);
			else
				value = lexer[ i - 1 ].value;
			
			replacement = "$filter['" + lexer[ i + 1 ].value + "'](" + value;
			fnString    = replaceAt( fnString, appendix, value, replacement );
			fnString    = replaceAt( fnString, appendix, new RegExp( " *\\| *" + lexer[ i + 1 ].value ), "" );
			appendix += replacement.length;
		} else if ( isParameter && isAssign ) {
			
			replacement = "" + SCOPE_NAME + "." + it.value;
			fnString    = replaceAt( fnString, appendix, it.value, replacement );
			appendix += replacement.length;
			
		} else if ( isParamHeader && isParameter && firstPart ) {
			
			updateFn( "var v" + varCount + ";if" + _in( EXTRA_NAME, it.value ) + "{v" + varCount + "=" + EXTRA_NAME + "." + it.value + ";}else{v" + varCount + "=" + SCOPE_NAME + "." + it.value + ";}" );
		
		} else if ( isParameter && firstPart ) {
			
			updateFn( "var v" + varCount + ";if" + _in( SCOPE_NAME, it.value ) + "{v" + varCount + "=" + SCOPE_NAME + "." + it.value + ";}" );
		}
		if ( it.key === "L_PARENTHESIS" ) 
			isParamHeader = true;
		
		if ( it.key === "R_PARENTHESIS" ) {
			
			isParamHeader    = false;
			isFilterFunction = false;
		}
		
		function updateFn( replacement ) {
			
			fnString = replacement + fnString;
			appendix += replacement.length;
			fnString = replaceAt( fnString, appendix, it.value, "v" + varCount );
			varCount++;
		}
	} );
	
	var fn = (new Function( "$filter", "\"use strict\";return function(" + SCOPE_NAME + "," + EXTRA_NAME + ") {try { " + fnString + "; \r\n } catch( e ){ return undefined; } }" ));
	return fn( $filter );
}

/**
 *
 * @param name
 * @returns {Function}
 */
function error( name ) {
	
	return function ( type, msg ) {
		
		var str  = msg,
			args = $A( arguments );
		args.shift();
		args.shift();
		args.forEach( function ( it, i ) {
			str = msg.replace( "{" + i + "}", it );
		} );
		
		return new Error( name + "[" + type + "] " + str );
	};
}

function toDashCase( str ) {
	
	return str.replace( /[A-Z][a-z]/g, function ( match ) {
		return "-" + match.toLowerCase();
	} );
}

function toCamelCase( str ) {
	
	return str.replace( /([a-z])-([a-z])/g, function ( match, $1, $2 ) {
		return $1 + $2.toUpperCase();
	} );
}

function $A( args ) {
	return Array.prototype.slice.call( args );
}

function escapeRegExp( str ) {
	return str.replace( /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&" );
}

function checkExpression( SELF, str ) {
	
	var expressions = getExpression( SELF.settings.leftDelimiter, SELF.settings.rightDelimiter );
	if ( str.match( expressions ) ) {
		
		return str.replace( expressions, function ( match, $1 ) {
			return Core.undefined( $1 ) ? "" : $1;
		} );
	}
}


function getAllElements( element, callback ) {
	
	var list = $( element );

	function iterate( el ) {
		
		if ( el.length ) {
			
			var items = el.contents();
			list      = list.add( items );
			items.each( function () {
				callback.call( this );
			} );
			items.each( function () {
				iterate( $( this ), callback );
			} );
		}
	}

	iterate( element );
}

function applyDirectives( SELF, element ) {
	element = $(element);

	getAllElements( element, function () {
		
		if ( this.attributes && this.attributes ) {
			
			$A( this.attributes ).forEach( function ( attr ) {

				var expression = checkExpression( SELF, attr.nodeValue );
				if ( expression ) {
					
					expression     = SELF.eval( expression );
					attr.nodeValue = Core.undefined( expression ) ? "" : expression;
				}
			} );
		}
	} );

	function call( el, directive ) {
		
		directive.elements = directive.elements || [];
		
		if ( ~$( directive.elements ).index( el ) )
			return { bootstrap: function () {} };
		
		directive.elements.push( el );
		var scope = SELF.$scope;
		var attrs = {};
		$A( el.attributes ).forEach( function ( attr ) {
			attrs[ toCamelCase( attr.name ) ] = attr.nodeValue;
		} );
		if ( directive.scope ) {
			
			scope = {
				$parent: SELF.$scope
			};
			each( directive.scope, function ( prop, o ) {
				
				var attr = attrs[ ( o.length > 1 ? toDashCase( o.substr( 1 ) ) : prop ) ];
				if ( attr ) {
					
					switch ( this[ 0 ] ) {
						case "&":
							scope[ prop ] = function ( options ) {
								var fn  = SELF.parse( attr ),
									ret = fn( scope.$parent, options );
								SELF.update();
								return ret;
							};
							break;
						case "=":
							scope[ prop ] = SELF.eval( attr );
							break;
						case "@":
							scope[ prop ] = attr;
							break;
					}
				}
			} );
		}

		var instance = new Template( el, { scope: scope } );
		directive.link.call( instance, scope, $( el ), attrs );
		SELF.$children.push( instance );
		each( SELF.$filter, function ( i ) {
			instance.filter( i, this );
		} );
		each( SELF.$directives, function ( i, it ) {
			instance.directive( it.name, function () {
				return it.factory;
			} );
		} );
		each( SELF.$provider, function ( i, it ) {
			var name = it.name;
			instance.provider( name, it );
		} );
		return instance;
	}

	SELF.$directives.forEach( function ( directive ) {
		
		
		directive.elements = directive.elements || [];
		var elements       = $( [] );
		if ( ~directive.factory.restrict.indexOf( "A" ) )
			elements = elements.add( element.find( "[" + directive.name + "]" ) );
		
		if ( ~directive.factory.restrict.indexOf( "E" ) ) {
			
			if ( directive.factory.scope && directive.factory.scope !== true && directive.name in directive.factory.scope ) 
				throw "ERROR: Multiple Directive";

			elements = elements.add( element.find( directive.name ) );
		}
		if ( ~directive.factory.restrict.indexOf( "C" ) )
			elements = elements.add( element.find( "." + directive.name ) );

		elements.each( function () {
			call( this, directive.factory ).bootstrap();
		} )
	} );
}

function getExpression( l, r ) {
	
	var L = escapeRegExp( l ),
		R = escapeRegExp( r );
	return new RegExp( "(?:" + L + ")([^" + L + R + "]*)(?:" + R + ")", "g" );
}

function each( o, fn ) {
	for ( var i in o ) {
		if ( o.hasOwnProperty( i ) ) {
			if ( fn.call( o[ i ], i, o[ i ] ) === false ) {
				break;
			}
		}
	}
}

DIRECTIVES.push( function ( SELF ) {
	
	SELF.directive( "fancyClick", function () {
		
		return {
			restrict: "A",
			scope   : false,
			link    : function ( $scope, $el, $attr ) {
				
				console.log( $scope, $el )
				$el.on( "click", function ( e ) {
					var click = SELF.parse( $attr.fancyClick );
					click( SELF.$scope, { $event: e } );
					SELF.update();
				} );
			}
		};
	} );
}, function ( SELF ) {
	
	var fancyEachMinErr = error( "FancyEach" );
	
	SELF.directive( "fancyEach", function () {
		
		return {
			restrict: "A",
			scope   : true,
			link    : function ( $scope, $el, $attr ) {
				
				var expression   = $attr.fancyEach,
					commentStart = $( document.createComment( "fancyEach:start" ) ),
					commentEnd   = $( document.createComment( "fancyEach:end" ) ),
					el           = $el.clone();
				var match        = expression.match( /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/ );
				if ( !match )
					throw fancyEachMinErr( 'iexp', "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got %s.", expression );
				
				var lhs        = match[ 1 ];
				var rhs        = match[ 2 ];
				var trackByExp = match[ 3 ];
				match          = lhs.match( /^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/ );
				if ( !match )
					throw fancyEachMinErr( 'iidexp', "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.", lhs );
				
				var valueIdentifier = match[ 3 ] || match[ 1 ];
				var keyIdentifier   = match[ 2 ];
				$el.before( commentStart );
				$el.after( commentEnd );
				$el.remove();
				var elements = [];
				SELF.watch( rhs, reload );
				
				function reload() {
					
					var items = SELF.parse( rhs )( $scope.$parent );
					$( elements ).remove();
					elements = [];
					
					items.forEach( function ( it, index ) {
						
						var tpl   = el.clone(),
							scope = {
								$parent: SELF.$scope
							};
						elements.push( tpl[ 0 ] );
						if ( keyIdentifier )
							scope[ keyIdentifier ] = index;
						
						scope[ valueIdentifier ] = it;
						if ( trackByExp )
							scope[ trackByExp ] = index;
						
						new Template( tpl, $.extend( {}, SELF.settings, { scope: scope } ) ).bootstrap();
						commentEnd.before( tpl );
					} );
					//SELF.update();
				}

				reload();
			}
		};
	} );
} );

PROVIDER.push( function ( SELF ) {
	
	SELF.provider( "$interval", function () {
		
		this.$get = function () {
			
			function interval( callback, timer ) {
				
				return setInterval( function () {
					
					callback();
					SELF.update();
				}, timer );
			}

			interval.cancel = function ( number ) {
				return clearInterval( number );
			};
			return interval;
		};
		return this;
	} );
} );

function update( SELF, list ) {
	
	var l = SELF.settings.leftDelimiter,
		r = SELF.settings.rightDelimiter;

	list.forEach( function ( it ) {
		
		var expressions = getExpression( l, r ),
			parsed      = it.expression.replace( expressions, function ( match, $1 ) {
				
				var evaluated = SELF.eval( $1 );
				return Core.undefined( evaluated ) ? "" : evaluated;
			} );
		if ( !Core.equals( it.parsed, parsed ) ) {
			
			it.parsed         = parsed;
			it.node.nodeValue = it.parsed;
		}
	} );
	SELF.$children.forEach( function ( it ) {
		it.update();
	} );
	return this;
}

function getInjection( SELF, factory ) {
	
	if ( Core.getType( factory ) === "function" ) {
		
		return factory.call( SELF );
		
	} else if ( Core.getType() ) {
		
		var injections = [],
			fn         = function () {};
		factory.forEach( function ( it, i ) {
			
			if ( i !== factory.length - 1 )
				injections.push( SELF.injector( it ) )
			 else
				fn = it
		} );
		return fn.apply( SELF, injections );
	}
	
	throw "[directive]: You did pass a malformed factory"
}

export default class Template extends Core {

	constructor( $el, settings ) {
		
		super($el);
		this.applySettings(settings, {
			scope         : {},
			leftDelimiter : "{{",
			rightDelimiter: "}}",
			bindClass     : NAME + "-bindings"
		});
		
		this.$scope = this.settings.scope;

		this.$scope.$apply = () => {
			return this.update();
		};
		this.id            = id++;
		this.parsed        = [];
		this.$filter       = {};
		this.$directives   = [];
		this.$controllers  = [];
		this.$listener     = [];
		this.$provider     = {};
		this.$children     = [];
		
		DIRECTIVES.forEach(  dir => {
			dir( this );
		} );
		PROVIDER.forEach(  provider => {
			provider( this );
		} );
	}

	update() {
		
		update( this, this.parsed );
		this.$listener.forEach(  it => {
			
			if ( it.hasOwnProperty( "value" ) ) {
				
				var value = this.parse( it.value )( this.$scope );
				if ( !Core.equals( value, it.last ) ) {
					
					it.callback.call( this, value, it.last );
					it.last = Core.copy( value, true );
					update( this, this.parsed );
				}
			} else {
				
				it.callback.call( this, null, null );
				update( this, this.parsed );
			}
		} );
		return this;
	}
	
	parse( expression ) {
		return $parse( expression, this.$filter );
	}
	
	eval( $expression ) {
		return this.parse( $expression )( this.$scope );
	}
	
	compile( element ) {
		
		element = $(element);
		
		var list = [],
			nodes;
		applyDirectives( this, element );
		
		function getTextNodesIn( node ) {
			
			var textNodes = [], nonWhitespaceMatcher = /\S/;

			function getTextNodes( node ) {
				
				if ( node.nodeType == NODETYPE.text ) {
					
					if ( nonWhitespaceMatcher.test( node.nodeValue ) )
						textNodes.push( node );
					
				} else if ( node.childNodes ) {
					
					for ( var i = 0, len = node.childNodes.length; i < len; ++i )
						getTextNodes( node.childNodes[ i ] );
				}
			}


			getTextNodes( node );
			return textNodes;
		}

		nodes = getTextNodesIn( element[ 0 ] );
		nodes.forEach(  it => {
			if ( it.nodeValue.match( getExpression( this.settings.leftDelimiter, this.settings.rightDelimiter ) ) )
				list.push( { expression: it.nodeValue, node: it, nodeType: it.nodeType } );
		} );
		this.parsed = this.parsed.concat( list );

		update( this, list );
		return this;
	}
	
	destroy() {
		this.parsed.forEach( function ( it ) {
			it.node.nodeValue = it.expression;
		} );
		this.element.removeData( NAME );
		return null;
	}
	
	watch( expression, callback ) {

		if ( Core.getType( expression ) === "function" ) {
			
			this.$listener.push( {
				callback: expression
			} );
		} else if ( Core.getType( expression ) === "string" ) {
			
			var value = this.parse( expression )( this.$scope );
			this.$listener.push( {
				value   : expression,
				last    : Core.copy( value, true ),
				callback: callback
			} );
		}
	}
	
	bootstrap() {
		return this.compile( this[0] ).update();
	}
	
	directive( name, factory ) {
		
		var directive = {};

		directive.factory = getInjection( this, factory );
		directive.name    = toDashCase( name );
		if ( Core.getType( directive.factory.restrict ) === "string" ) {
			
			directive.factory.restrict = (function ( list ) {
				
				var l = [];
				list.forEach( function ( item ) {
					if ( !~l.indexOf( item.toUpperCase() ) ) 
						l.push( item.toUpperCase() );
				} );
				
				return l;
			})( directive.factory.restrict.toUpperCase().split( "" ) );
			
		} else {
			directive.factory.restrict = [ "A", "E", "C" ];
		}
		this.$directives.push( directive );
		return this;
	}
	
	controller(name, factory) {
		
		var controller = {};
		
		controller.factory = getInjection( this, factory );
		controller.name    = toDashCase( name );
		this.$controllers.push( controller );
	}
	
	provider( name, provider ) {
		this.$provider[ name ] = provider;
	}
	
	filter( name, filter ) {
		
		if ( Core.getType( filter ) === "function" )
			this.$filter[ name ] = filter;
		 else
			console.error( "You can define " + (name || "a filter") + " only as function!" );

		return this;
	}
	
	injector( name ) {
		return getInjection( this, new this.$provider[ name ]().$get );
	}
	
	static loadTemplate( url ) {
		
		var success = function () {},
			error   = function () {};
			
		if ( templateCache[ url ] ) {
			
			setTimeout( function () {
				success( templateCache[ url ].clone() );
			}, 1 );
			
		} else {
			
			$.ajax( {
				url    : url,
				global : false,
				success: function ( html ) {
					
					if ( html.indexOf( "<" ) !== 0 ) {
						
						html                 = "<span>" + html + "</span>";
						templateCache[ url ] = $( $( html ) );
					} else {
						templateCache[ url ] = $( html );
					}
					success( templateCache[ url ].clone() );
				},
				error  : function () {
					error.call( this, arguments );
				}
			} );
		}

		return function ( then, not ) {
			
			success = then;
			error   = not;
		};
	}
}