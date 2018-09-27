import Lexer from "../Lexer/Lexer.js";

export default class AST {
	
	constructor(expression){

		this.varCount = 0;
		this.opened = 0;

        this.type = {
            "function"         : "FUNCTION",
            "bracketExpression": "BRACKETEXPRESSION",
            "identifier"       : "IDENTIFIER",
			"literal"          : "LITERAL",
            "filter"           : "FILTER",
            "expression"       : "EXPRESSION",
            "functionCall"     : "FUNCTIONCALL"
        };

		this.expression = expression;
        this.functionCount = [];
        this.variablePath  = [];
        this.lastVariable  = "";
        this.variables     = [];
        this.declarations  = [];
        this.body          = [];
		
	}
	
	if( scope, property, varName ) {
		return this.isIn( scope, property ) + ` { ${varName} = ${scope}.${property} } ` + this.elseIn( AST.EXTRA_NAME, property ) + ` { ${varName} = ${AST.EXTRA_NAME}.${property} }` ;
	}
	
	notNull( varName ) {
		return `if( ${varName} !== undefined && ${varName} !== null )`;
	}
	
	isIn( object, property ) {
		return `if( ${object} && "${property}" in ${object} )`;
	}
	
	elseIn( object, property ) {
		return "else " + this.isIn( object, property );
	}
	
	has(object, name) {
		return `if( ${object} && typeof ${object}.${name} != "undefined" )`
	}
	
	elseHas(object, name) {
		return "else " + this.has( object, name );
	}
	
	buildIdentifier( item ) {
		
		if ( this.isKeyword( item.expression ) )
			return item.expression;
		
		var v   = this.createVar();
		var exp = item.expression,
			p   = this.variablePath.length ? this.variablePath[ this.variablePath.length - 1 ] : AST.SCOPE_NAME;
			
		this.declarations.push( this.if( p, exp, v ) );
		this.variables.push( v );
		this.variablePath.push( v );
		return v;
	}
	
	get currentScope() {
		return this.lastVariable || AST.SCOPE_NAME;
	}
	
	createVar( add ) {
		
		var v = "v" + (this.varCount + (add || 0));
		if ( add === undefined )
			this.varCount++;
		
		return v;
	}
	
	isKeyword( value ) {
		return value == "true" || value == "false";
	}
	
	resetPath( item ) {
		
		switch ( item.type ) {
			case "IDENTIFIER":
			case "STRING":
			case "NUMBER":
				return false;
		}
		this.lastVariable        = "";
		this.variablePath.length = 0;
		return true;
	}
	
	isFilterExpression( item, index, lexer ) {
	
		var _index = index,
			name   = "",
			opened = 0,
			_item  = item;
			
		if ( !lexer[ index + 1 ] )
			return false;

		function openClose() {
			
			if ( _item ) {

				if ( _item.value === "(" && lexer[ _index + 1 ] && lexer[ _index + 1 ].value !== ")" )
					open();
				
				else if ( _item.value === ")" && lexer[ _index - 1 ] && lexer[ _index - 1 ].value !== "(" )
					close();
			}
		}

		function open() {
			opened++;
		}

		function close() {
			opened--;
		}

		function checkValue() {
			
			switch ( _item.key ) {
				case "IDENTIFIER":
				case "DOT":
				case "NUMBER":
				case "STRING":
					return false;
			}
			return true;
		}

		if ( checkValue() )
			return false;
		
		
		while ( _item && _item.value !== "|" ) {
			
			openClose();
			if ( checkValue() )
				return false;

			name += _item.value;
			_index++;
			_item = lexer[ _index ];
		}
		_index++;
		_item = lexer[ _index ];
		
		if ( _item && _item.value !== "|" ) {
			
			var declaration = {
				type      : this.type.filter,
				index     : _index,
				length    : _index - index,
				arguments : [],
				expression: _item.value
			};
			
			_index++;
			_item = lexer[ _index ];
			declaration.arguments.push( compile( this, name )[ 0 ] );
			
			while ( _item && _item.value !== ")" ) {
				
				if ( _item.value === ":" ) {
					
					declaration.arguments.push( { type: "COMMA", expression: "," } );
					_index++;
				} else {
					
					var part = this.compilePart( _item, _index, lexer );
					if ( part ) {
						
						declaration.arguments.push( part );
						_index += part.length;
						
					} else {
						_index++;
					}
				}
				_item = lexer[ _index ];
			}
			
			declaration.length = _index - index;
			return declaration;
		}
	}
	
	isBraceExpression( item, index, lexer ) {
		
		var _index = index,
			name   = "",
			open   = false,
			_item  = item;
		if ( !lexer[ index + 1 ] )
			return false;

		function checkValue() {
			
			switch ( _item.key ) {
				case "IDENTIFIER":
				case "L_BRACKET":
				case "NUMBER":
				case "STRING":
					return false;
			}
			return true;
		}

		if ( _item.value !== "[" )
			return

		while ( _item && _item.value !== "]" ) {
			
			if ( checkValue() )
				return false;

			if ( _item.value === "[" )
				open = true;

			if ( open )
				name += _item.value;

			_index++;
			_item = lexer[ _index ];
		}

		if ( open ) {

			return {
				type      : this.type.bracketExpression,
				index     : _index + 1,
				length    : (_index - index) + 1,
				expression: name.substr( 1 )
			};
		}
	}
	
	isFunctionExpression( item, index, lexer ) {
		
		var _index = index,
			name   = "",
			_item  = item;

		if ( !lexer[ index + 1 ] )
			return false;

		function checkValue() {
			
			switch ( _item.key ) {
				case "IDENTIFIER":
				case "DOT":
					return true;
			}
			return false;
		}

		if ( !checkValue() )
			return false;
		
		while ( _item && _item.value !== "(" ) {
			
			if ( !checkValue() )
				return false;
			
			name += _item.value;
			_index++;
			_item = lexer[ _index ];
		}

		if ( _index === lexer.length )
			return false;
		
		if ( name[ 0 ] === "." )
			name = name.substr( 1 );
		
		
		
		let openClose = () => {
			
			if ( _item ) {
				
				if ( _item.value === "(" && lexer[ _index + 1 ] && lexer[ _index + 1 ].value !== ")" ) 
					this.opened++;
				else if ( _item.value === ")" && lexer[ _index - 1 ] && lexer[ _index - 1 ].value !== "(" ) 
					this.opened--;
			}
		};
	   
		if ( index !== _index ) {
			
			openClose();
			
			var declaration = {
				type      : this.type.function,
				index     : _index,
				length    : _index - index,
				arguments : [],
				expression: name
			};
			
			if ( lexer[ _index + 1 ] && lexer[ _index + 1 ].value === ")" ) {
				
				declaration.index += 2;
				declaration.length += 2;
				return declaration;
			}
			_index++;
			_item = lexer[ _index ];
			while ( _item && (this.opened > 1 ? true : _item.value !== ")") ) {
				
				var part = this.compilePart( _item, _index, lexer );

				if ( part ) {
					if ( part.expression !== "," && part.expression !== ")" )
						declaration.arguments.push( part );
					

					_index += part.length;

				} else {
					_index++;
				}
				
				openClose();
				_item = lexer[ _index ];
			}
			
			_index++;
			declaration.length = _index - index;
			return declaration;
		}
		return false;
	}
	
	isExpression( item, index, lexer ) {
		
		var _index = index, name = "", _item = item;
		if ( !lexer[ index + 1 ] ) 
			return false;
		
		function checkValue() {
			
			switch ( _item.key ) {
				case "IDENTIFIER":
				case "DOT":
					return true;
			}
			return false;
		}

		while ( _item && checkValue() ) {
			
			name += _item.value;
			_index++;
			_item = lexer[ _index ];
		}
		
		if(lexer[index+1] && lexer[index+1].key == "DOT") {

			let functionExpression = this.isFunctionExpression( lexer[index+1], index+1, lexer );

			if(functionExpression) {

				functionExpression.index = _index;
				functionExpression.length += _index - index + 1;
				functionExpression.expression = _item.value + "." + functionExpression.expression;
				return functionExpression;
			}
		}
		
		if ( index !== _index ) {
			
			return {
				type      : this.type.expression,
				index     : _index,
				length    : _index - index,
				expression: name
			};
		}
	}
	

	compilePart( item, index, lexer ) {
		
		var isFunctionExpression = this.isFunctionExpression( item, index, lexer );
		if ( isFunctionExpression ) 
			return isFunctionExpression;
		

		var isFilterExpression = this.isFilterExpression( item, index, lexer );
		if ( isFilterExpression ) 
			return isFilterExpression;
		

		var isBraceExpression = this.isBraceExpression( item, index, lexer );
		if ( isBraceExpression ) 
			return isBraceExpression;
		

		var isExpression = this.isExpression( item, index, lexer );
		if ( isExpression ) 
			return isExpression;
		

		return {
			type      : item.key,
			length    : 1,
			index     : index,
			expression: item.value
		};

	}
	
	compile() {
		
		var self = this, scope = compile( this, this.expression );

		let iterateArguments = item => {
			
			var arg = "", newVar;
			
			switch ( item.type ) {
				
				case this.type.literal:

					arg   = this.createVar();
					var exp = item.expression;
					this.declarations.push( `${arg} = ${exp}` );
					this.variables.push( arg );
					this.variablePath.push( arg );
					this.variablePath.push( arg );
					this.functionCount.push( arg );
					this.lastVariable = arg;
				break;
				
				case this.type.function:
				
					var currentVarName,
						expressions = item.expression.split( "." ),
						args        = [],
						call        = expressions.pop();
						
					if ( this.functionCount.length ) {
						
						currentVarName = this.functionCount[ this.functionCount.length - 1 ];
						this.body.pop();
					} else {
						
						currentVarName = this.currentScope;
						this.functionCount.push( currentVarName );
					}

					forEach( item.arguments, function ( argument, i ) {
						args.push( iterateArguments( argument, i ) );
					} );
					
					var type = this.type.expression;
					
					if ( expressions.length ) {
						
						var expression = expressions.join(".");
						
						if(expression.match(/(^")|^\d+$/))
								type = this.type.literal;
							
						currentVarName = iterateArguments( {
							type      : type,
							expression: expression
						} );
					}
					newVar = this.createVar();
					this.functionCount.push( newVar );
					this.declarations.push(
						this.has( currentVarName, call ) + ` { ${newVar} = ${currentVarName}.${call}(${args.join(",")})} ` + this.elseHas( AST.EXTRA_NAME, call ) + ` {${newVar} = ${AST.EXTRA_NAME}.${call}(${args.join(",")})} `
					);
					
					this.variables.push( newVar );
					arg = newVar;
					if ( this.lastVariable ) 
						this.body.pop();
					
					this.lastVariable = arg;
					break;
				case this.type.identifier:
				
					arg               = this.buildIdentifier( item );
					this.lastVariable = arg;
					break;
				case this.type.bracketExpression:
				
					newVar = this.createVar( -1 );
					this.declarations.push( this.notNull( newVar ) + ` { ${newVar} = ${newVar}[${item.expression}] } else { ${newVar} = undefined } `);
					break;
				case "DOT":
				
					if ( this.variablePath.length == 1 )
						return;

					arg = ".";
					break;
				case this.type.filter:
				
					if ( ASTCompiler.filterSupported ) {
						arg = "$filter(\"" + item.expression + "\")(";
						forEach( item.arguments, ( argument, i ) => {
							arg += iterateArguments( argument, i );
						} );

						arg += ")";
					}
					break;
				case this.type.expression:
				
					forEach( item.expression.split( "." ),  item => {
						arg = this.buildIdentifier( { type: "IDENTIFIER", expression: item } );
					} );
					this.variablePath.push( arg );
					this.lastVariable = arg;
					break;
				default:
					arg = item.expression;
			}
			this.resetPath( item );
			return arg;
		}

		forEach( scope,  item => {
			
			var it = iterateArguments( item );
			if ( it )
				this.body.push( it );
		} );

		return this;
	}
	
	generate() {
		
		var fnString = "\nreturn function(" + AST.SCOPE_NAME + "," + AST.EXTRA_NAME + ") {\n";
		if ( this.variables.length )
			fnString += "var " + this.variables.join( ", " ) + ";\n";
		
		if ( this.declarations.length )
			fnString += this.declarations.join( "\n" ) + "\n";
		
		fnString += "return " + this.body.join( "" ) + ";\n}";
		return fnString;
	}
}

AST.SCOPE_NAME = "s";
AST.EXTRA_NAME = "l";


function forEach( object, callback ) {
	for ( var i in object ) {
		if ( object.hasOwnProperty( i ) ) {
			callback( object[ i ], (i.match( /^\d*$/ ) ? parseInt( i ) : i) );
		}
	}
}
		

function compile( self, exp ) {
	
	var scope = [],
		index = 0,
		lexer = Lexer.tokenise( exp ),
		item  = lexer[ index ];

	while ( index < lexer.length ) {
		
		var part = self.compilePart( item, index, lexer );

		if ( part ) {
			scope.push( part );
			index += part.length;
		} else {
			index++;
		}
		item = lexer[ index ];
	}
	return scope;
}