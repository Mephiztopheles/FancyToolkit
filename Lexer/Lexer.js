
var IDENTIFIER = /^[a-zA-Z$_][a-zA-Z0-9$_]*/;
var NUMBER     = /^-?[0-9]+(\.[0-9]+)?/;
var COMMENT    = /^\/\/.*/;
var WHITESPACE = /^[^\n\S]+/;
var INDENT     = /^(?:\n[^\n\S]*)+/;
var OPTABLE    = {
	'+' : 'PLUS',
	'-' : 'MINUS',
	'*' : 'MULTIPLY',
	'.' : 'DOT',
	'\\': 'BACKSLASH',
	':' : 'COLON',
	'%' : 'PERCENT',
	'|' : 'PIPE',
	'!' : 'EXCLAMATION',
	'?' : 'QUESTION',
	'#' : 'POUND',
	'&' : 'AMPERSAND',
	';' : 'SEMI',
	',' : 'COMMA',
	'(' : 'L_PARENTHESIS',
	')' : 'R_PARENTHESIS',
	'<' : 'L_ANG',
	'>' : 'R_ANG',
	'{' : 'L_BRACE',
	'}' : 'R_BRACE',
	'[' : 'L_BRACKET',
	']' : 'R_BRACKET',
	'=' : 'EQUALS'
};

export default class Lexer {
	
	constructor() {

		this.tokens = [];
		this.indent = 0;
		this.chunk  = undefined;
	}
	
	identifier() {
		
		var token = IDENTIFIER.exec( this.chunk );
		if ( token ) {
			
			this.tokens.push( { key: "IDENTIFIER", value: token[ 0 ], index: this.index } );
			return token[ 0 ].length;
		}

		return 0;
	}
	
	number() {
		
		var token = NUMBER.exec( this.chunk );
		if ( token ) {
			
			this.tokens.push( { key: 'NUMBER', value: token[ 0 ], index: this.index } );
			return token[ 0 ].length;
		}

		return 0;
	}
	
	string() {
		
		var firstChar = this.chunk.charAt( 0 ),
			quoted    = false,
			nextChar;
		if ( firstChar == '"' || firstChar == "'" ) {
			for ( var i = 1; i < this.chunk.length; i++ ) {
				
				if ( !quoted ) {
					
					nextChar = this.chunk.charAt( i );
					if ( nextChar == "\\" ) {
						
						quoted = true;
					} else if ( nextChar == firstChar ) {
						
						this.tokens.push( {
							key  : 'STRING',
							value: this.chunk.substring( 0, i + 1 ),
							index: this.index
						} );
						
						return i + 1;
					}
					
				} else {
					
					quoted = false;
				}
			}
		}

		return 0;
	}
	
	comment() {
		
		var token = COMMENT.exec( this.chunk );
		if ( token ) {
			
			this.tokens.push( { key: 'COMMENT', value: token[ 0 ], index: this.index } );
			return token[ 0 ].length;
		}

		return 0;
	}
	
	whitespace() {
		var token = WHITESPACE.exec( this.chunk );
		if ( token ) {
			return token[ 0 ].length;
		}

		return 0;
	}
	
	line() {
		
		var token = INDENT.exec( this.chunk );
		if ( token ) {
			
			var lastNewline = token[ 0 ].lastIndexOf( "\n" ) + 1;
			var size        = token[ 0 ].length - lastNewline;
			if ( size > this.indent ) {
				
				this.tokens.push( { key: 'INDENT', value: size - this.indent, index: this.index } );
			} else {
				
				if ( size < this.indent ) 
					this.tokens.push( { key: 'OUTDENT', value: this.indent - size, index: this.index } );
				
				this.tokens.push( {
					key  : 'TERMINATOR',
					value: token[ 0 ].substring( 0, lastNewline ),
					index: this.index
				} );
			}
			
			this.indent = size;
			return token[ 0 ].length;
		}

		return 0;
	}
	
	literal() {
		
		var tag = this.chunk.slice( 0, 1 );
		if ( OPTABLE[ tag ] ) {
			
			this.tokens.push( { key: OPTABLE[ tag ], value: tag, index: this.index } );
			return 1;
		}

		return 0;
	};
	tokenise( source ) {
		
		var i = 0;
		while ( this.chunk = source.slice( i ) ) {
			
			var diff = this.identifier() || this.number() || this.string() || this.comment() || this.whitespace() || this.line() || this.literal();
			if ( !diff ) {
				
				console.error( "Couldn't tokenise: " + this.chunk + " near \"" + source.slice( Math.max( 0, i - 15 ), i + 15 ) + "\"" );
				return;
			}
			i += diff;
			this.index = i;
		}

		return this.tokens;
	};
	
	static tokenise(expression) {
		return new Lexer().tokenise(expression);
	}
}