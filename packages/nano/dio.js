/*
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * dio is a fast javascript framework for building applications.
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
	var version = '5.0.3';
	
	// enviroment variables
	var document = window.document || null;
	var browser = document !== null;
	var server = browser === false;
	
	// namespaces
	var nsStyle = 'data-scope';
	var nsMath  = 'http://www.w3.org/1998/Math/MathML';
	var nsXlink = 'http://www.w3.org/1999/xlink';
	var nsSvg = 'http://www.w3.org/2000/svg';
	
	// empty shapes
	var objEmpty = Object.create(null);
	var arrEmpty = [];
	var nodEmpty = VNode(0, '', objEmpty, arrEmpty, null, null, null);
	
	
	/**
	 * for in proxy
	 * 
	 * @param  {Object<string, any>} obj
	 * @param  {function(any, string)} func
	 */
	function each (obj, func) {
		for (var name in obj) {
			func(obj[name], name);
		}
	}
	
	
	/**
	 * text shape
	 *
	 * @public
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
			DOMNode: null,
			instance: null,
			index: null
		};
	}
	
	
	/**
	 * element shape
	 *
	 * @public
	 * 
	 * @param  {string}               type
	 * @param  {Object<string, any>=} props
	 * @param  {VNode[]=}             children
	 * @return {VNode}
	 */
	function VElement (type, props, children) {
		return {
			nodeType: 1, 
			type: type, 
			props: (props || objEmpty), 
			children: (children || []), 
			DOMNode: null,
			instance: null,
			index: null
		};
	}
	
	
	/**
	 * svg shape
	 *
	 * @public
	 * 
	 * @param  {string}               type
	 * @param  {Object<string, any>=} props
	 * @param  {VNode[]=}             children
	 * @return {VNode}
	 */
	function VSvg (type, props, children) {
		return {
			nodeType: 1, 
			type: type, 
			props: (props = props || {}, props.xmlns = nsSvg, props), 
			children: (children || []),
			DOMNode: null,
			instance: null,
			index: null
		};
	}
	
	
	/**
	 * fragment shape
	 *
	 * @public
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
			DOMNode: null,
			instance: null,
			index: null
		};
	}
	
	
	/**
	 * component shape
	 *
	 * @public
	 * 
	 * @param  {(function|Component)} type
	 * @param  {Object<string, any>=} props
	 * @param  {any[]=}               children
	 * @return {VNode}
	 */
	function VComponent (type, props, children) {
		return {
			nodeType: 2, 
			type: type, 
			props: (props || objEmpty), 
			children: (children || arrEmpty),
			DOMNode: null,
			instance: null,
			index: null
		};
	}
	
	
	/**
	 * empty shape
	 * 
	 * @return {VNode}
	 */
	function VEmpty () {
		return {
			nodeType: 1, 
			type: 'noscript', 
			props: objEmpty, 
			children: [], 
			DOMNode: null,
			instance: null,
			index: null
		};
	}
	
	
	/**
	 * VNode shape
	 *
	 * @param  {number}                      nodeType
	 * @param  {(string|function|Component)} type
	 * @param  {Object<string, any>}         props
	 * @param  {VNode[]}                     children
	 * @param  {Node}                        DOMNode
	 * @param  {Component}                   instance
	 * @param  {number}                      index
	 * @return {VNode}
	 */
	function VNode (nodeType, type, props, children, DOMNode, instance, index) {
		return {
			nodeType: nodeType,
			type: type,
			props: props,
			children: children,
			DOMNode: DOMNode,
			instance: instance,
			index: index
		};
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
	 * @param  {Component}       component
	 * @param  {function}        constructor
	 * @param  {boolean}         inject
	 * @return {function(?Node)}
	 */
	function stylesheet (component, constructor, inject) {
		var namespace = component.displayName || constructor.name;
		var selector  = '['+nsStyle+'='+namespace+']';
		var css       = component.stylesheet();
		var output    = stylis(selector, css, true, true);
	
		if (browser && inject) {
			// obscure namesapce to avoid id/global namespace conflicts
			var id = '\''+namespace+'\'';
	
			// prevent duplicate styles, this also works with SSR
			if (document.getElementById(id) == null) {			
				var style = document.createElement('style');
				
				style.textContent = output;
				style.id = id;
	
				document.head.appendChild(style);
			}
		}
	
		/**
		 * decorator
		 * 
		 * @param  {?Node} DOMNode
		 * @return {(undefined|string)}
		 */
		function decorator (DOMNode) {
			if (DOMNode === null) {
				return output;			
			} else {
				DOMNode.setAttribute(nsStyle, namespace);
			}
		}
	
		decorator.CSSNamespace = namespace;
	
		// replace stylesheet method for all instances with the style constructor `decorator`
		return component.stylesheet = constructor.prototype.stylesheet = decorator;
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
	
	    // [ attr selector
	    if (type === 91) {
	        // `[data-id=namespace]` -> ['data-id', 'namespace']
	        var attr = selector.substring(1, selector.length-1).split('=');     
	        var char = (id = attr[1]).charCodeAt(0);
	
	        // [data-id="namespace"]/[data-id='namespace']
	        // --> "namespace"/'namspace' -> namespace
	        if (char === 34 || char === 39) {
	            id = id.substring(1, id.length-1);
	        }
	
	        prefix = '['+ attr[0] + '=\'' + id +'\']';
	    }
	    // `#` `.` `>` id class and descendant selectors
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
	    var prev    = '';
	    var flat    = '';
	
	    var len     = styles.length;
	
	    var i       = 0;
	    var special = 0;
	    var type    = 0;
	    var close   = 0;
	    var comment = 0;
	    var depth   = 0;
	
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
	
	            // default to 0 instead of NaN if there is no second character
	            var second = line.charCodeAt(1) || 0;
	
	            // ignore comments
	            if (comment === 2) {
	                line = ''; comment = 0;
	            }
	            // @, special block
	            else if (first === 64) {
	                // @keyframe/@global, `k` or @global, `g` character
	                if (second === 107 || second === 103) {
	                    // k, @keyframes
	                    if (second === 107) {
	                        blob = line.substring(1, 11) + keyframeNs + line.substring(11);
	                        line = '@-webkit-'+blob;
	                        type = 1;
	                    }
	                    // g, @global 
	                    else {
	                        line = '';
	                    }
	                }
	                // @media `m` character
	                else if (second === 109) {
	                    type = 2;
	                }
	
	                special++;
	            }
	            else {
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
	                    depth++;
	
	                    if (special === 0 || type === 2) {
	                        // nested selector
	                        if (depth === 2) {
	                            // discard first character {
	                            i++;
	
	                            // inner content of block
	                            var inner   = '';
	                            var nestSel = line.substring(0, line.length-1).split(',');
	                            var prevSel = prev.substring(0, prev.length-1).split(',');
	
	                            // keep track of opening `{` and `}` occurrences
	                            var counter = 1;
	
	                            // travel to the end of the block
	                            while (i < len) {
	                                var char = styles.charCodeAt(i);
	                                // {, }, nested blocks may have nested blocks
	                                char === 123 ? counter++ : char === 125 && counter--;
	                                // break when the block has ended
	                                if (counter === 0) break;
	                                // build content of nested block
	                                inner += styles[i++];
	                            }
	
	                            // handle multiple selectors: h1, h2 { div, h4 {} } should generate
	                            // -> h1 div, h2 div, h2 h4, h2 div {}
	                            for (var j = 0, length = prevSel.length; j < length; j++) {
	                                // extract value, prep index for reuse
	                                var val = prevSel[j]; prevSel[j] = '';
	                                // since there could also be multiple nested selectors
	                                for (var k = 0, l = nestSel.length; k < l; k++) {
	                                    prevSel[j] += (
	                                        (val.replace(prefix, '').trim() + ' ' + nestSel[k].trim()).trim() + 
	                                        (k === l-1  ? '' : ',')
	                                    );
	                                }
	                            }
	
	                            // create block and update styles length
	                            len += (styles += (prevSel.join(',') + '{'+inner+'}').replace(/&| +&/g, '')).length;
	
	                            // clear current line, to avoid add block elements to the normal flow
	                            line = '';
	
	                            // decreament depth
	                            depth--;
	                        }
	                        // top-level selector
	                        else {
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
	
	                                // [, [title="a,b,..."]
	                                if (firstChar === 91) {
	                                    for (var k = j+1, l = length-j; k < l; k++) {
	                                        var broken = (selector += ',' + split[k]).trim();
	
	                                        // ]
	                                        if (broken.charCodeAt(broken.length-1) === 93) {
	                                            length -= k;
	                                            split.splice(j, k);
	                                            break;
	                                        }
	                                    }
	                                }
	
	                                // &
	                                if (firstChar === 38) {
	                                    // before: & {
	                                    selector = prefix + selector.substring(1);
	                                    // after: ${prefix} {
	                                }
	                                // : 
	                                else if (firstChar === 58) {
	                                    var secondChar = selector.charCodeAt(1);
	
	                                    // h, t, :host 
	                                    if (secondChar === 104 && selector.charCodeAt(4) === 116) {
	                                        var nextChar = (selector = selector.substring(5)).charCodeAt(0);
	                                        
	                                        // :host(selector)                                                 
	                                        if (nextChar === 40) {
	                                            // before: `(selector)`
	                                            selector = prefix + selector.substring(1).replace(')', '');
	                                            // after: ${prefx} selector {
	                                        } 
	                                        // :host-context(selector)
	                                        else if (nextChar === 45) {
	                                            // before: `-context(selector)`
	                                            selector = selector.substring(9, selector.indexOf(')')) + ' ' + prefix + ' {';
	                                            // after: selector ${prefix} {
	                                        }
	                                        // :host
	                                        else {
	                                            selector = prefix + selector;
	                                        }
	                                    }
	                                    // g, :global(selector)
	                                    else if (secondChar === 103) {
	                                        // before: `:global(selector)`
	                                        selector = selector.substring(8).replace(')', '');
	                                        // after: selector
	                                    }
	                                    // :hover, :active, :focus, etc...
	                                    else {
	                                        selector = prefix + selector;
	                                    }
	                                }
	                                else {
	                                    selector = prefix + ' ' + selector;
	                                }
	
	                                // if first selector do not prefix with `,`
	                                build += j === 0 ? selector : ',' + selector;
	                            }
	
	                            prev = line = build;
	                        }
	                    }
	                }
	                // } character
	                else if (code === 125 && depth !== 0) {
	                    depth--;
	                }
	                
	                // @global/@keyframes
	                if (special !== 0) {
	                    // find the closing tag
	                    code === 125 ? close++ : (code === 123 && close !== 0 && close--);
	
	                    // closing tag
	                    if (close === 2) {
	                        // @global
	                        if (type === 0) {
	                            line = '';
	                        }
	                        // @keyframes 
	                        else if (type === 1) {
	                            // vendor prefix
	                            line = '}@'+blob+'}';
	                            // reset blob
	                            blob = '';
	                        }
	                        // @media
	                        else if (type === 2) {
	                            blob.length !== 0 && (line = prefix + ' {'+blob+'}' + line);
	                            // reset blob
	                            blob = '';
	                        }
	
	                        // reset flags
	                        type = 0; close--; special--;
	                    }
	                    // @keyframes 
	                    else if (type === 1) {
	                        blob += line;
	                    }
	                    // @media flat context
	                    else if (type === 2 && depth === 0 && code !== 125) {
	                        blob += line; line = '';
	                    }
	                }
	                // flat context
	                else if (depth === 0 && code !== 125) {
	                    flat += line; line = '';
	                }
	            }
	
	            // add line to output, reset line buffer and comment signal
	            output += line; line = ''; comment = 0;
	        }
	        // build line by line
	        else {
	            // \r, \n, ignore line and block comments
	            if (comment === 2 && (code === 13 || code === 10)) {
	                line = ''; comment = 0;
	            }
	            // not `\t`, `\r`, `\n` characters
	            else if (code !== 9 && code !== 13 && code !== 10) {
	                // / line comment signal
	                code === 47 && comment < 2 && comment++;
	
	                // build line buffer
	                line += styles[i];
	            }
	        }
	
	        // next character
	        i++; 
	    }
	
	    // if there is flat css, append
	    return output + (flat.length === 0 ? '' : prefix + ' {' + flat + '}');
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * element
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * create virtual element
	 *
	 * @public
	 * 
	 * @param  {(string|function|Component)} type
	 * @param  {Object<string, any>=}        props
	 * @param  {...any=}                     children
	 * @return {Object<string, any>}
	 */
	function createElement (type, props) {
		var length   = arguments.length;
		var children = [];
		var position = 2;
	
		// if props is not a normal object
		if (props == null || props.nodeType !== void 0 || props.constructor !== Object) {
			// update position if props !== null
			if (props !== null) {
				props = null;
				position = 1; 
			}
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
		} 
		else if (type === '@') {
			return VFragment(children);
		} 
		else {
			if (props === null) {
				props = {};
			}
	
			// if props.xmlns is undefined and type === 'svg' or 'math' 
			// assign svg && math namespaces to props.xmlns
			if (props.xmlns === void 0) {	
				if (type === 'svg') { 
					props.xmlns = nsSvg; 
				} else if (type === 'math') { 
					props.xmlns = nsMath; 
				}
			}
	
			return VElement(type, props, children);
		}
	}
	
	
	/**
	 * create virtual child node
	 * 
	 * @param  {*}       child
	 * @param  {VNode[]} children
	 * @param  {number}  index
	 * @return {number}  index
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
					children[index++] = VComponent(child, null, null);
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
		}
	
		return index;
	}
	
	
	/**
	 * clone and return an element having the original element's props
	 * with new props merged in shallowly and new children replacing existing ones.
	 *
	 * @public
	 * 
	 * @param  {VNode}                subject
	 * @param  {Object<string, any>=} newProps
	 * @param  {any[]=}               newChildren
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
				var index = 0;
				
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
	 * clone virtual node
	 * 
	 * @param  {VNode} subject
	 * @return {VNode}
	 */
	function cloneNode (subject) {
		return VNode(
			subject.nodeType,
			subject.type,
			subject.props,
			subject.children,
			subject.DOMNode,
			null,
			null
		);
	}
	
	
	/**
	 * create element factory
	 * 
	 * @param  {string}              type
	 * @param  {Object<string, any>} props
	 * @return {createElement(?Object<string>, ...any=)}
	 */
	function createFactory (type, props) {
		return props ? createElement.bind(null, type, props) : createElement.bind(null, type);
	}
	/**
	 * is valid element
	 *
	 * @public
	 * 
	 * @param  {any} subject
	 * @return {boolean}
	 */
	function isValidElement (subject) {
		return subject != null && subject.nodeType != null;
	}
	
	
	/**
	 * DOM factory, create VNode factories
	 *
	 * @public
	 * 
	 * @param  {string[]}                 types
	 * @return {Object<string, function>} elements
	 */
	function DOM (types) {
		var elements = {};
	
		// add element factories
		for (var i = 0, length = types.length; i < length; i++) {
			elements[types[i]] = VElement.bind(null, types[i]);
		}
		
		// if svg, add related svg element factories
		elements.svg !== void 0 && (elements.svg = VSvg.bind(null, 'svg'));
	
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
	 * @public
	 * 
	 * @param {Object}                    newState
	 * @param {function(this:Component)=} callback
	 */
	function setState (newState, callback) {
		// exist early if shouldComponentUpdate exists and returns false
		if (this.shouldComponentUpdate !== void 0 && this.shouldComponentUpdate(this.props, newState) === false) {
			return;
		}
	
		// update state
		updateState(this.state, newState);
	
		// update component
		this.forceUpdate(callback || null);
	}
	
	
	/**
	 * update state, hoisted to avoid `for in` deopts
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
	 * force an update
	 *
	 * @public
	 * 
	 * @param  {function(this:Component)=} callback
	 */
	function forceUpdate (callback) {
		if (this.componentWillUpdate !== void 0) {
			this.componentWillUpdate(this.props, this.state);
		}
	
		var newNode = extractRender(this);
		var oldNode = this.VNode;
	
		// component returns a different root node
		if (newNode.type !== oldNode.type) {		
			// replace node
			replaceNode(newNode, oldNode, oldNode.DOMNode.parentNode, createNode(newNode, null, null));
	
			// hydrate newNode
			oldNode.nodeType = newNode.nodeType;
			oldNode.type     = newNode.type;
			oldNode.props    = newNode.props;
			oldNode.children = newNode.children;
			oldNode.DOMNode  = newNode.DOMNode;
			newNode.instance = oldNode.instance;
		} else {
			// patch node
			patchNodes(newNode, oldNode, newNode.nodeType, oldNode.nodeType);
		}
	
		if (this.componentDidUpdate !== void 0) {
			this.componentDidUpdate(this.props, this.state);
		}
	
		// if callback function call with the component as `this` context
		if (callback != null && typeof callback === 'function') {
			callback.call(this);
		}
	}
	
	
	/**
	 * Component class
	 *
	 * @public
	 * 
	 * @param {Object<string, any>=} props
	 */
	function Component (props) {
		// initial props
		if (this.getInitialProps !== void 0) {
			this.props = this.getInitialProps(props) || {};
		}
		// assign props
		else if (props !== objEmpty) {
			// hydrate default props
			if (this.getDefaultProps !== void 0) {
				assignDefaultProps(this.getDefaultProps(), props);
			}
			
			if (this.componentWillReceiveProps !== void 0) {
				this.componentWillReceiveProps(props);
			}
	
			this.props = props;
		} 
		// default props
		else {
			this.props = this.props || (this.getDefaultProps && this.getDefaultProps()) || {};
		}
	
		// assign state
		this.state = this.state || (this.getInitialState && this.getInitialState()) || {};
	
		// VNode and refs
		this.refs = this.VNode = null;
	}
	
	
	/**
	 * Component prototype
	 * 
	 * @type {Object<string, function>}
	 */
	Component.prototype = Object.create(null, {
		setState:    { value: setState },
		forceUpdate: { value: forceUpdate }
	});
	
	
	/**
	 * create class
	 *
	 * @public
	 * 
	 * @param  {(Object<string, any>|function(createElement): (Object<string, any>|function))} subject
	 * @return {function(new:Component, Object<string, any>)}
	 */
	function createClass (subject) {
		// component cache
		if (subject.COMPCache !== void 0) {
			return subject.COMPCache;
		}
	
		// is function?
		var func = typeof subject === 'function';
	
		// extract shape of component
		var shape = func ? subject(createElement) : subject;
		var constructor = false;
		var render;
	
		if (shape.nodeType !== void 0 || typeof shape === 'function') {
			// render function
			render = shape.nodeType !== void 0 ? subject : shape;
			shape = { render: render };
		}
		else {
			// register that the shape has a constructor method
			constructor = shape.hasOwnProperty('constructor');
		}
	
		// create component class
		function component (props) {
			// constructor
			if (constructor) {
				this.constructor(props);
			}
	
			// extend Component
			Component.call(this, props); 
		}
	
		// inherit shape properties
		component.prototype = shape;
	
		// inherit Component methods
		shape.setState = Component.prototype.setState;
		shape.forceUpdate = Component.prototype.forceUpdate;
	
		// function shape, cache component
		if (func) {
			subject.COMPCache = component;
		}
	
		// stylesheet namespaced
		if (shape.stylesheet !== void 0) {
			// function name / displayName / random string
			shape.displayName = (func ? subject.name : shape.displayName) || ((Math.random()+1).toString(36).substr(2, 5));
		}
	
		return (component.constructor = Component, component);
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * render
	 * 
	 * ---------------------------------------------------------------------------------
	 */
		
	
	/**
	 * render
	 *
	 * @public
	 * 
	 * @param  {(Component|VNode|function|Object<string, any>)} subject
	 * @param  {(Node|string)=}                                 target
	 * @param  {function(this:Component, Node)=}                callback
	 * @param  {boolean=}                                       hydration
	 * @return {function(Object=)}
	 */
	function render (subject, target, callback, hydration) {
		var initial = true;
		var component;	
		var vnode;
		var element;
		
		// renderer
		function renderer (props) {
			if (initial) {
				// dispatch mount
				appendNode(vnode, element, createNode(vnode, null, null));
	
				// register mount has been dispatched
				initial = false;
	
				// assign component instance
				component = vnode.instance;
			} else {
				// update props
				if (props !== void 0) {
					if (component.shouldComponentUpdate !== void 0 && 
						component.shouldComponentUpdate(props, component.state) === false
					) {
						return renderer;
					}
	
					component.props = props;
				}
	
				// update component
				component.forceUpdate(null);
			}
	
			return renderer;
		}
	
		// exit early
		if (server) {
			return renderer;
		}
	
		// Object
		if (subject.render !== void 0) {
			vnode = VComponent(createClass(subject));
		}
		// array/Component/function
		else if (subject.nodeType === void 0) {
			vnode = subject.constructor === Array ? createElement('@', null, subject) : VComponent(subject);
		} 
		// VElement/VSvg
		else if (subject.nodeType !== 2) {
			vnode = VComponent(createClass({ render: function () { return subject; } }))
		}
		// VComponent
		else {
			vnode = subject;
		}
	
		// dom element
	  	if (target != null && target.nodeType != null) {
	  		// target is a dom element
	  		element = target === document ? docuemnt.body : target;
		} else {
	  		// selector
	  		target = document.querySelector(target);
	
	  		// default to document.body if no match/document
	  		element = (target === null || target === document) ? document.body : target;
		}
	
		// hydration
		if (hydration === true) {
			// dispatch hydration
			hydrate(element, vnode, 0, nodEmpty, null);
	
			// register mount has been dispatched
			initial = false;
	
			// assign component
			component = vnode.instance;
		} else {
			// destructive mount
			hydration === false && (element.textContent = '');
			
			renderer();
		}
	
		// if present call root components context, passing root node as argument
		if (callback && typeof callback === 'function') {
			callback.call(component, vnode.DOMNode || target);
		}
	
		return renderer;
	}
	
	
	/**
	 * shallow render
	 *
	 * @public
	 * 
	 * @param  {(VNode|Component|function)}
	 * @return {VNode}
	 */
	function shallow (subject) {
		if (isValidElement(subject)) {
			return subject.nodeType === 2 ? extractComponent(subject) : subject;
		} else {
			return extractComponent(createElement(subject, null, null));
		}
	}
	
	
	/**
	 * refs
	 *
	 * @param {(string|function(Node))} ref
	 * @param {Component}               component
	 * @param {Node}                    element
	 */
	function refs (ref, component, element) {
		if (typeof ref === 'function') {
			ref.call(component, element);
		} else {
			(component.refs = component.refs || {})[ref] = element;
		}
	}
	
	
	/**
	 * patch keyed nodes
	 *
	 * @param {Object<string, any>[2]} keys
	 * @param {Node}                   parentNode
	 * @param {VNode}                  newNode
	 * @param {VNode}                  oldNode
	 * @param {number}                 newLen
	 * @param {number}                 oldLen
	 * @param {number}                 pos
	 */
	function patchKeys (keys, parentNode, newNode, oldNode, newLen, oldLen, pos) {
		var reconciled = new Array(newLen);
		var childNodes = parentNode.childNodes;
	
		// children
		var newChildren = newNode.children;
		var oldChildren = oldNode.children;
	
		var length = oldChildren.length;
	
		// keys
		var newKeys = keys[0];
		var oldKeys = keys[1];
	
		// book keeping
		var delOffset = 0;
		var addOffset = 0;
	
		// hydrate clean nodes
		if (pos !== 0) {
			for (var i = 0; i < pos; i++) {
				reconciled[i] = oldChildren[i];
			}
		}
	
		// old children
		for (var i = pos; i < oldLen; i++) {
			var oldChild = oldChildren[i];
			var newChild = newKeys[oldChild.props.key];
	
			// removed
			if (newChild === void 0) {
				// book keeping
				delOffset++;
	
				removeNode(oldChild, parentNode);
			}
	
			// update old indexes
			if (delOffset !== 0) {
				oldChild.index -= delOffset;
			}
		}
	
		// update length
		length -= delOffset;
	
		// new children
		for (var i = pos; i < newLen; i++) {
			var newChild = newChildren[i];
			var oldChild = oldKeys[newChild.props.key];
	
			// exists
			if (oldChild !== void 0) {
				var index = oldChild.index;
	
				// moved
				if (index+addOffset !== i) {
					parentNode.insertBefore(childNodes[index], childNodes[i]);
				}
	
				// assign clean node
				reconciled[i] = oldChild;
			} else {
				if (i < length) {
					// insert
					insertNode(newChild, childNodes[i], parentNode, createNode(newChild, null, null));
				} else {
					// append
					appendNode(newChild, parentNode, createNode(newChild, null, null));
				}
	
				// book keeping
				addOffset++; 
				length++;
	
				// assign clean node
				reconciled[i] = newChild;
			}	
		}
	
		// replace dirty children
		oldNode.children = reconciled;
	}
	
	
	/**
	 * patch nodes
	 *  
	 * @param  {VNode}   newNode  
	 * @param  {VNode}   oldNode 
	 * @param  {number}  newNodeType 
	 * @param  {number}  oldNodeType
	 */
	function patchNodes (newNode, oldNode, newNodeType, oldNodeType) {
		// if newNode and oldNode are the identical, exit early
		if (newNode === oldNode) {
			return;
		}
	
		// extract node from possible component node
		var currentNode = newNodeType === 2 ? extractComponent(newNode) : newNode;
	
		// a component
		if (oldNodeType === 2) {
			// retrieve components
			var oldComp = oldNode.instance;
			var newComp = newNode.instance;
	
			// retrieve props
			var newProps = newComp.props;
			var newState = newComp.state;
	
			// component with shouldComponentUpdate
			if (oldComp.shouldComponentUpdate !== void 0 && oldComp.shouldComponentUpdate(newProps, newState) === false) {
				// exit early
				return;
			}
	
			// component with componentWillUpdate
			if (oldComp.componentWillUpdate !== void 0) {
				oldComp.componentWillUpdate(newProps, newState);
			}
		}
	
		// children
		var newChildren = currentNode.children;
		var oldChildren = oldNode.children;
	
		// children length
		var newLen = newChildren.length;
		var oldLen = oldChildren.length;
	
		// new children length is 0, remove all children
		if (newLen === 0) {
			// but only if old children is not already cleared
			if (oldLen !== 0) {
				oldNode.DOMNode.textContent = '';
				oldNode.children = newChildren;
			}
		} else {
			// new node has children
			var parentNode = oldNode.DOMNode;
	
			// when keyed, the position that dirty keys begin
			var pos = 0;
	
			// non-keyed until the first dirty key is found
			var keyed = false;
	
			// un-initialized key hash maps
			var oldKeys;
			var newKeys;
	
			// the highest point of interest
			var length = newLen > oldLen ? newLen : oldLen;
	
			// for loop, the end point being which ever is the 
			// greater value between new length and old length
			for (var i = 0; i < length; i++) {
				var newChild = newChildren[i] || nodEmpty;
				var oldChild = oldChildren[i] || nodEmpty;
	
				var newType = newChild.nodeType;
				var oldType = oldChild.nodeType;
	
				if (keyed) {
					// push keys
					if (newType !== 0) newKeys[newChild.props.key] = (newChild.index = i, newChild);
					if (oldType !== 0) oldKeys[oldChild.props.key] = (oldChild.index = i, oldChild);
				}
				// remove
				else if (newType === 0) {
					removeNode(oldChildren.pop(), parentNode);
				}
				// add
				else if (oldType === 0) {
					appendNode(oldChildren[oldChildren.length] = newChild, parentNode, createNode(newChild, null, null));
				}
				// text
				else if (newType === 3 && oldType === 3) {
					if (newChild.children !== oldChild.children) {
						oldChild.DOMNode.nodeValue = oldChild.children = newChild.children;
					}
				}
				// key
				else if (newChild.props.key !== oldChild.props.key) {
					keyed = true; 
					pos = i;
					oldKeys = {}; 
					newKeys = {}; 
	
					// push keys
					newKeys[newChild.props.key] = (newChild.index = i, newChild);
					oldKeys[oldChild.props.key] = (oldChild.index = i, oldChild);
				}
				// replace
				else if (newChild.type !== oldChild.type) {
					replaceNode(oldChildren[i] = newChild, oldChild, parentNode, createNode(newChild, null, null));
				}
				// noop
				else {
					patchNodes(newChild, oldChild, newType, oldType);
				}
			}
	
			// reconcile keyed children
			if (keyed) {
				patchKeys([newKeys, oldKeys], parentNode, newNode, oldNode, newLen, oldLen, pos);
			}
		}
	
		// patch props only if oldNode is not a textNode 
		// and the props objects of the two nodes are not equal
		if (currentNode.props !== oldNode.props) {
			patchProps(currentNode, oldNode);
		}
	
		// component with componentDidUpdate
		if (oldNodeType === 2 && oldComp.componentDidUpdate !== void 0) {
			oldComp.componentDidUpdate(newProps, newState);
		}
	}
	
	
	/**
	 * assign prop for create element
	 * 
	 * @param  {Node}       target
	 * @param  {Object}     props
	 * @param  {boolean}    onlyEvents
	 * @param  {Component}  component
	 */
	function assignProps (target, props, onlyEvents, component) {
		for (var name in props) {
			assignProp(target, name, props, onlyEvents, component);
		}
	}
	
	
	/**
	 * assign prop for create element
	 * 
	 * @param  {Node}       target
	 * @param  {string}     name
	 * @param  {Object}     props
	 * @param  {boolean}    onlyEvents,
	 * @param  {Component}  component
	 */
	function assignProp (target, name, props, onlyEvents, component) {
		if (isEventName(name)) {
			addEventListener(target, extractEventName(name), props[name], component);
		} else if (onlyEvents === false) {
			// add attribute
			updateProp(target, 'setAttribute', name, props[name], props.xmlns);
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
			var target = oldNode.DOMNode;
	
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
	 * @param  {Array[]} diff
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
	 * @param  {any}    propValue
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
	
		var isSVG = false;
		var propName;
	
		// normalize class/className references, i.e svg className !== html className
		// uses className instead of class for html elements
		if (namespace === nsSvg) {
			isSVG = true;
			propName = name === 'className' ? 'class' : name;
		} else {
			propName = name === 'class' ? 'className' : name;
		}
	
		var targetProp = target[propName];
		var isDefinedValue = propValue != null && propValue !== false;
	
		// objects, adds property if undefined, else, updates each memeber of attribute object
		if (isDefinedValue && typeof propValue === 'object') {
			targetProp === void 0 ? target[propName] = propValue : updatePropObject(propValue, targetProp);
		} else {
			if (targetProp !== void 0 && isSVG === false) {
				target[propName] = propValue;
			} else {
				if (isDefinedValue) {
					// reduce value to an empty string if true, <tag checked=true> --> <tag checked>
					if (propValue === true) { 
						propValue = ''; 
					}
	
					target[action](propName, propValue);
				} else {
					// remove attributes with false/null/undefined values
					target.removeAttribute(propName);
				}
			}
		}
	}
	
	
	/**
	 * update prop objects, i.e .style
	 * 
	 * @param  {Object} value
	 * @param  {any}    targetAttr
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
	 * create node
	 * 
	 * @param  {VNode}      subject
	 * @param  {?Component} component
	 * @param  {?string}    namespace
	 * @return {Node}
	 */
	function createNode (subject, component, namespace) {
		var nodeType = subject.nodeType;
		
		// textNode	
		if (nodeType === 3) {
			return subject.DOMNode = document.createTextNode(subject.children);
		}
	
		// hoisted, clone DOMNode, second check ensures fragments are not cloned
		if (subject.DOMNode !== null && subject.DOMNode.isFragment !== true) {
			return subject.DOMNode = subject.DOMNode.cloneNode(true);
		}
	
		// create
		var newNode  = nodeType === 2 ? extractComponent(subject) : subject;
		var type     = newNode.type;
		var children = newNode.children;
		var props    = newNode.props;
		var length   = children.length;
		var element;
	
		// update nodeType
		nodeType = newNode.nodeType;
	
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
			if (nodeType !== 11) {
				element = document.createElement(type);				
			} else {
				element = document.createDocumentFragment();
	
				// accessing any dom property i.e nodeType to check if a node is a fragment
				// is slower ~(50mil vs 800mil) than accessing a non-existent or added property
				element.isFragment = true;
			}
		}
	
		// has a component instance
		if (subject.instance !== null) {
			// hydrate component instance, 
			// this travels through the tree until we find another component to hydrate
			// which allows use to call ref functions under the context of the component they are within
			// and assign string refs to their parent components
			(component = subject.instance).VNode.DOMNode = element;
	
			// stylesheets
			if (component.stylesheet !== void 0 && nodeType !== 11) {
				if (component.stylesheet.CSSNamespace === void 0) {
					// create
					stylesheet(component, subject.type.COMPCache || subject.type, true)(element);
				} else {
					// namespace
					component.stylesheet(element);
				}
			}
		}
	
		// has children
		if (length !== 0) {
			// append children
			for (var i = 0; i < length; i++) {
				var newChild = children[i];
	
				// hoisted, clone VNode
				if (newChild.DOMNode !== null) {
					newChild = children[i] = cloneNode(newChild);
				}
	
				// append child
				appendNode(newChild, element, createNode(newChild, component, namespace));					
			}
		}
	
		// props is not an empty object
		if (props !== objEmpty) {
			// refs
			if (props.ref !== void 0) {
				refs(props.ref, component, element);
			}
	
			// props and events
			assignProps(element, props, false, component);
		}
	
		// cache element reference
		return subject.DOMNode = element;
	}
	
	
	/**
	 * append node
	 *
	 * @param {VNode} newNode
	 * @param {Node}  parentNode
	 * @param {Node}  nextNode
	 */
	function appendNode (newNode, parentNode, nextNode) {
		if (newNode.instance !== null && newNode.instance.componentWillMount) {
			newNode.instance.componentWillMount(nextNode);
		}
	
		// append DOMNode
		parentNode.appendChild(nextNode);
	
		if (newNode.instance !== null && newNode.instance.componentDidMount) {
			newNode.instance.componentDidMount(nextNode);
		}
	}
	
	
	/**
	 * insert node
	 *
	 * @param {VNode} newNode
	 * @param {Node}  oldNode
	 * @param {Node}  parentNode
	 * @param {Node}  nextNode
	 */
	function insertNode (newNode, oldNode, parentNode, nextNode) {
		if (newNode.instance !== null && newNode.instance.componentWillMount) {
			newNode.instance.componentWillMount(nextNode);
		}
	
		// insert DOMNode
		parentNode.insertBefore(nextNode, oldNode);
	
		if (newNode.instance !== null && newNode.instance.componentDidMount) {
			newNode.instance.componentDidMount(nextNode);
		}
	}
	
	
	/**
	 * remove node
	 *
	 * @param {VNode} oldNode
	 * @param {Node}  parentNode
	 */
	function removeNode (oldNode, parentNode) {
		if (oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
			oldNode.instance.componentWillUnmount(oldNode.DOMNode);
		}
	
		// remove DOMNode
		parentNode.removeChild(oldNode.DOMNode);
	
		// clear references
		oldNode.DOMNode = null;
	}
	
	
	/**
	 * replace node
	 *
	 * @param {VNode} newNode
	 * @param {VNode} oldNode
	 * @param {Node}  parentNode 
	 * @param {Node}  nextNode
	 */
	function replaceNode (newNode, oldNode, parentNode, nextNode) {
		if (oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
			oldNode.instance.componentWillUnmount(oldNode.DOMNode);
		}
	
		if (newNode.instance !== null && newNode.instance.componentWillMount) {
			newNode.instance.componentWillMount(nextNode);
		}
	
		// replace DOMNode
		parentNode.replaceChild(nextNode, oldNode.DOMNode);
		
		if (newNode.instance !== null && newNode.instance.componentDidMount) {
			newNode.instance.componentDidMount(nextNode);
		}
	
		// clear references
		oldNode.DOMNode = null;
	}
	
	
	/**
	 * add event listener
	 *
	 * @param {Node}      element
	 * @param {string}    name
	 * @param {function}  listener
	 * @param {Component} component
	 */
	function addEventListener (element, name, listener, component) {
		if (typeof listener !== 'function') {
			element.addEventListener(name, bindEvent(name, listener, component));
		} else {
			element.addEventListener(name, listener);
		}
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
	 * @param  {string} name
	 * @return {boolean}
	 */
	function isEventName (name) {
		return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 3;
	}
	
	
	/**
	 * bind event
	 *
	 * @param  {string}              name
	 * @param  {Object<string, any>} value
	 * @param  {Component}           component
	 * @return {function}
	 */
	function bindEvent (name, value, component) {
		var bind = value.bind;
		var data = value.with;
	
		var preventDefault = value.preventDefault === void 0 || value.preventDefault === true;
	
		if (typeof bind === 'object') {
			var property = bind.property || data;
	
			return function (event) {
				var target = event.currentTarget || event.target;
				var value  = data in target ? target[data] : target.getAttribute(data);
	
				preventDefault && event.preventDefault();
	
				// update component state
				component.state[property] = value;
	
				// update component
				component.forceUpdate();
			}
		} else {
			return function (event) {
				preventDefault && event.preventDefault();
				bind.call(data, data, event);
			}
		}
	}
	
	
	/**
	 * extract component
	 * 
	 * @param  {VNode} subject
	 * @return {VNode} 
	 */
	function extractComponent (subject) {
		/** @type {Component} */
		var owner;
	
		/** @type {(Component|function(new:Component, Object<string, any>))} */
		var type = subject.type;
	
		/** @type {Object<string, any>} */
		var props = subject.props;
	
		// default props
		if (type.defaultProps !== void 0) {
			// clone default props if props is not an empty object, else use defaultProps as props
			props !== objEmpty ? assignDefaultProps(type.defaultProps, props) : (props = type.defaultProps);
		}
	
		// assign children to props if not empty
		if (subject.children.length !== 0) {
			// prevents mutating the empty object constant
			if (props === objEmpty) {
				props = { children: subject.children };
			}
			else {
				props.children = subject.children;			
			}
		}
		
		// cached component
		if (type.COMPCache !== void 0) {
			owner = type.COMPCache;
		} 
		// function components
		else if (type.constructor === Function && (type.prototype === void 0 || type.prototype.render === void 0)) {
			// create component
			owner = createClass(type);
		}
		// class / createClass components
		else {
			owner = type;
		}
	
		// create component instance
		var component = subject.instance = new owner(props);
		
		// retrieve vnode
		var vnode = extractRender(component);
	
		// if keyed, assign key to vnode
		if (props.key !== void 0 && vnode.props.key === void 0) {
			vnode.props.key = props.key;
		}
	
		// if render returns a component, extract that component
		if (vnode.nodeType === 2) {
			vnode = extractComponent(vnode);
		}
	
		// replace props and children
		subject.props    = vnode.props
		subject.children = vnode.children;
	
		// assign reference to component and return vnode
		return component.VNode = vnode;
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
		return vnode.nodeType !== void 0 ? vnode : createElement('@', null, vnode);
	}
	
	
	/**
	 * assign default props
	 * 
	 * @param  {Object<string, any>} defaultProps
	 */
	function assignDefaultProps (defaultProps, props) {
		for (var name in defaultProps) {
			props[name] = props[name] || defaultProps[name];
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
		// version
		version:          version,

		// alias
		h:                createElement,

		// elements
		createElement:    createElement,
		isValidElement:   isValidElement,
		cloneElement:     cloneElement,
		createFactory:    createFactory,
		DOM:              DOM,

		// render
		render:           render,
		shallow:          shallow,

		// components
		Component:        Component,
		createClass:      createClass,

		// shapes
		VText:            VText,
		VElement:         VElement,
		VSvg:             VSvg,
		VFragment:        VFragment,
		VComponent:       VComponent
	};
}));