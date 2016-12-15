/*!
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * dio is a fast javascript framework
 * 
 * @licence MIT
 */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	} else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	} else {
		window.dio = factory(window);
	}
}(function (window) {


	'use strict';


	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * constants
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	// current version
	var version         = '4.0.0';
	
	// enviroment variables
	var document        = window.document || null;
	var browser         = document !== null;
	var server          = browser === false;
	
	// namespaces
	var nsStyle         = 'data-scope';
	var nsMath          = 'http://www.w3.org/1998/Math/MathML';
	var nsXlink         = 'http://www.w3.org/1999/xlink';
	var nsSvg           = 'http://www.w3.org/2000/svg';
	
	// empty shapes
	var objEmpty        = Object.create(null);
	var arrEmpty        = [];
	var nodEmpty        = VNode(0, '', objEmpty, arrEmpty, null, null, null);
	
	// random characters
	var randomChars     = 'JrIFgLKeEuQUPbhBnWZCTXDtRcxwSzaqijOvfpklYdAoMHmsVNGy';
	
	// ssr
	var readable        = server ? require('stream').Readable : null;
	
	// void elements
	var isVoid          = {
		'area':   0, 'base':  0, 'br':   0, '!doctype': 0, 'col':    0, 'embed': 0,
		'wbr':    0, 'track': 0, 'hr':   0, 'img':      0, 'input':  0, 
		'keygen': 0, 'link':  0, 'meta': 0, 'param':    0, 'source': 0
	};
	
	// unicode characters
	var uniCodes        = {
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'&': '&amp;'
	};
	
	// regular expressions
	var regEsc          = /[<>&"']/g;
	var regStyleCamel   = /([a-zA-Z])(?=[A-Z])/g;
	var regStyleVendor  = /^(ms|webkit|moz)/;
	
	
	/**
	 * generate random string of a certain length
	 * 
	 * @param  {number} length
	 * @return {string}
	 */
	function random (length) {
	    var text = '';
	
	    // 52 is the length of characters in the string `randomChars`
	    for (var i = 0; i < length; i++) {
	        text += randomChars[Math.floor(Math.random() * 52)];
	    }
	
	    return text;
	}
	
	
	/**
	 * for in proxy
	 * 
	 * @param  {Object}   obj
	 * @param  {function} func
	 */
	function each (obj, func) {
		for (var name in obj) {
			func(obj[name], name);
		}
	}
	
	
	/**
	 * escape string
	 * 
	 * @param  {(string|boolean|number)} subject
	 * @return {string}
	 */
	function escape (subject) {
		var string = subject + '';
	
		if (string.length > 50) {
			// use regex if the string is long
			return string.replace(regEsc, unicoder);
		} else {
			var characters = '';
	
			for (var i = 0, length = string.length; i < length; i++) {
				switch (string.charCodeAt(i)) {
					// & character
					case 38: characters += '&amp;'; break;
					// " character
					case 34: characters += '&quot;'; break;
					// ' character
					case 39: characters += '&#39;'; break;
					// < character
					case 60: characters += '&lt;'; break;
					// > character
					case 62: characters += '&gt;'; break;
					// any character
					default: characters += string[i]; break;
				}
			}
			
			return characters;
		}
	}
	
	
	/**
	 * unicoder, escape => () helper
	 * 
	 * @param  {string} char
	 * @return {string}
	 */
	function unicoder (char) {
		return uniCodes[char];
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * stylesheet
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * stylesheet
	 * 
	 * @param  {Component}     component
	 * @param  {function}      constructor
	 * @return {function(?Node)}
	 */
	function stylesheet (component, constructor) {
		// retrieve stylesheet
		var styles = component.stylesheet();
	
		// generate unique id
		var id = random(5);
	
		// compile css
		var css = stylis('['+nsStyle+'='+id+']', styles, true, true);
	
		function styler (element) {
			if (element === null) {
				// cache for server-side rendering
				return css;
			} else {
				element.setAttribute(nsStyle, id);
	
				// avoid adding a style element when one is already present
				if (document.getElementById(id) == null) { 
					var style = document.createElement('style');
					
					style.textContent = css;
					style.id = id;
	
					document.head.appendChild(style);
				}
			}
		}
	
		styler.styler = id;
	
		return constructor.prototype.stylesheet = styler;
	}
	
	
	/**
	 * css compiler
	 *
	 * @example compiler('.class1', 'css...', false);
	 * 
	 * @param  {string}  selector
	 * @param  {string}  styles
	 * @param  {boolean} nsAnimations
	 * @param  {boolean} nsKeyframes
	 * @return {string}
	 */
	function stylis (selector, styles, nsAnimations, nsKeyframes) {
	    var prefix = '';
	    var id     = '';
	    var type   = selector.charCodeAt(0) || 0;
	
	    // [
	    if (type === 91) {
	        // `[data-id=namespace]` -> ['data-id', 'namespace']
	        var attr = selector.substring(1, selector.length-1).split('=');            
	        var char = (id = attr[1]).charCodeAt(0);
	
	        // [data-id="namespace"]/[data-id='namespace']
	        // --> "namespace"/'namspace' -> namespace
	        if (char === 34 || char === 39) {
	            id = id.substring(1, id.length-1);
	        }
	
	        // re-build and extract namespace/id
	        prefix = '['+ attr[0] + '=\'' + id +'\']';
	    }
	    // `#` or `.` or `>`
	    else if (type === 35 || type === 46 || type === 62) {
	        id = (prefix = selector).substring(1);
	    }
	    // element selector
	    else {
	        id = prefix = selector;
	    }
	
	    var keyframeNs  = (nsAnimations === void 0 || nsAnimations === true ) ? id : '';
	    var animationNs = (nsKeyframes === void 0 || nsKeyframes === true ) ? id : '';
	
	    var output  = '';
	    var line    = '';
	    var blob    = '';
	
	    var len     = styles.length;
	
	    var i       = 0;
	    var special = 0;
	    var type    = 0;
	    var close   = 0;
	    var flat    = 1; 
	    var comment = 0;
	
	    // parse + compile
	    while (i < len) {
	        var code = styles.charCodeAt(i);
	
	        // {, }, ; characters, parse line by line
	        if (code === 123 || code === 125 || code === 59) {
	            line += styles[i];
	
	            var first = line.charCodeAt(0);
	
	            // only trim when the first character is a space ` `
	            if (first === 32) { 
	                first = (line = line.trim()).charCodeAt(0); 
	            }
	
	            var second = line.charCodeAt(1) || 0;
	
	            // /, *, block comment
	            if (first === 47 && second === 42) {
	                first = (line = line.substring(line.indexOf('*/')+2)).charCodeAt(0);
	                second = line.charCodeAt(1) || 0;
	            }
	
	            // @, special block
	            if (first === 64) {
	                // exit flat css context with the first block context
	                flat === 1 && (flat = 0, output.length !== 0 && (output = prefix + ' {'+output+'}'));
	
	                // @keyframe/@global, `k` or @global, `g` character
	                if (second === 107 || second === 103) {
	                    special++;
	
	                    if (second === 107) {
	                        blob = line.substring(1, 11) + keyframeNs + line.substring(11);
	                        line = '@-webkit-'+blob;
	                        type = 1;
	                    } else {
	                        line = '';
	                    }
	                }
	            } else {
	                var third = line.charCodeAt(2) || 0;
	
	                // animation: a, n, i characters
	                if (first === 97 && second === 110 && third === 105) {
	                    var anims = line.substring(10).split(',');
	                    var build = 'animation:';
	
	                    for (var j = 0, length = anims.length; j < length; j++) {
	                        build += (j === 0 ? '' : ',') + animationNs + anims[j].trim();
	                    }
	
	                    // vendor prefix
	                    line = '-webkit-' + build + build;
	                }
	                // appearance: a, p, p
	                else if (first === 97 && second === 112 && third === 112) {
	                    // vendor prefix -webkit- and -moz-
	                    line = '-webkit-' + line + '-moz-' + line + line;
	                }
	                // hyphens: h, y, p
	                // user-select: u, s, e
	                else if (
	                    (first === 104 && second === 121 && third === 112) ||
	                    (first === 117 && second === 115 && third === 101)
	                ) {
	                    // vendor prefix all
	                    line = '-webkit-' + line + '-moz-' + line + '-ms-' + line + line;
	                }
	                // flex: f, l, e
	                // order: o, r, d
	                else if (
	                    (first === 102 && second === 108 && third === 101) ||
	                    (first === 111 && second === 114 && third === 100)
	                ) {
	                    // vendor prefix only -webkit-
	                    line = '-webkit-' + line + line;
	                }
	                // transforms & transitions: t, r, a 
	                else if (first === 116 && second === 114 && third === 97) {
	                    // vendor prefix -webkit- and -ms- if transform
	                    line = '-webkit-' + line + (line.charCodeAt(5) === 102 ? '-ms-' + line : '') + line;
	                }
	                // display: d, i, s
	                else if (first === 100 && second === 105 && third === 115) {
	                    if (line.indexOf('flex') > -1) {
	                        // vendor prefix
	                        line = 'display:-webkit-flex; display:flex;';
	                    }
	                }
	                // { character, selector declaration
	                else if (code === 123) {
	                    // exit flat css context with the first block context
	                    flat === 1 && (flat = 0, output.length !== 0 && (output = prefix + ' {'+output+'}'));
	
	                    if (special === 0) {
	                        var split = line.split(',');
	                        var build = '';
	
	                        // prefix multiple selectors with namesapces
	                        // @example h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
	                        for (var j = 0, length = split.length; j < length; j++) {
	                            var selector = split[j];
	                            var firstChar = selector.charCodeAt(0);
	
	                            // ` `, trim if first char is space
	                            if (firstChar === 32) {
	                                firstChar = (selector = selector.trim()).charCodeAt(0);
	                            }
	
	                            // &
	                            if (firstChar === 38) {
	                                selector = prefix + selector.substring(1);
	                            }
	                            // : 
	                            else if (firstChar === 58) {
	                                var secondChar = selector.charCodeAt(1);
	
	                                // :host 
	                                if (secondChar === 104) {
	                                    var nextChar = (selector = selector.substring(5)).charCodeAt(0);
	                                    
	                                    // :host(selector)                                                    
	                                    if (nextChar === 40) {
	                                        selector = prefix + selector.substring(1).replace(')', '');
	                                    } 
	                                    // :host-context(selector)
	                                    else if (nextChar === 45) {
	                                        selector = selector.substring(9, selector.indexOf(')')) + ' ' + prefix + ' {';
	                                    }
	                                    // :host
	                                    else {
	                                        selector = prefix + selector;
	                                    }
	                                }
	                                // :global()
	                                else if (secondChar === 103) {
	                                    selector = selector.substring(8).replace(')', '');
	                                }
	                                // :hover, :active, :focus, etc...
	                                else {
	                                    selector = prefix + (firstChar === 58 ? '' : ' ') + selector;
	                                }
	                            }
	                            else {
	                                selector = prefix + (firstChar === 58 ? '' : ' ') + selector;
	                            }
	
	                            build += j === 0 ? selector : ',' + selector;
	                        }
	
	                        line = build;
	                    }
	                }
	
	                // @global/@keyframes
	                if (special !== 0) {
	                    // find the closing tag
	                    if (code === 125) {
	                        close++;
	                    } else if (code === 123 && close !== 0) {
	                        close--;
	                    }
	
	                    // closing tag
	                    if (close === 2) {
	                        // @global
	                        if (type === 0) {
	                            line = '';
	                        }
	                        // @keyframes 
	                        else {
	                            // vendor prefix
	                            line = '}@'+blob+'}';
	                            // reset blob
	                            blob = '';
	                        }
	
	                        // reset flags
	                        type = 0;
	                        close = special > 1 ? 1 : 0;
	                        special--;
	                    }
	                    // @keyframes 
	                    else if (type === 1) {
	                        blob += line;
	                    }
	                }
	            }
	
	            output += line;
	            line    = '';
	            comment = 0;
	        }
	        // build line by line
	        else {
	            // \r, \n, remove line comments
	            if (comment === 1 && (code === 13 || code === 10)) {
	                line = '';
	            }
	            // not `\t`, `\r`, `\n` characters
	            else if (code !== 9 && code !== 13 && code !== 10) {
	                code === 47 && comment === 0 && (comment = 1);
	                line += styles[i];
	            }
	        }
	
	        // next character
	        i++; 
	    }
	
	    return flat === 1 && output.length !== 0 ? prefix+' {'+output+'}' : output;
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * element
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * virtual element node factory
	 * 
	 * @param  {string}  type
	 * @param  {Object=} props
	 * @param  {any[]=}  children
	 * @return {VNode}
	 */
	function VElement (type, props, children) {
		return {
			nodeType: 1, 
			type: type, 
			props: (props || objEmpty), 
			children: (children || []), 
			_node: null,
			_owner: null,
			_index: null
		};
	}
	
	
	/**
	 * virtual component node factory
	 * 
	 * @param  {(function|Component)} type
	 * @param  {Object=}              props
	 * @param  {any[]=}               children
	 * @return {VNode}
	 */
	function VComponent (type, props, children) {
		return {
			nodeType: 2, 
			type: type, 
			props: (props || type.defaultProps || objEmpty), 
			children: (children || []),
			_node: null,
			_owner: null,
			_index: null
		};
	}
	
	
	/**
	 * virtual fragment node factory
	 * 
	 * @param  {VNode[]} children
	 * @return {VNode}
	 */
	function VFragment (children) {
		return {
			nodeType: 11, 
			type: '@', 
			props: objEmpty, 
			children: children,
			_node: null,
			_owner: null,
			_index: null
		};
	}
	
	
	/**
	 * virtual text node factory
	 * 
	 * @param  {(string|boolean|number)} text
	 * @return {VNode}
	 */
	function VText (text) {
		return {
			nodeType: 3, 
			type: 'text', 
			props: objEmpty, 
			children: text, 
			_node: null,
			_owner: null,
			_index: null
		};
	}
	
	
	/**
	 * virtual svg node factory
	 * 
	 * @param  {string}  type
	 * @param  {Object=} props
	 * @param  {any[]=}  children
	 * @return {VNode}
	 */
	function VSvg (type, props, children) {
		return {
			nodeType: 1, 
			type: type, 
			props: (props = props || {}, props.xmlns = nsSvg, props), 
			children: (children || []),
			_node: null,
			_owner: null,
			_index: null
		};
	}
	
	
	/**
	 * virtual node factory
	 * 
	 * @param {number}                      nodeType
	 * @param {(function|Component|string)} type
	 * @param {Object}                      props
	 * @param {VNode[]}                     children
	 * @param {?Node}                      _node
	 * @param {?Component}                 _owner
	 * @param {?index}                     _index
	 */
	function VNode (nodeType, type, props, children, _node, _owner, _index) {
		return {
			nodeType: nodeType,
			type: type,
			props: props,
			children: children,
			_node: _node,
			_owner: _owner,
			_index: _index
		};
	}
	
	
	/**
	 * virtual empty node factory
	 * 
	 * @return {VNode}
	 */
	function VEmpty () {
		return {
			nodeType: 1, 
			type: 'noscript', 
			props: objEmpty, 
			children: [], 
			_node: null,
			_owner: null,
			_index: null
		};
	}
	
	
	/**
	 * create virtual element
	 * 
	 * @param  {(string|function|Object)} type
	 * @param  {Object=}                  props
	 * @param  {...*=}                    children
	 * @return {Object}
	 */
	function createElement (type, props) {
		var length   = arguments.length;
		var children = [];
		var position = 2;
	
		// if props is not a normal object
		if (props == null || props.nodeType !== void 0 || props.constructor !== Object) {
			// update position if props !== undefined|null
			// this assumes that it would look like
			// createElement('type', null, ...children);
			if (props !== null) {
				position = 1; 
			}
	
			// default
			props = {};
		}
	
		if (length !== 1) {
			var index = 0;
			
			// construct children
			for (var i = position; i < length; i++) {
				var child = arguments[i];
				
				// only add non null/undefined children
				if (child != null) {
					// if array, flatten
					if (child.constructor === Array) {
						// add array child
						for (var j = 0, len = child.length; j < len; j++) {
							index = createChild(child[j], children, index);
						}
					} else {
						index = createChild(child, children, index);
					}
				}
			}
		}
	
		// if type is a function, create component VNode
		if (typeof type === 'function') {
			return VComponent(type, props, children);
		} else {
			// if first letter = @, create fragment VNode, else create element VNode
			var element = type[0] === '@' ? VFragment(children) : VElement(type, props, children);
	
			// special type, i.e [type] | div.class | #id
			if ((type.indexOf('.') > -1 || type.indexOf('[') > -1 || type.indexOf('#') > -1)) {
				parseType(type, props || {}, element);
			}
	
			// if props.xmlns is undefined  and type === svg|math 
			// assign svg && math namespaces to props.xmlns
			if (element.props.xmlns === void 0) {	
				if (type === 'svg') { 
					element.props.xmlns = nsSvg; 
				} else if (type === 'math') { 
					element.props.xmlns = nsMath; 
				}
			}
	
			return element;
		}
	}
	
	
	/**
	 * create virtual child node
	 * 
	 * @param {any} child
	 */
	function createChild (child, children, index) {
		if (child != null) {
			if (child.nodeType !== void 0) {
				// Element
				children[index++] = child;
			} else {
				var type = typeof child;
	
				if (type === 'function') {
					// Component
					children[index++] = VComponent(child);
				} else if (type === 'object') {
					// Array
					for (var i = 0, len = child.length; i < len; i++) {
						index = createChild(child[i], children, index);
					}
				} else {
					// Text
					children[index++] = VText(type !== 'boolean' ? child : '');
				}
			}
		} else {
			// Empty
			children[index++] = nodEmpty;
		}
	
		return index;
	}
	
	
	/**
	 * parse special virtual node types
	 *
	 * @example h('inpu#id[type=radio]') <-- yields --> h('input', {id: 'id', type: 'radio'})
	 *
	 * @param  {string} type
	 * @param  {Object} props
	 * @param  {VNode}  vnode
	 */
	function parseType (type, props, vnode) {
		var matches;
		var regEx;
		var classList = [];
	
		// default type
		vnode.type = 'div';
	
		// if undefined, create and cache RegExp
		if (parseType.regEx === void 0) {
			regEx = parseType.regEx = new RegExp(
				'(?:(^|#|\\.)([^#\\.\\[\\]]+))|(\\[(.+?)(?:\\s*=\\s*(\"|\'|)((?:\\\\[\"\'\\]]|.)*?)\\5)?\\])',
				'g'
			);
		} else {
			regEx = parseType.regEx;
		}
	
		// execute RegExp, iterate matches
		while (matches = regEx.exec(type)) {
			var typeMatch      = matches[1];
			var valueMatch     = matches[2];
			var propMatch      = matches[3];
			var propKeyMatch   = matches[4];
			var propValueMatch = matches[6];
	
			if (typeMatch === '' && valueMatch !== '') {
				// type
				vnode.type = valueMatch;
			} else if (typeMatch === '#') { 
				// id
				props.id = valueMatch;
			} else if (typeMatch === '.') { 
				// class(es)
				classList[classList.length] = valueMatch;
			} else if (propMatch[0] === '[') { 
				// attribute
				// remove `[`, `]`, `'` and `"` characters
				if (propValueMatch != null) {
					propValueMatch = propValueMatch.replace(/\\(["'])/g, '$1').replace(/\\\\/g, "\\");
				}
	
				if (propKeyMatch === 'class') {
					propKeyMatch = 'className';
				}
	
				// h('input[checked]') or h('input[checked=true]') yield {checked: true}
				props[propKeyMatch] = propValueMatch || true;
			}
		}
	
		// if there are classes in classList, create className prop member
		if (classList.length !== 0) {
			props.className = classList.join(' ');
		}
	
		// assign props
		vnode.props = props;
	}
	
	
	/**
	 * clone and return an element having the original element's props
	 * with new props merged in shallowly and new children replacing existing ones.
	 * 
	 * @param  {VNode}   subject
	 * @param  {Object=} newProps
	 * @param  {any[]=}  newChildren
	 * @return {VNode}
	 */
	function cloneElement (subject, newProps, newChildren) {
		var type     = subject.type;
		var props    = newProps || {};
		var children = newChildren || subject.children;
	
		// copy old props
		each(subject.props, function (value, name) {
			if (props[name] === void 0) {
				props[name] = value;
			}
		});
	
		// replace children
		if (newChildren !== void 0) {
			var length = newChildren.length;
	
			// if not empty, copy
			if (length > 0) {
				var index    = 0;
					children = [];
	
				// copy old children
				for (var i = 0; i < length; i++) {
					index = createChild(newChildren[i], children, index);
				}
			}
		}
	
		return createElement(type, props, children);
	}
	
	
	/**
	 * create element factory
	 * 
	 * @param  {string}  element
	 * @return {function}
	 */
	function createFactory (type, props) {
		return props ? VElement.bind(null, type, props) : VElement.bind(null, type);
	}
	/**
	 * is valid element
	 * 
	 * @param  {*} subject
	 * @return {boolean}
	 */
	function isValidElement (subject) {
		return subject && subject.nodeType;
	}
	
	
	/**
	 * DOM factory, create VNode factories
	 *
	 * @param {string[]} types
	 */
	function DOM (types) {
		var elements = {};
	
		// add element factories
		for (var i = 0, length = types.length; i < length; i++) {
			elements[types[i]] = VElement.bind(null, types[i]);
		}
		
		// if svg, add related svg element factories
		if (elements.svg) {
			var svgs = ['rect','path','polygon','circle','ellipse','line','polyline','svg',
				'g','defs','text','textPath','tspan','mpath','defs','g'];
	
			for (var i = 0, length = svgs.length; i < length; i++) {
				elements[svgs[i]] = VSvg.bind(null, svgs[i]);
			}
		}
	
		return elements;
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * component
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * set state
	 * 
	 * @param {Object}    newState
	 * @param {function=} callback
	 */
	function setState (newState, callback) {
		if (this.shouldComponentUpdate && this.shouldComponentUpdate(this.props, newState) === false) {
			return;
		}
	
		updateState(this.state, newState);
	
		callback ? this.forceUpdate(callback) : this.forceUpdate();
	}
	
	
	/**
	 * update state, hoisted to avoid deopts
	 * 
	 * @param  {Object} state
	 * @param  {Object} newState
	 */
	function updateState (state, newState) {
		for (var name in newState) {
			state[name] = newState[name];
		}
	}
	
	
	/**
	 * bindState
	 * 
	 * @param  {string}          property
	 * @param  {string}          attr
	 * @param  {boolean=}        preventUpdate
	 * @return {function(Event)}
	 */
	function bindState (property, attr, preventUpdate) {
		var component = this;
	
		return function (e) {
			var target = e.currentTarget;
			var value  = attr in target ? target[attr] : target.getAttribute(attr);
	
			component.state[property] = value;
	
			!preventUpdate && component.forceUpdate();
		}
	}
	
	
	/**
	 * force an update
	 *
	 * @param  {function=}
	 */
	function forceUpdate (callback) {
		if (this.componentWillUpdate) {
			this.componentWillUpdate(this.props, this.state);
		}
	
		var newNode = extractRender(this);
		var oldNode = this._vnode;
	
		// component returns a different root node
		if (newNode.type !== oldNode.type) {		
			// replace node
			replaceNode(newNode, oldNode, oldNode._node.parentNode, createNode(newNode, null, null));
	
			// hydrate newNode
			oldNode.nodeType = newNode.nodeType;
			oldNode.type     = newNode.type;
			oldNode.props    = newNode.props;
			oldNode.children = newNode.children;
			oldNode._node    = newNode._node;
			oldNode._owner   = newNode._owner;
		} else {
			// patch node
			patch(newNode, oldNode);
		}
	
		if (this.componentDidUpdate) {
			this.componentDidUpdate(this.props, this.state);
		}
	
		// callback
		if (callback) {
			callback.call(this);
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * component
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * component class
	 * 
	 * @param {Object=} props
	 */
	function Component (props) {
		// assign props
		if (props && props !== objEmpty) {
			if (this.componentWillReceiveProps) {
				this.componentWillReceiveProps(props);
			}
	
			this.props = props;
		} 
		else if (this.props === void 0) {
			this.props = (this.getDefaultProps && this.getDefaultProps()) || {};
		}
	
		// assign state
		if (this.state === void 0) {
			this.state = (this.getInitialState && this.getInitialState()) || {};
		}
	
		// create addresses for refs and vnode references
		this.refs = this._vnode = null;
	}
	
	
	/**
	 * component prototype
	 * 
	 * @type {Object}
	 */
	Component.prototype = Object.create(null, {
		setState:    { value: setState },
		bindState:   { value: bindState },
		forceUpdate: { value: forceUpdate }
	});
	
	
	/**
	 * create class
	 * 
	 * @param  {(Object|function)} subject
	 * @return {function}
	 */
	function createClass (subject) {
		if (subject._component) {
			// cache
			return subject._component; 
		} else {
			var func      = typeof subject === 'function';
			var shape     = func ? subject() : subject;
			var construct = shape.hasOwnProperty('constructor');
	
			function component (props) {
				construct && this.constructor(props);
				Component.call(this, props); 
			}
	
			component.prototype             = shape;
			component.prototype.bindState   = Component.prototype.bindState;
			component.prototype.setState    = Component.prototype.setState;
			component.prototype.forceUpdate = Component.prototype.forceUpdate;
	
			if (func) {
				subject._component = component;
			}
	
			return component.constructor = component;
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * render
	 * 
	 * ---------------------------------------------------------------------------------
	 */
		
	
	/**
	 * hydrates a server-side rendered dom structure
	 * 
	 * @param  {Node}    element
	 * @param  {VNode}   newNode
	 * @param  {number}  index
	 * @param  {VNode}   parentNode
	 */
	function hydrate (element, newNode, index, parentNode) {
		var currentNode = newNode.nodeType === 2 ? extractComponent(newNode) : newNode;
		var nodeType = currentNode.nodeType;
	
		// is a fragment if `newNode` is not a text node and type is fragment signature '@'
		var isFragmentNode = nodeType === 11 ? 1 : 0;
		var newElement = isFragmentNode === 1 ? element : element.childNodes[index];
	
		// if the node is not a textNode and
		// has children hydrate each of its children
		if (nodeType === 1) {
			var newChildren = currentNode.children;
			var newLength = newChildren.length;
	
			// async hydration
			for (var i = 0; i < newLength; i++) {
				setTimeout(hydrate, 0, newElement, newChildren[i], i, currentNode);
			}
	
			// hydrate the dom element to the virtual element
			currentNode._node = newElement;
	
			// exit early if fragment
			if (isFragmentNode === 1) { 
				return; 
			}
	
			// add events if any
			assignProps(newElement, currentNode.props, true);
	
			// assign refs
			if (currentNode.props.ref !== void 0 && currentNode._owner !== void 0) {
				extractRefs(newElement, currentNode.props.ref, currentNode._owner);
			}
		}
		/*
			when we reach a string child, it is assumed that the dom representing it is a single textNode,
			we do a look ahead of the child, create & append each textNode child to documentFragment 
			starting from current child till we reach a non textNode such that on h('p', 'foo', 'bar') 
			foo and bar are two different textNodes in the fragment, we then replace the 
			single dom's textNode with the fragment converting the dom's single textNode to multiple
		 */
		else if (nodeType === 3) {
			// fragment to use to replace a single textNode with multiple text nodes
			// case in point h('h1', 'Hello', 'World') output: <h1>HelloWorld</h1>
			// but HelloWorld is one text node in the dom while two in the vnode
			var fragment = document.createDocumentFragment();
			var children = parentNode.children;
	
			// look ahead of this nodes siblings and add all textNodes to the the fragment.
			// exit when a non text node is encounted
			for (var i = index, length = children.length - index; i < length; i++) {
				var textNode = children[i];
	
				// exit early once we encounter a non text/string node
				if (textNode.nodeType !== 3) {
					break;
				}
	
				// create textnode, append to the fragment
				fragment.appendChild(textNode._node = document.createTextNode(textNode.children || ''));
			}
	
			// replace the textNode with a set of textNodes
			element.replaceChild(fragment, element.childNodes[index]);
		}
	}
	
	
	/**
	 * render
	 * 
	 * @param  {(Component|VNode)} subject
	 * @param  {(Node|string)}     target
	 * @return {function(Object=)}
	 */
	function render (subject, target) {
		// renderer
		function reconciler (props) {
			if (initial) {
				// dispatch mount
				mount(element, node);
	
				// register mount has been dispatched
				initial = false;
	
				// assign component
				component === void 0 && (component = node._owner);
			} else {
				// update props
				if (props !== void 0) {
					if (
						component.shouldComponentUpdate !== void 0 && 
						component.shouldComponentUpdate(props, component.state) === false
					) {
						return reconciler;
					}
	
					component.props = props;
				}
	
				// update component
				component.forceUpdate();
			}
	
			return reconciler;
		}
	
		var component;
		var node;
		var element;
	
		if (subject.render !== void 0) {
			// create component from object
			node = VComponent(createClass(subject));
		} else if (subject.type === void 0) {
			// fragment/component
			node = subject.constructor === Array ? createElement('@', null, subject) : VComponent(subject);
		} else {
			node = subject;
		}
	
		if (server) {
			return reconciler;
		}
	
		// retrieve mount element
	  	if (target != null && target.nodeType != null) {
		  // target is a dom element
		  element = target;
		} else {
		  // target might be a selector
		  target = document.querySelector(target);
	
		  // default to document.body if no match/document
		  element = (target === null || target === document) ? document.body : target;
		}
	
		// initial mount registry
		var initial = true;
	
		// hydration
		if (element.hasAttribute('hydrate')) {
			// dispatch hydration
			hydrate(element, node, 0, nodEmpty);
	
			// cleanup element hydrate attributes
			element.removeAttribute('hydrate');
	
			// register mount has been dispatched
			initial = false;
	
			// assign component
			component === void 0 && (component = node._owner); 
		} else {
			reconciler();
		}
	
		return reconciler;
	}
	
	
	/**
	 * mount render
	 * 
	 * @param  {Node}   element
	 * @param  {Object} newNode
	 */
	function mount (element, newNode) {
		// clear element
		element.textContent = '';
		// create element
		appendNode(newNode, element, createNode(newNode, null, null));
	}
	
	
	/**
	 * patch nodes
	 *  
	 * @param  {VNode}  newNode  
	 * @param  {VNode}  oldNode  
	 * @return {number} number
	 */
	function patch (newNode, oldNode) {
		var newNodeType = newNode.nodeType;
		var oldNodeType = oldNode.nodeType;
	
		// remove operation
		if (newNodeType === 0) { 
			return 1; 
		}
		// add operation
		else if (oldNodeType === 0) { 
			return 2;
		}
		// text operation
		else if (newNodeType === 3 && oldNodeType === 3) { 
			if (newNode.children !== oldNode.children) {
				return 3; 
			} 
		}
		// key operation
		else if (newNode.props.key !== oldNode.props.key) {
			return 5; 
		}
		// replace operation
		else if (newNode.type !== oldNode.type) {
			return 4;
		}
		// recursive
		else {
			// if currentNode and oldNode are the identical, exit early
			if (newNode !== oldNode) {		
				// extract node from possible component node
				var currentNode = newNodeType === 2 ? extractComponent(newNode) : newNode;
	
				// a component
				if (oldNodeType === 2) {
					var oldComponent = oldNode._owner;
					var newComponent = newNode._owner;
	
					// a component with shouldComponentUpdate method
					if (
						oldComponent.shouldComponentUpdate && 
						oldComponent.shouldComponentUpdate(newNode.props, newComponent.state) === false
					) {
						// exit early
						return 0;
					}
	
					// a component with a componentWillUpdate method
					if (oldComponent.componentWillUpdate) {
						oldComponent.componentWillUpdate(newNode.props, newComponent.state);
					}
				}
	
				// references, children & children length
				var newChildren = currentNode.children;
				var oldChildren = oldNode.children;
				var newLength   = newChildren.length;
				var oldLength   = oldChildren.length;
	
				// new children length is 0 clear/remove all children
				if (newLength === 0) {
					// but only if old children is not already cleared
					if (oldLength !== 0) {
						oldNode._node.textContent = '';
						oldNode.children = newChildren;
					}	
				}
				// newNode has children
				else {
					var parentNode = oldNode._node;
					var isKeyed = false;
					var oldKeys;
					var newKeys;
	
					// for loop, the end point being which ever is the 
					// greater value between newLength and oldLength
					for (var i = 0; i < newLength || i < oldLength; i++) {
						var newChild = newChildren[i] || nodEmpty;
						var oldChild = oldChildren[i] || nodEmpty;
						var action   = patch(newChild, oldChild);
	
						// if action dispatched, 
						// 1 - remove, 2 - add, 3 - text update, 4 - replace, 5 - key
						if (action !== 0) {
							switch (action) {
								// remove operation
								case 1: {
									// remove dom node, remove old child
									removeNode(oldChildren.pop(), parentNode);
	
									break;
								}
								// add operation
								case 2: {
									// append dom node, push new child
									appendNode(
										oldChildren[oldChildren.length] = newChild, 
										parentNode, 
										createNode(newChild, null, null)
									);
	
									break;
								}
								// text operation
								case 3: {
									// replace dom node text, replace old child text
									oldChild._node.nodeValue = oldChild.children = newChild.children;
	
									break;
								}
								// replace operation
								case 4: {
									// replace dom node, replace old child
									replaceNode(
										oldChildren[i] = newChild, 
										oldChild, 
										parentNode, 
										createNode(newChild, null, null)
									);
	
									break;
								}
								// keyed operation
								case 5: {
									// register keyed children
									if (isKeyed === false) {
										isKeyed = true;
										oldKeys = {};
										newKeys = {};
									}
	
									var newKey = newChild.props.key;
									var oldKey = oldChild.props.key;
	
									// register key
									newKeys[newKey] = (newChild._index = i, newChild);
									oldKeys[oldKey] = (oldChild._index = i, oldChild);
	
									// padding
									if (newLength > oldLength) {
										oldChildren.splice(i, 0, nodEmpty);
									} else if (oldLength > newLength) {
										newChildren.splice(i, 0, nodEmpty);
									}
								}
							}
						}
					}
				}
	
				// reconcile keyed children
				if (isKeyed === true) {
					// offloaded to another function to keep the type feedback 
					// of this function to a minimum when non-keyed
					keyed(
						newKeys, 
						oldKeys, 
						parentNode, 
						oldNode, 
						newChildren, 
						oldChildren, 
						newLength, 
						oldLength
					);
				}
	
				// patch props only if oldNode is not a textNode 
				// and the props objects of the two nodes are not equal
				if (currentNode.props !== oldNode.props) {
					patchProps(currentNode, oldNode); 
				}
	
				// a component with a componentDidUpdate method
				if (oldNodeType === 2 && oldComponent.componentDidUpdate) {
					oldComponent.componentDidUpdate(newNode.props, newComponent.state);
				}
			}
		}
	
		return 0;
	}
	
	
	/**
	 * patch keyed nodes
	 *
	 * @param {Object}  newKeys
	 * @param {Object}  oldKeys
	 * @param {VNode}   oldNode
	 * @param {Node}    parentNode
	 * @param {VNode[]} newChildren
	 * @param {VNode[]} oldChildren
	 * @param {number}  newLength
	 * @param {number}  oldLength
	 */
	function keyed (newKeys, oldKeys, parentNode, oldNode, newChildren, oldChildren, newLength, oldLength) {
		var reconciledChildren = new Array(newLength);
		var deleteCount        = 0;
	
		for (var i = 0; i < newLength || i < oldLength; i++) {
			var newChild = newChildren[i] || nodEmpty;
			var oldChild = oldChildren[i] || nodEmpty;
			var newKey   = newChild.props.key;
			var oldKey   = oldChild.props.key;
	
			// new and old keys match, no-op
			if (newKey === oldKey) {
				reconciledChildren[i-deleteCount] = oldChild;
			}
			// new and old keys don't match 
			else {
				var movedChild = oldKeys[newKey];
	
				// new key exists in old keys
				if (movedChild) {
					var idx = movedChild._index;
	
					// but the index does not match,
					if (i !== idx) {
						// move
						reconciledChildren[idx] = oldChild;
						
						parentNode.insertBefore(
							oldChild._node = parentNode.children[idx],
							parentNode.children[i+1]
						);
					}
				}
				// old key does not exist
				else if (oldChild.nodeType === 0) {
					// insert
					reconciledChildren[i-deleteCount] = newChild;
	
					insertNode(
						newChild, 
						oldChildren[i+1], 
						parentNode, 
						createNode(newChild, null, null)
					);
				}
				// new key does not exist
				else if (newChild.nodeType === 0) {
					// remove
					removeNode(oldChild, parentNode);
					deleteCount++;
				}
				// new key and old key exists 
				// but new key is not in old keys
				else {
					// replace
					reconciledChildren[i-deleteCount] = newChild;
					replaceNode(newChild, oldChild, parentNode, createNode(newChild, null, null));
				}
			}
		}
	
		// replace old children with reconciled children
		oldNode.children = reconciledChildren;
	}
	/**
	 * assign prop for create element
	 * 
	 * @param  {Node}       target
	 * @param  {Object}     props
	 * @param  {number}     onlyEvents
	 */
	function assignProps (target, props, onlyEvents) {
		for (var name in props) {
			assignProp(target, name, props, onlyEvents);
		}
	}
	
	
	/**
	 * assign prop for create element
	 * 
	 * @param  {Node}       target
	 * @param  {string}     name
	 * @param  {Object}     props
	 * @param  {number}     onlyEvents
	 */
	function assignProp (target, name, props, onlyEvents) {
		var propValue = props[name];
	
		if (isEventName(name)) {
			target.addEventListener(extractEventName(name), propValue);
		} else if (onlyEvents === false) {
			// add attribute
			updateProp(target, 'setAttribute', name, propValue, props.xmlns);
		}
	}
	
	
	/**
	 * patch props
	 * 
	 * @param  {VNode} newNode
	 * @param  {VNode} oldNode
	 */
	function patchProps (newNode, oldNode) {
		var diff   = diffProps(newNode, oldNode, newNode.props.xmlns || '', []);
		var length = diff.length;
	
		// if diff length > 0 apply diff
		if (length !== 0) {
			var target = oldNode._node;
	
			for (var i = 0; i < length; i++) {
				var prop = diff[i];
				// [0: action, 1: name, 2: value, namespace]
				updateProp(target, prop[0], prop[1], prop[2], prop[3]);
			}
	
			oldNode.props = newNode.props;
		}
	}
	
	
	/**
	 * collect prop diffs
	 * 
	 * @param  {VNode}   newNode 
	 * @param  {VNode}   oldNode 
	 * @param  {string}  namespace
	 * @param  {Array[]} propsDiff
	 * @return {Array[]}          
	 */
	function diffProps (newNode, oldNode, namespace, diff) {
		// diff newProps
		for (var newName in newNode.props) { 
			diffNewProps(newNode, oldNode, newName, namespace, diff); 
		}
	
		// diff oldProps
		for (var oldName in oldNode.props) { 
			diffOldProps(newNode, oldName, namespace, diff); 
		}
	
		return diff;
	}
	
	
	/**
	 * diff newProps agains oldProps
	 * 
	 * @param  {VNode}   newNode 
	 * @param  {VNode}   oldNode 
	 * @param  {string}  newName
	 * @param  {string}  namespace
	 * @param  {Array[]} diff
	 * @return {Array[]}          
	 */
	function diffNewProps (newNode, oldNode, newName, namespace, diff) {
		var newValue = newNode.props[newName];
		var oldValue = oldNode.props[newName];
	
		if (newValue != null && oldValue !== newValue) {
			diff[diff.length] = ['setAttribute', newName, newValue, namespace];
		}
	}
	
	
	/**
	 * diff oldProps agains newProps
	 * 
	 * @param  {VNode}   newNode 
	 * @param  {Object}  oldName 
	 * @param  {string}  namespace
	 * @param  {Array[]} diff
	 * @return {Array[]}          
	 */
	function diffOldProps (newNode, oldName, namespace, diff) {
		var newValue = newNode.props[oldName];
	
		if (newValue == null) {
			diff[diff.length] = ['removeAttribute', oldName, '', namespace];
		}
	}
	
	
	/**
	 * assign/update/remove prop
	 * 
	 * @param  {Node}   target
	 * @param  {string} action
	 * @param  {string} name
	 * @param  {*}      propValue
	 * @param  {string} namespace
	 */
	function updateProp (target, action, name, propValue, namespace) {
		// avoid refs, keys, events and xmlns namespaces
		if (name === 'ref' || 
			name === 'key' || 
			isEventName(name) || 
			propValue === nsSvg || 
			propValue === nsMath
		) {
			return;
		}
	
		// if xlink:href set, exit, 
		if (name === 'xlink:href') {
			return (target[action + 'NS'](nsXlink, 'href', propValue), void 0);
		}
	
		var isSVG = 0;
		var propName;
	
		// normalize class/className references, i.e svg className !== html className
		// uses className instead of class for html elements
		if (namespace === nsSvg) {
			isSVG = 1;
			propName = name === 'className' ? 'class' : name;
		} else {
			propName = name === 'class' ? 'className' : name;
		}
	
		var targetProp = target[propName];
		var isDefinedValue = (propValue != null && propValue !== false) ? 1 : 0;
	
		// objects, adds property if undefined, else, updates each memeber of attribute object
		if (isDefinedValue === 1 && typeof propValue === 'object') {
			targetProp === void 0 ? target[propName] = propValue : updatePropObject(propValue, targetProp);
		} else {
			if (targetProp !== void 0 && isSVG === 0) {
				target[propName] = propValue;
			} else {
				// remove attributes with false/null/undefined values
				if (isDefinedValue === 0) {
					target['removeAttribute'](propName);
				} else {
					// reduce value to an empty string if true, <tag checked=true> --> <tag checked>
					if (propValue === true) { 
						propValue = ''; 
					}
	
					target[action](propName, propValue);
				}
			}
		}
	}
	
	
	/**
	 * update prop objects, i.e .style
	 * 
	 * @param  {Object} value
	 * @param  {*}      targetAttr
	 */
	function updatePropObject (value, targetAttr) {
		for (var propName in value) {
			var propValue = value[propName] || null;
	
			// if targetAttr object has propName, assign
			if (propName in targetAttr) {
				targetAttr[propName] = propValue;
			}
		}
	}
	
	
	/**
	 * create element
	 * 
	 * @param  {VNode}      subject
	 * @param  {?Component} component
	 * @param  {?string}    namespace
	 * @return {Node}
	 */
	function createNode (subject, component, namespace) {
		var nodeType = subject.nodeType;
		
		if (nodeType === 3) {
			// textNode
			return subject._node = document.createTextNode(subject.children);
		} else {
			// element
			var element;
			var props;
	
			if (subject._node) {
				// hoisted vnode
				props   = subject.props;
				element = subject._node;
			} else {
				// create
				var newNode  = nodeType === 2 ? extractComponent(subject) : subject;
				var type     = newNode.type;
				var children = newNode.children;
				var length   = children.length;
	
				props = newNode.props;
	
				// assign namespace
				if (props.xmlns !== void 0) { 
					namespace = props.xmlns; 
				}
	
				// if namespaced, create namespaced element
				if (namespace !== null) {
					// if undefined, assign svg namespace
					if (props.xmlns === void 0) {
						props.xmlns = namespace;
					}
	
					element = document.createElementNS(namespace, type);
				} else {
					if (newNode.nodeType === 11) {
						element = document.createDocumentFragment();
					} else {
						element = document.createElement(type);
					}
				}
	
				// vnode has component attachment
				if (subject._owner !== null) {
					(component = subject._owner)._vnode._node = element;
				}
	
				if (props !== objEmpty) {
					// diff and update/add/remove props
					assignProps(element, props, false);
				}
	
				if (length !== 0) {
					// create children
					for (var i = 0; i < length; i++) {
						var newChild = children[i];
	
						// clone vnode of hoisted/pre-rendered node
						if (newChild._node) {
							newChild = children[i] = VNode(
								newChild.nodeType,
								newChild.type,
								newChild.props,
								newChild.children,
								newChild._node.cloneNode(true),
								null,
								null
							);
						}
	
						// append child
						appendNode(newChild, element, createNode(newChild, component, namespace));
						
						// we pass component and namespace so that 
						// 1. if an element is svg we can namespace all its children in kind
						// 2. we can propagate nested refs to the parent component
					}
				}
	
				// cache element reference
				subject._node = element;
			}
	
			if (component !== null) {
				// refs
				if (props.ref !== void 0) {
					extractRefs(element, props.ref, component);
				}
	
				// stylesheets
				if (component.stylesheet) {
					if (component.stylesheet.styler === void 0) {
						// create
						stylesheet(component, subject.type)(element);
					} else {
						// namespace
						component.stylesheet(element);
					}
				}
			}
	
			return element;
		}
	}
	
	
	/**
	 * append element
	 *
	 * @param {VNode} newNode
	 * @param {Node}  parentNode
	 * @param {Node}  nextNode
	 */
	function appendNode (newNode, parentNode, nextNode) {
		if (newNode._owner !== null && newNode._owner.componentWillMount) {
			newNode._owner.componentWillMount(nextNode);
		}
	
		// append node
		parentNode.appendChild(nextNode);
	
		if (newNode._owner !== null && newNode._owner.componentDidMount) {
			newNode._owner.componentDidMount(nextNode);
		}
	}
	
	
	/**
	 * insert element
	 *
	 * @param {VNode} newNode
	 * @param {VNode} newNode
	 * @param {Node}  parentNode
	 * @param {Node}  nextNode
	 */
	function insertNode (newNode, oldNode, parentNode, nextNode) {
		if (newNode._owner !== null && newNode._owner.componentWillMount) {
			newNode._owner.componentWillMount(nextNode);
		}
	
		// insert node
		parentNode.insertBefore(nextNode, oldNode._node);
	
		if (newNode._owner !== null && newNode._owner.componentDidMount) {
			newNode._owner.componentDidMount(nextNode);
		}
	}
	
	
	/**
	 * remove element
	 *
	 * @param {VNode} oldNode
	 * @param {Node}  parentNode
	 */
	function removeNode (oldNode, parentNode) {
		if (oldNode._owner !== null && oldNode._owner.componentWillUnmount) {
			oldNode._owner.componentWillUnmount(oldNode._node);
		}
	
		// remove node
		parentNode.removeChild(oldNode._node);
	
		// clear references
		oldNode._node = null;
	}
	
	
	/**
	 * replace element
	 *
	 * @param {VNode} newNode
	 * @param {VNode} oldNode
	 * @param {Node}  parentNode 
	 * @param {Node}  nextNode
	 */
	function replaceNode (newNode, oldNode, parentNode, nextNode) {
		if (oldNode._owner !== null && oldNode._owner.componentWillUnmount) {
			oldNode._owner.componentWillUnmount(oldNode._node);
		}
	
		if (newNode._owner !== null && newNode._owner.componentWillMount) {
			newNode._owner.componentWillMount(nextNode);
		}
	
		// replace node
		parentNode.replaceChild(nextNode, oldNode._node);
		
		if (newNode._owner !== null && newNode._owner.componentDidMount) {
			newNode._owner.componentDidMount(nextNode);
		}
	
		// clear references
		oldNode._node = null;
	}
	
	
	/**
	 * extract event name from prop
	 * 
	 * @param  {string} name
	 * @return {string}
	 */
	function extractEventName (name) {
		return name.substring(2).toLowerCase();
	}
	
	
	/**
	 * check if a name is an event-like name, i.e onclick, onClick...
	 * 
	 * @param  {string}  name
	 * @return {boolean}
	 */
	function isEventName (name) {
		return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 3;
	}
	
	
	/**
	 * extract refs
	 * 
	 * @param {Node}              element
	 * @param {(Object|function)} ref
	 * @param {Component}         component
	 */
	function extractRefs (element, ref, component) {
		// hoist typeof info
		var type = typeof ref;
		var refs = (component.refs === null ? component.refs = {} : component.refs);
	
		if (type === 'string') {
			// string ref, assign
			refs[ref] = element;
		} else if (type === 'function') {
			// function ref, call with element as arg
			ref(element);
		}
	}
	
	
	/**
	 * extract component
	 * 
	 * @param  {VNode} subject
	 * @return {VNode} 
	 */
	function extractComponent (subject, mutate) {
		var candidate;
		var type = subject.type;
	
		if (type._component !== void 0) {
			// cache
			candidate = type._component;
		} else if (type.constructor === Function && type.prototype.render === void 0) {
			// function components
			candidate = type._component = createClass(type);
		} else {
			// class / createClass components
			candidate = type;
		}
	
		// create component instance
		var component = subject._owner = new candidate(subject.props);
	
		if (subject.children.length !== 0) {
			component.props.children = subject.children;
		}
		
		// retrieve vnode
		var vnode = extractRender(component);
	
		// if keyed, assign key to vnode
		if (subject.props.key !== void 0 && vnode.props.key === void 0) {
			vnode.props.key = subject.props.key;
		}
	
		// if render returns a component, extract that component
		if (vnode.nodeType === 2) {
			vnode = extractComponent(vnode);
		}
	
		// replace props and children of old vnode
		subject.props    = vnode.props
		subject.children = vnode.children;
	
		// assign reference to component 
		component._vnode = vnode;
	
		return vnode;
	}
	
	
	/**
	 * extract a render function
	 *
	 * @param  {Component} component
	 * @return {VNode}
	 */
	function extractRender (component) {
		// extract render
		var vnode = component.render(component.props, component.state, component) || VEmpty();
	
		// if vnode, else fragment
		return vnode.nodeType !== void 0 ? vnode : VFragment(vnode);
	}
	
	
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * Server Side Render
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * server side render to string
	 * 
	 * @param  {(Object|function)}  subject
	 * @param  {(string|function)=} template
	 * @return {string}
	 */
	function renderToString (subject, template) {
		var lookup = {styles: '', ids: {}};
		var vnode  = retrieveVNode(subject);
		var body   = renderVNodeToString(vnode, lookup);
		var css    = lookup.styles;
		var style  = css.length !== 0 ? '<style>'+css+'<style>' : '';
	
		if (template) {
			if (typeof template === 'string') {
				return template.replace('@body', body, style);
			} else {
				return template(body, style);
			}
		} else {
			return body+style;
		}
	}
	
	
	/**
	 * render props to string
	 * 
	 * @param  {Object<string, any>} props
	 * @return {string}
	 */
	function renderPropsToString (props) {
		var string = '';
	
		// construct props string
		if (props !== objEmpty && props !== null) {
			each(props, function (value, name) {
				// value --> <type name=value>, exclude props with undefined/null/false as values
				if (value != null && value !== false) {
					var type = typeof value;
	
					if (type === 'string' && value) {
						value = escape(value);
					}
	
					// do not process these props
					if (
						type !== 'function' &&
						name !== 'key' && 
						name !== 'ref' && 
						name !== 'innerHTML'
					) {
						if (type !== 'object') {
							if (name === 'className') { 
								name = 'class'; 
							}
	
							// if falsey/truefy checkbox=true ---> <type checkbox>
							string += ' ' + (value === true ? name : name + '="' + value + '"');
						} else {
							// if style objects
							var style = '';
	
							each(value, function (value, name) {
								// if camelCase convert to dash-case 
								// i.e marginTop --> margin-top
								if (name !== name.toLowerCase()) {
									name.replace(regStyleCamel, '$1-').replace(regStyleVendor, '-$1').toLowerCase();
								}
	
								style += name + ':' + value + ';';
							});
	
							string += name + '="' + value + '"';
						}
					}
				}
			});
		}
	
		return string;
	}
	
	
	/**
	 * render a VNode to string
	 * 
	 * @param  {VNode}               subject
	 * @param  {Object<string, any>} lookup
	 * @return {string}  
	 */
	function renderVNodeToString (subject, lookup) {
		var nodeType = subject.nodeType;
	
		// textNode
		if (nodeType === 3) {
			return escape(subject.children);
		}
	
		var vnode;
	
		// if component
		if (nodeType === 2) {
			// if cached
			if (subject.type._html !== void 0) {
				return subject.type._html;
			} else {
				vnode = extractComponent(subject);
			}
		} else {
			vnode = subject;
		}
	
		// references
		var type = vnode.type;
		var props = vnode.props;
		var children = vnode.children;
	
		var childrenStr = '';
	
		if (props.innerHTML !== void 0) {
			// special case when a prop replaces children
			childrenStr = props.innerHTML;
		} else {		
			// construct children string
			if (children.length !== 0) {
				for (var i = 0, length = children.length; i < length; i++) {
					childrenStr += renderVNodeToString(children[i], lookup);
				}
			}
		}
	
		var propsStr = renderStylesheetToString(
			nodeType, subject._owner, subject.type, renderPropsToString(props), lookup
		);
	
		if (vnode.nodeType === 11) {
			return childrenStr;
		} else if (isVoid[type] === 0) {
			// <type ...props>
			return '<'+type+propsStr+'>';
		} else {
			// <type ...props>...children</type>
			return '<'+type+propsStr+'>'+childrenStr+'</'+type+'>';
		}
	}
	
	
	/**
	 * render stylesheet to string
	 *
	 * @param  {number}              nodeType
	 * @param  {Component}           component
	 * @param  {function}            constructor
	 * @param  {string}              output   
	 * @param  {Object<string, any>} lookup
	 * @return {string}          
	 */
	function renderStylesheetToString (nodeType, component, constructor, output, lookup) {
		// stylesheet
		if (nodeType === 2) {
			// stylesheets
			if (component.stylesheet) {
				var id = component.stylesheet.styler;
	
				if (id === void 0) {
					// create
					lookup.styles += stylesheet(component, constructor)(null);
					lookup.ids[id = component.stylesheet.styler] = true;
				}
			 	else if (!lookup.ids[id]) {
					lookup.styles += component.stylesheet(null);
					lookup.ids[id] = true;
				}
	
				// add attribute to element
				output += ' '+nsStyle+'='+'"'+id+'"';
			}
		}
	
		return output;
	}
	
	
	/**
	 * server-side render to stream
	 * 
	 * @param  {(VNode|Component)} subject 
	 * @param  {string=}           template
	 * @return {Stream}
	 */
	function renderToStream (subject, template) {	
		return subject ? (
			new Stream(subject, template == null ? null : template.split('@body'))
		) : function (subject) {
			return new Stream(subject);
		}
	}
	
	
	/**
	 * Stream
	 * 
	 * @param {(VNode|Component)} subject
	 * @param {string=}           template
	 */
	function Stream (subject, template) {
		this.initial  = 0;
		this.stack    = [];
		this.lookup   = {styles: '', ids: {}};
		this.template = template;
		this.node     = retrieveVNode(subject);
	
		readable.call(this);
	}
	
	
	/**
	 * Stream prototype
	 * 
	 * @type {Object}
	 */
	Stream.prototype = server ? Object.create(readable.prototype, {
		_type: {
			value: 'text/html'
		},
		_read: {
			value: function () {
				if (this.initial === 1 && this.stack.length === 0) {
					var style = this.lookup.styles;
	
					// if there are styles, append
					if (style.length !== 0) {
						this.push('<style>'+style+'</style>');
					}
	
					// has template, push closing
					if (this.template) {
						this.push(this.template[1]);
					}
	
					// end of stream
					this.push(null);
	
					// reset `initial` identifier
					this.initial = 0;			
				} else {
					// start of stream
					if (this.initial === 0) {
						this.initial = 1;
	
						// has template, push opening 
						this.template && this.push(this.template[0]);
					}
	
					// pipe a chunk
					this._pipe(this.node, true, this.stack, this.lookup);
				}
			}
		},
		_pipe: {
			value: function (subject, flush, stack, lookup) {
				// if there is something pending in the stack
				// give that priority
				if (flush && stack.length !== 0) {
					stack.pop()(this); return;
				}
	
				var nodeType = subject.nodeType;
	
				// text node
				if (nodeType === 3) {
					// convert string to buffer and send chunk
					this.push(escape(subject.children)); return;
				}
	
				var vnode;
	
				// if component
				if (nodeType === 2) {
					// if cached
					if (subject.type._html !== void 0) {
						this.push(subject.type._html); return;
					} else {
						vnode = extractComponent(subject);
					}
				} else {
					vnode = subject;
				}
	
				// references
				var type = vnode.type;
				var props = vnode.props;
				var children = vnode.children;
	
				var propsStr = renderStylesheetToString(
					nodeType, subject._owner, subject.type, renderPropsToString(props), lookup
				);
	
				if (isVoid[type] === 0) {
					// <type ...props>
					this.push('<'+type+propsStr+'>');
				} else {
					var opening = '';
					var closing = '';
	
					// fragments do not have opening/closing tags
					if (vnode.nodeType !== 11) {
						// <type ...props>...children</type>
						opening = '<'+type+propsStr+'>';
						closing = '</'+type+'>';
					}
	
					if (props.innerHTML !== void 0) {
						// special case when a prop replaces children
						this.push(opening+props.innerHTML+closing);
					} else {
						var length = children.length;
	
						if (length === 0) {
							// no children, sync
							this.push(opening+closing);
						} else if (length === 1 && children[0].nodeType === 3) {
							// one text node child, sync
							this.push(opening+escape(children[0].children)+closing);
						} else {
							// has children, async
							// since we cannot know ahead of time the number of children
							// split this operation into asynchronously added chunks of data
							var index = 0;
							// add one more for the closing tag
							var middlwares = length + 1;
	
							var doctype = type === 'html';
							var eof = doctype || type === 'body';
	
							// for each _read if queue has middleware
							// middleware execution will take priority
							var middleware = function (stream) {
								// done, close html tag, delegate next middleware
								if (index === length) {
									// if the closing tag is body or html
									// we want to push the styles before we close them
									if (eof && lookup.styles.length !== 0) {
										stream.push('<style>'+lookup.styles+'</style>');
										// clear styles, avoid adding duplicates
										lookup.styles = '';
									}
	
									stream.push(closing);
								} else {
									stream._pipe(children[index++], false, stack, lookup);
								}
							}
	
							// if opening html tag, push doctype first
							if (doctype) {
								this.push('<!doctype html>');
							}
	
							// push opening tag
							this.push(opening);
	
							// push middlwares
							for (var i = 0; i < middlwares; i++) {
								stack[stack.length] = middleware;
							}
						}
					}
				}
			}
		}
	}) : objEmpty;
	
	
	/**
	 * renderToCache
	 * 
	 * @param  {Object} subject
	 * @return {Object} subject
	 */
	function renderToCache (subject) {
		if (subject != null && server) {
			// if array run all VNodes through renderToCache
			if (subject.constructor === Array) {
				for (var i = 0, length = subject.length; i < length; i++) {
					renderToCache(subject[i]);
				}
			} else if (subject._html == null) {
				subject._html = renderToString(subject);
			}
		}
	
		return subject;
	}
	
	
	/**
	 * retrieve virtual node
	 * 
	 * @param  {(function|object)} subject
	 * @return {VNode}
	 */
	function retrieveVNode (subject) {
		if (subject.type) {
			return subject;
		} else {
			return typeof subject === 'function' ? VComponent(subject) : createElement('@', null, subject);
		}
	}
	
	


	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * exports
	 * 
	 * ---------------------------------------------------------------------------------
	 */


	if (browser) {
		window.h = createElement;
	}

	return {
		// elements
		createElement:    createElement,
		isValidElement:   isValidElement,
		cloneElement:     cloneElement,
		createFactory:    createFactory,

		VText:            VText,
		VElement:         VElement,
		VSvg:             VSvg,
		VFragment:        VFragment,
		VComponent:       VComponent,

		DOM:              DOM,

		// render
		render:           render,
		renderToString:   renderToString,
		renderToStream:   renderToStream,
		renderToCache:    renderToCache,

		// components
		Component:        Component,
		createClass:      createClass,

		// utilities
		escape:           escape,
		random:           random,
		
		// version
		version:          version,

		// alias
		h:                createElement,
	};
}));