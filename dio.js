/*!
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * Dio is a fast (~8kb) Virtual DOM framework
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
var version      = '4.0.0';

// enviroment variables
var document     = window.document || null;
var browser      = document !== null;
var server       = browser === false;

var readable     = server ? require('stream').Readable : null;

// namespaces
var nsStyle      = 'data-scope';
var nsMath       = 'http://www.w3.org/1998/Math/MathML';
var nsXlink      = 'http://www.w3.org/1999/xlink';
var nsSvg        = 'http://www.w3.org/2000/svg';

// empty shapes
var objEmpty     = Object.create(null);
var arrEmpty     = [];
var nodeEmpty    = VNode(0, '', objEmpty, arrEmpty, null, null);

// void elements
var isVoid       = {
	'area':   0, 'base':  0, 'br':   0, '!doctype': 0, 'col':    0, 'embed': 0,
	'wbr':    0, 'track': 0, 'hr':   0, 'img':      0, 'input':  0, 
	'keygen': 0, 'link':  0, 'meta': 0, 'param':    0, 'source': 0
};

// unicode characters
var uniCodes     = {
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;'
};

// regular expressions
var regEsc       = /[<>&"']/g;
var regRoute     = /([:*])(\w+)|([\*])/g;

// random characters
var randomChars  = 'JrIFgLKeEuQUPbhBnWZCTXDtRcxwSzaqijOvfpklYdAoMHmsVNGy';


/**
 * ---------------------------------------------------------------------------------
 * 
 * utilities
 * 
 * ---------------------------------------------------------------------------------
 */


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
 * throw/return error
 * 
 * @param  {string}            message
 * @param  {boolean=}          silent
 * @return {(undefined|Error)}
 */
function panic (message, silent) {
	// create an error object for stack tracing
	var error = new Error(message || '');

	// throw error/return error(silent)
	if (silent) { return error; } else { throw error; }
}


/**
 * try catch helper
 * 
 * @param  {function}  func
 * @param  {function=} onerror
 * @param  {any=}      value
 * @return {any}
 */
function sandbox (func, onerror, value) {
	// hoisted due to V8 not opt'ing functions with try..catch
	try {
		return value ? func(value) : func();
	} catch (err) {
		return onerror && onerror(err);
	}
}


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
 * @param  {Object}   subject
 * @param  {Function} callback
 */
function each (subject, callback) {
	for (var name in subject) {
		callback(subject[name], name, subject);
	}
}


/**
 * defer function
 *
 * defers the execution of a function with predefined arguments
 * and an optional command to preventDefault event behaviour
 * 
 * @param  {function} subject
 * @param  {any[]}    args
 * @param  {boolean}  preventDefault
 * @return {function}
 */
function defer (subject, args, preventDefault) {
	var empty = !args || args.length === 0;

	// return a function that calls `subject` with args as arguments
	return function callback (e) {
		// auto prevent default
		if (preventDefault && e && e.preventDefault) {
			e.preventDefault();
		}

		// defaults to arguments if there are no predefined args
		return subject.apply(this, (empty ? arguments : args));
	}
}


/**
 * composes single-argument functions from right to left. The right most
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function
 *
 * @param  {...function} funcs functions to compose
 * @return {function}          function obtained by composing the argument functions
 * from right to left. for example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function compose () {
	var length = arguments.length;

	// no functions passed
	if (length === 0) {
		return function (a) { return a; }
	} else {
		// list of functions to compose
		var funcs = [];

		// passing arguments to a function i.e [].splice() will prevent this function
		// from getting optimized by the VM, so we manually build the array in-line
		for (var i = 0; i < length; i++) {
			funcs[i] = arguments[i];
		}

		// remove and retrieve last function
		// we will use this for the initial composition
		var lastFunc = funcs.pop();

		// decrement length of funcs array as a reflection of the above
		length--;

		return function () {
			// initial composition
			var output = lastFunc.apply(null, arguments);
				
			// recursively commpose all functions
			while (length--) {
				output = funcs[length](output);
			}

			return output;
		}
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
 * element
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * virtual element node factory
 * 
 * @param  {string} type
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
		_owner: null
	};
}


/**
 * virtual component node factory
 * 
 * @param  {function} type
 * @param  {Object=}  props
 * @param  {any[]=}   children
 * @return {VNode}
 */
function VComponent (type, props, children) {
	return {
		nodeType: 2, 
		type: type, 
		props: (props || type.defaultProps || objEmpty), 
		children: (children || []),
		_node: null,
		_owner: null
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
		_owner: null
	};
}


/**
 * virtual text node factory
 * 
 * @param  {string} text
 * @return {VNode}
 */
function VText (text) {
	return {
		nodeType: 3, 
		type: 'text', 
		props: objEmpty, 
		children: text, 
		_node: null,
		_owner: null
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
		_owner: null
	};
}


/**
 * internal virtual node factory
 * 
 * @param {number}            nodeType
 * @param {(function|string)} type
 * @param {Object}            props
 * @param {VNode[]}           children
 * @param {(Node|null)}       _node
 * @param {Component}         _owner
 */
function VNode (nodeType, type, props, children, _node, _owner) {
	return {
		nodeType: nodeType,
		type: type,
		props: props,
		children: children,
		_node: _node,
		_owner: _owner
	};
}


/**
 * special virtual element types
 *
 * @example h('inpu#id[type=radio]') <-- yields --> h('input', {id: 'id', type: 'radio'})
 *
 * @param  {Object} type
 * @param  {Object} props
 * @param  {Object} element
 */
function parseType (type, props, element) {
	var matches;
	var regEx;
	var classList = [];

	// default type
	element.type = 'div';

	// if undefined, create and cache RegExp
	if (parseVNodeType.regEx === void 0) {
		regEx = parseVNodeType.regEx = new RegExp(
			'(?:(^|#|\\.)([^#\\.\\[\\]]+))|(\\[(.+?)(?:\\s*=\\s*(\"|\'|)((?:\\\\[\"\'\\]]|.)*?)\\5)?\\])',
			'g'
		);
	} else {
		regEx = parseVNodeType.regEx;
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
			element.type = valueMatch;
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
	element.props = props;
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
					var len = child.length;

					// add array child
					for (var j = 0; j < len; j++) {
						children[index++] = createChild(child[j]);
					}
				} else {
					children[index++] = createChild(child);
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
 * create virtual child
 * 
 * @param  {*} child
 */
function createChild (child) {
	if (child != null && child.nodeType !== void 0) {
		// default element
		return child;
	} else if (typeof child === 'function') {
		// component
		return VComponent(child);
	} else {
		// primitives, string, bool, number
		return VText(child);
	}
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
 * create virtual child
 * 
 * @param  {*} child
 */
function createChild (child) {
	if (child != null && child.nodeType !== void 0) {
		// default element
		return child;
	} else if (typeof child === 'function') {
		// component
		return VComponent(child);
	} else {
		// primitives, string, bool, number
		return VText(child);
	}
}


/**
 * clone and return an element having the original element's props
 * with new props merged in shallowly and new children replacing existing ones.
 * 
 * @param  {Object}  subject
 * @param  {Object=} props
 * @param  {any[]=}  children
 * @return {Object}
 */
function cloneElement (subject, newProps, newChildren) {
	var type     = subject.type;
	var props    = newProps || {};
	var children = null;

	// copy props
	each(subject.props, function (value, name) {
		if (props[name] === void 0) {
			props[name] = value;
		}
	});

	if (newChildren !== void 0) {
		var length = newChildren.length;

		// if not empty, copy
		if (length > 0) {
			children = [];

			// copy old children
			for (var i = 0; i < length; i++) {
				children[i] = createChild(newChildren[i]);
			}
		}
	}

	return createElement(type, props, children);
}


/**
 * DOM factory
 * 
 * create references to common dom elements
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
 * component
 * 
 * ---------------------------------------------------------------------------------
 */


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
	if (props) {
		// componentWillReceiveProps lifecycle
		this.componentWillReceiveProps && this.componentWillReceiveProps(props); 
		// assign props
		this.props = props;
	} else {
		this.props = this.props || (this.getDefaultProps && this.getDefaultProps()) || {};
	}

	this.state = this.state || (this.getInitialState && this.getInitialState()) || {};
	this.refs = this._vnode = null;
}


/**
 * component prototype
 * 
 * @type {Object}
 */
Component.prototype = Object.create(null, {
	setState: { value: setState },
	forceUpdate: { value: forceUpdate },
	withAttr: { value: withAttr }
});


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

	// update state
	for (var name in newState) {
		this.state[name] = newState[name];
	}		

	this.forceUpdate();

	// callback, call
	if (callback !== void 0) {
		callback(this.state);
	}
}


/**
 * force an update
 *
 * @return {void}
 */
function forceUpdate () {
	if (this._vnode !== null) {
		// componentWillUpdate lifecycle
		if (this.componentWillUpdate) {
			this.componentWillUpdate(this.props, this.state);
		}

		// patch update
		patch(retrieveRender(this), this._vnode);

		// componentDidUpdate lifecycle
		if (this.componentDidUpdate) {
			this.componentDidUpdate(this.props, this.state);
		}
	}
}


/**
 * withAttr
 * 
 * @param  {(any[]|string)}      props
 * @param  {function[]|function} setters
 * @param  {function=}           callback
 * @return {function=}           
 */
function withAttr (props, setters, callback) {
	var component = this, isarray = typeof props === 'object';

	return function () {
		// array of bindings
		if (isarray) {
			for (var i = 0, length = props.length; i < length; i++) {
				updateAttr(this, props[i], setters[i]);
			}
		} else {
			updateAttr(this, props, setters);
		}

		callback ? callback(component) : component.forceUpdate();
	}
}


/**
 * withAttr(update attribute)
 * 
 * @param  {Node}           target
 * @param  {(string|any[])} prop
 * @param  {function}       setter
 */
function updateAttr (target, prop, setter) {
	var value;

	if (typeof prop === 'string') {
		value = prop in target ? target[prop] : target.getAttribute(prop);

		if (value != null) { 
			setter(value); 
		}
	} else {
		value = prop();
		
		if (value != null) {
			setter in target ? target[setter] = value : target.setAttribute(setter, value);
		}
	}
}


/**
 * create component
 * 
 * @param  {(Object|function)} subject
 * @return {function}
 */
function createClass (subject) {
	// component cache
	if (subject._component) {
		return subject._component;
	}

	var func = typeof subject === 'function';

	var shape = func ? (subject.prototype = Component.prototype, new subject(Component)) : subject;
	var isconstuct = shape.constructor !== Object;

	if (shape.nodeType) {
		var vnode = shape; shape = { render: function () { return vnode; } };
	}
	
	// we want to allow 2 type of function constructors
	// 1. one that returns an object `{...}`
	// 2. one that returns an instance `this[method] = ...`
	if (func && isconstuct) {
		// returns an instance, let the constructor handle binding
		var component = function createClass (props) { Component.call(this, props); };
		component.prototype = shape;
	} else {
		// to avoid mutating Component.prototype we add it to the prototype chain
		var prototype = Object.create(Component.prototype);

		// returns a object
		var component = function createClass (props) { Component.call(this, props), bind(this); }

		var methods = [];
		var length = 0;
		var auto = true;

		var bind = function (ctx) {
			var i = length;

			while (i--) {
				var name = methods[i];

				ctx[name] = ctx[name].bind(ctx);
			}
		}

		each(shape, function (value, name) {
			if (name !== 'statics') {
				prototype[name] = value;

				if (
					auto && typeof 
					value === 'function' &&
					name !== 'render' && 
					name !== 'stylesheet' && 
					name !== 'getInitialState' && 
					name !== 'getDefaultProps' && 
					name !== 'shouldComponentUpdate' &&
					name !== 'componentWillReceiveProps' &&
					name !== 'componentWillUpdate' &&
					name !== 'componentDidUpdate' &&
					name !== 'componentWillMount' &&
					name !== 'componentDidMount' &&
					name !== 'componentWillUnmount'
				) {
					methods[length++] = name;
				}
			}
		});

		component.prototype = prototype;
		prototype.constructor = component;
	}

	if (isconstuct === false) {
		component.constructor = component;
	}

	if (func) {
		subject._component = component;
	}

	if (shape.statics) {
		each(shape.statics, function (value, name) {
			(shape === subject ? component : subject)[name] = value;
		});
	}

	return component;
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
 * @param  {Object}  newNode
 * @param  {number}  index
 * @param  {Object}  parentNode
 */
function hydrate (element, newNode, index, parentNode) {
	var currentNode = newNode.nodeType === 2 ? extractVNode(newNode) : newNode;
	var nodeType = currentNode.nodeType;

	// is a fragment if `newNode` is not a text node and type is fragment signature '@'
	var isFragmentNode = nodeType === 11 ? 1 : 0;
	var newElement = isFragmentNode === 1 ? element : element.childNodes[index];

	// if the node is not a textNode and
	// has children hydrate each of its children
	if (nodeType === 1) {
		var newChildren = currentNode.children;
		var newLength = newChildren.length;

		for (var i = 0; i < newLength; i++) {
			hydrate(newElement, newChildren[i], i, currentNode);
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
			assignRefs(newElement, currentNode.props.ref, currentNode._owner);
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
 * @param  {(function|Object)} subject
 * @param  {Node|string}       target
 * @return {function}
 */
function render (subject, target, callback) {
	// renderer
	function reconciler (props) {
		if (initial) {
			// dispatch mount
			mount(element, node);

			// register mount has been dispatched
			initial = false;

			// assign component
			if (component === null) { 
				component = node._owner;
			}
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

   	var component = null;
   	var node = null;

   	if (subject.render !== void 0) {
   		// create component from object
   		node = VComponent(createClass(subject));
   	} else if (subject.type === void 0) {
   		// normalization
   		if (subject.constructor === Array) {
			// fragment array
   			node = createElement('@', null, subject);	   			
   		} else {
   			node = VComponent(subject);
   		}
   	} else {
   		node = subject;
   	}

   	if (browser === false) {
   		// server-side
   		return renderToString(node);
   	}

	// retrieve mount element
	var element = retrieveMount(target);

	// initial mount registry
	var initial = true;

	// hydration
   	if (element.hasAttribute('hydrate')) {
   		// dispatch hydration
   		hydrate(element, node, 0, nodeEmpty);

   		// cleanup element hydrate attributes
   		element.removeAttribute('hydrate');

   		// register mount has been dispatched
   		initial = false;

   		// assign component
   		if (component === null) {
   			component = node._owner; 
   		}
   	} else {
   		reconciler();
   	}

   	if (typeof callback === 'function') {
   		callback();
   	}

   	return reconciler;
}


/**
 * mount render
 * 
 * @param  {Node}   element
 * @param  {Object} newNode
 * @return {number}
 */
function mount (element, newNode) {
	// clear element
	element.textContent = '';
	// create element
	appendNode(newNode, element, createNode(newNode, null, null));
}


/**
 * retrieve mount element
 * 
 * @param  {*} subject
 * @return {Node}
 */
function retrieveMount (subject) {
	// document not available
	if (subject != null && subject.nodeType != null) {
		return subject;
	}

	var target = document.querySelector(subject);

	// default to document.body if no match/document
	return (target === null || target === document) ? document.body : target;
}


/**
 * extract node
 * 
 * @param  {Object} subject
 * @param  {Object} props
 * @return {Object} 
 */
function extractVNode (subject) {		
	// static node
	if (subject.nodeType !== 2) {
		return subject;
	}

	// possible component class, type
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
	var vnode = retrieveRender(component);

	// if keyed, assign key to vnode
	if (subject.props.key !== void 0 && vnode.props.key === void 0) {
		vnode.props.key = subject.props.key;
	}

	// if render returns a component
	if (vnode.nodeType === 2) {
		vnode = extractVNode(vnode);
	}

	// assign component node
	component._vnode = VNode(
		vnode.nodeType,
		vnode.type,
		subject.props = vnode.props, 
		subject.children = vnode.children,
		null,
		null
	);

	if (type.stylesheet === void 0) {
		type.stylesheet = component.stylesheet !== void 0 ? component.stylesheet : null;
	}

	return vnode;
}


/**
 * retrieve VNode from render function
 *
 * @param  {Object} subject
 * @return {Object}
 */
function retrieveRender (component) {
	// retrieve vnode
	var vnode = component.render(component.props, component.state, component);

	// if vnode, else fragment
	return vnode.nodeType !== void 0 ? vnode : VFragment(vnode);
}


/**
 * patch
 *  
 * @param {Object} newNode  
 * @param {Object} oldNode  
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
		// if _newNode and oldNode are the identical, exit early
		if (newNode !== oldNode) {		
			// extract node from possible component node
			var _newNode = newNodeType === 2 ? extractVNode(newNode) : newNode;

			// component will update
			if (oldNodeType === 2) {
				var component = oldNode._owner;

				if (
					component.shouldComponentUpdate && 
					component.shouldComponentUpdate(newNode.props, newNode._owner.state) === false
				) {
					return 0;
				}

				if (component.componentWillUpdate) {
					component.componentWillUpdate(newNode.props, newNode._owner.state);
				}
			}

			// patch props only if oldNode is not a textNode 
			// and the props objects of the two noeds are not equal
			if (_newNode.props !== oldNode.props) {
				patchProps(_newNode, oldNode); 
			}

			// references, children & children length
			var newChildren = _newNode.children;
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
				var isKeyed    = false;
				var oldKeys    = null;

				// for loop, the end point being which ever is the 
				// greater value between newLength and oldLength
				for (var i = 0; i < newLength || i < oldLength; i++) {

					var newChild = newChildren[i] || nodeEmpty;
					var oldChild = oldChildren[i] || nodeEmpty;
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
								// create padding
								if (oldLength > newLength) {
									// initialize keyed operations
									if (isKeyed === false) { 
										isKeyed = true;
										oldKeys = {}; 
									}

									// create key/node map
									oldKeys[oldChild.props.key] = [oldChild, i];

									// normalize old array, remove old child
									oldChildren.splice(i, 1);

									// remove dom node
									removeNode(oldChild, parentNode);

									// normalize old length
									oldLength--;

									console.log(1, 'keyed replace');
								}
								else {								
									var newKey;
									var moved = oldKeys !== null && oldKeys[newKey = newChild.props.key] !== void 0;

									if (newLength > oldLength) {
										// moved dom node
										if (moved) {
											var oldKeyed = oldKeys[newKey];

											// normalize old array, insert new child
											oldChildren.splice(i, 0, oldKeyed[0]);

											// move dom node
											parentNode.insertBefore(oldKeyed[0]._node, oldChild._node);
										} else {
											// normalize old array, insert new child
											oldChildren.splice(i, 0, newChild);

											// insert dom node
											insertNode(newChild, oldChild, parentNode, createNode(newChild, null, null));
										}

										// normalize old length
										oldLength++;
									} else {
										// TODO
										// moved dom node
										if (moved) {
											var oldKeyed = oldKeys[newKey];

											// normalize old array, move old child
											oldChildren.splice(i, 0, oldChildren.splice(oldKeyed[1], 1)[0]);

											// move dom node
											moveNode(oldChildren[i+1], parentNode, oldKeyed[0]);
										} else {
											// replace dom node, replace old child
											replaceNode(
												oldChildren[i] = newChild, 
												oldChild, 
												parentNode, 
												createNode(newChild, null, null)
											);
										}
									}
								}

								break;
							}
						}
					}
				}
			}

			// component did update
			if (oldNodeType === 2 && component.componentDidUpdate) {
				component.componentDidUpdate(newNode.props, newNode._owner.state);
			}
		}
	}

	return 0;
}


/**
 * handles diff props
 * 
 * @param  {Object} node
 * @param  {number} index
 * @param  {Object} old
 */
function patchProps (newNode, oldNode) {
	var propsDiff = diffProps(newNode.props, oldNode.props, newNode.props.xmlns || '', []);
	var length = propsDiff.length;

	// if diff length > 0 apply diff
	if (length !== 0) {
		var target = oldNode._node;

		for (var i = 0; i < length; i++) {
			var prop = propsDiff[i];
			// [0: action, 1: name, 2: value, namespace]
			updateProp(target, prop[0], prop[1], prop[2], prop[3]);
		}

		oldNode.props = newNode.props;
	}
}


/**
 * collect prop diffs
 * 
 * @param  {Object}  newProps 
 * @param  {Object}  oldProps 
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffProps (newProps, oldProps, namespace, propsDiff) {
	// diff newProps
	for (var newName in newProps) { 
		diffNewProps(newProps, oldProps, newName, namespace, propsDiff); 
	}
	// diff oldProps
	for (var oldName in oldProps) { 
		diffOldProps(newProps, oldName, namespace, propsDiff); 
	}

	return propsDiff;
}


/**
 * diff newProps agains oldProps
 * 
 * @param  {Object}  newProps 
 * @param  {Object}  oldProps 
 * @param  {string}  newName
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffNewProps (newProps, oldProps, newName, namespace, propsDiff) {
	var newValue = newProps[newName];
	var oldValue = oldProps[newName];

	if (newValue != null && oldValue !== newValue) {
		propsDiff[propsDiff.length] = ['setAttribute', newName, newValue, namespace];
	}
}


/**
 * diff oldProps agains newProps
 * 
 * @param  {Object}  newProps 
 * @param  {Object}  oldName 
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffOldProps (newProps, oldName, namespace, propsDiff) {
	var newValue = newProps[oldName];

	if (newValue == null) {
		propsDiff[propsDiff.length] = ['removeAttribute', oldName, '', namespace];
	}
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
 * extract event name from prop
 * 
 * @param  {string} name
 * @return {string}
 */
function extractEventName (name) {
	return name.substring(2).toLowerCase();
}


/**
 * assign refs
 * 
 * @param {Node}      element
 * @param {Object}    refs
 * @param {Component} component
 */
function assignRefs (element, ref, component) {
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
 * ---------------------------------------------------------------------------------
 * 
 * stylesheet
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * stylesheet
 * 
 * @param  {(Node|null)}   element
 * @param  {function}      component
 * @return {(string|void)}
 */
function stylesheet (element, component) {
	var id;
	var css;
	var func = typeof component.stylesheet === 'function';

	// create stylesheet, executed once per component constructor(not instance)
	if (func) {
        // retrieve stylesheet
        var styles = component.stylesheet();
        var name = component.name;

		// generate unique id
		id = name ? name + '-' + random(4) : random(6);

        // compile css
        css = stylis('['+nsStyle+'='+id+']', styles, true, true);

        // re-assign stylesheet to avoid this whole step for future instances
        component.stylesheet = 0;

        // cache the id and css 
        component.id = id;
        component.css = css;
	} else {
		// retrieve cache
		id = component.id;
		css = component.css;
	}

    if (element === null) {
    	// cache for server-side rendering
    	return component.css = '<style id="'+id+'">'+css+'</style>';
    } else {
    	element.setAttribute(nsStyle, id);

    	// create style element and append to head
    	// only when stylesheet is a function
    	// this insures we will only ever excute this once 
    	// since we mutate the .stylesheet property to 0
    	if (func) {
    		// avoid adding a style element when one is already present
            if (document.getElementById(id) == null) { 
	    		var style = document.createElement('style');
	    		
                style.textContent = css;
    			style.id = id;

				document.head.appendChild(style);
    		}
    	}
    }
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
    var type   = selector.charCodeAt(0);

    // [
    if (type === 91) {
        // `[data-id=namespace]` -> ['data-id', 'namespace']
        var attr = selector.substring(1, selector.length-1).split('=');
        // re-build and extract namespace/id
        prefix = '['+ attr[0] + '=' + (id = attr[1]) +']';
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
                flat === 1 && (flat = 0, output.length !== 0 && (output = prefix + '{' + output + '}'));

                // @keyframe/@root, `k` or @root, `r` character
                if (second === 107 || second === 114) {
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
                    flat === 1 && (flat = 0, output.length !== 0 && (output = prefix + '{' + output + '}'));

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
                            } else {
                                selector = prefix + (firstChar === 58 ? '' : ' ') + selector;
                            }

                            build += j === 0 ? selector : ',' + selector;
                        }

                        line = build;
                    }
                }

                // @root/@keyframes
                if (special !== 0) {
                    // find the closing tag
                    if (code === 125) {
                        close++;
                    } else if (code === 123 && close !== 0) {
                        close--;
                    }

                    // closing tag
                    if (close === 2) {
                        // @root
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

    return flat === 1 && output.length !== 0 ? prefix+'{'+output+'}' : output;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * DOM
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * remove element
 *
 * @param  {VNode} oldNode
 * @param  {Node}  parent
 */
function removeNode (oldNode, parent) {
	// remove node
	parent.removeChild(oldNode._node);

	// remove reference to avoid memory leaks with hoisted VNodes
	oldNode._node = null;

	if (oldNode._owner) {
		if (oldNode._owner.componentWillUnmount) {
			oldNode._owner.componentWillUnmount();
		}

		// remove reference...
		oldNode._owner = null;
	}
}


/**
 * replace element
 *
 * @param  {VNode}  newNode
 * @param  {VNode}  oldNode
 * @param  {Node}   parentNode 
 * @param  {Node}   nextNode
 */
function replaceNode (newNode, oldNode, parentNode, nextNode) {
	// replace node
	parentNode.replaceChild(nextNode, oldNode._node);

	// remove reference to avoid memory leaks with hoisted VNodes
	oldNode._node = null;

	// replace node is also a form of removing the node
	if (oldNode._owner) {
		if (oldNode._owner.componentWillUnmount) {
			oldNode._owner.componentWillUnmount();
		}

		// remove reference...
		oldNode._owner = null;
	}
}


/**
 * insert element
 *
 * @param  {VNode}  newNode
 * @param  {VNode}  newNode
 * @param  {Node}   parentNode
 * @param  {Node}   nextNode
 */
function insertNode (newNode, oldNode, parentNode, nextNode) {
	if (newNode._owner && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount();
	}

	// insert node
	parentNode.insertBefore(nextNode, oldNode._node);

	if (newNode._owner && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount();
	}
}


/**
 * move element
 * 
 * @param  {VNode} oldNode
 * @param  {Node}  parentNode
 * @param  {Node}  nextNode
 */
function moveNode (oldNode, parentNode, nextNode) {
	parentNode.insertBefore(nextNode, oldNode._node);
}


/**
 * append element
 *
 * @param  {VNode} newNode
 * @param  {Node}  parentNode
 * @param  {Node}  nextNode
 */
function appendNode (newNode, parentNode, nextNode) {
	if (newNode._owner && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount();
	}

	// append node
	parentNode.appendChild(nextNode);
	
	if (newNode._owner && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount();
	}
}


/**
 * create element
 * 
 * @param  {Object}  subject
 * @param  {Object=} component
 * @param  {string=} namespace
 * @return {Node}
 */
function createNode (subject, component, namespace) {
	var nodeType = subject.nodeType;
	
	if (nodeType === 3) {
		// textNode
		return subject._node = document.createTextNode(subject.children || '');
	} else {
		// element
		var element;
		var props;

		if (subject._node) {
			// clone, blueprint node/hoisted vnode
			props = subject.props;
			element = subject._node;
		} else {
			// create
			var newNode  = nodeType === 2 ? extractVNode(subject) : subject;
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

			if (props !== objEmpty) {
				// diff and update/add/remove props
				assignProps(element, props, false);
			}

			// vnode has component attachment
			if (subject._owner != null) {
				(component = subject._owner)._vnode._node = element;
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
							null
						);
					}

					// append child
					appendNode(newChild, element, createNode(newChild, component || null, namespace || null));
					
					// we pass namespace and component so that 
					// 1. if element is svg element we can namespace all its children
					// 2. if nested refs we can propagate them to a parent component
				}
			}

			subject._node = element;
		}

		// refs
		if (props.ref !== void 0 && component !== null) {
			assignRefs(element, props.ref, component);
		}

		// check if a stylesheet is attached
		if (subject.type.stylesheet != null) {
			if (subject.type.stylesheet === 0) {
				element.setAttribute(nsStyle, subject.type.id);
			} else {
				// note: since we mutate the .stylesheet property to 0 in stylesheet
				// this will execute exactly once for any component constructor
				stylesheet(element, subject.type);
			}
		}

		// cache element reference
		return element;
	}
}


/**
 * assign prop for create element
 * 
 * @param  {Node}   target
 * @param  {Object} props
 * @param  {number} onlyEvents
 */
function assignProps (target, props, onlyEvents) {
	for (var name in props) {
		assignProp(target, name, props, onlyEvents);
	}
}


/**
 * assign prop for create element
 * 
 * @param  {Node}   target
 * @param  {string} name
 * @param  {Object} props
 * @param  {number} onlyEvents
 */
function assignProp (target, name, props, onlyEvents) {
	var propValue = props[name];

	if (isEventName(name)) {
		// add event listener
		target.addEventListener(extractEventName(name), propValue, false);
	} else if (onlyEvents === false) {
		// add attribute
		updateProp(target, 'setAttribute', name, propValue, props.xmlns);
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
 * ---------------------------------------------------------------------------------
 * 
 * Server Side Render
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * server side render
 * 
 * @param  {(Object|function)} subject
 * @param  {string}            template
 * @return {string}
 */
function renderToString (subject, template) {
	var styles = [''];
	var vnode  = retrieveVNode(subject);
	var lookup = {};
	var body   = renderVNodeToString(vnode, styles, lookup);
	var style  = styles[0];

	if (template) {
		if (typeof template === 'string') {
			return template.replace('{{body}}', body+style);
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
 * @param  {Object} props
 * @param  {string} string
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
								name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
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
 * @param  {Object} subject
 * @param  {str[1]} styles
 * @return {string}  
 */
function renderVNodeToString (subject, styles, lookup) {
	var nodeType = subject.nodeType;

	// textNode
	if (nodeType === 3) {
		return escape(subject.children);
	}

	var component = subject.type;
	var vnode;

	// if component
	if (nodeType === 2) {
		// if cached
		if (component._html !== void 0) {
			return component._html;
		} else {
			vnode = extractVNode(subject);
		}
	} else {
		vnode = subject;
	}

	// references
	var type = vnode.type;
	var props = vnode.props;
	var children = vnode.children;

	var strChildren = '';

	if (props.innerHTML !== void 0) {
		// special case when a prop replaces children
		strChildren = props.innerHTML;
	} else {		
		// construct children string
		if (children.length !== 0) {
			for (var i = 0, length = children.length; i < length; i++) {
				strChildren += renderVNodeToString(children[i], styles, lookup);
			}
		}
	}

	var strProps = renderStylesheetToString(nodeType, component, styles, renderPropsToString(props), lookup);

	if (nodeType === 11) {
		return strChildren;
	} else if (isVoid[type] === 0) {
		// <type ...props>
		return '<'+type+strProps+'>';
	} else {
		// <type ...props>...children</type>
		return '<'+type+strProps+'>'+strChildren+'</'+type+'>';
	}
}


/**
 * render stylesheet to string
 * 
 * @param  {function}  component
 * @param  {string[1]} styles    
 * @param  {string}    string   
 * @return {string}          
 */
function renderStylesheetToString (nodeType, component, styles, string, lookup) {
	// stylesheet
	if (nodeType === 2 && component.stylesheet != null) {
		// insure we only every create one 
		// stylesheet for every component
		if (component.css === void 0 || component.css[0] !== '<') {
			// initial build css
			styles[0] += stylesheet(null, component);
			lookup[component.id] = true;
		} else if (!lookup[component.id]) {
			styles[0] += component.css;
			lookup[component.id] = true;
		}

		// add attribute to element
		string += ' '+nsStyle+'='+'"'+component.id+'"';
	}

	return string;
}


/**
 * renderToStream
 * 
 * @param  {(Object|function)} subject 
 * @return {Stream}
 */
function renderToStream (subject, template) {	
	return subject ? (
		new Stream(
			subject,
			template == null ? null : template.split('{{body}}')
		)
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
	this.lookup   = {};
	this.stack    = [];
	this.styles   = [''];
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
				var style = this.styles[0];

				// if there are styles, append
				if (style.length !== 0) {
					this.push(style);
				}

				// has template, push closing
				this.template && this.push(this.template[1]);

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
				this._pipe(this.node, true, this.stack, this.styles, this.lookup);
			}
		}
	},
	_pipe: {
		value: function (subject, flush, stack, styles, lookup) {
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

			var component = subject.type;
			var vnode;

			// if component
			if (nodeType === 2) {
				// if cached
				if (component._html !== void 0) {
					this.push(component._html); return;
				} else {
					vnode = extractVNode(subject);
				}
			} else {
				vnode = subject;
			}

			// references
			var type = vnode.type;
			var props = vnode.props;
			var children = vnode.children;

			var sprops = renderStylesheetToString(nodeType, component, styles, renderPropsToString(props), lookup);

			if (isVoid[type] === 0) {
				// <type ...props>
				this.push('<'+type+sprops+'>');
			} else {
				var opening = '';
				var closing = '';

				// fragments do not have opening/closing tags
				if (nodeType !== 11) {
					// <type ...props>...children</type>
					opening = '<'+type+sprops+'>';
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
						var eof = type === 'body' || doctype;

						// for each _read if queue has middleware
						// middleware execution will take priority
						var middleware = function (stream) {
							// done, close html tag, delegate next middleware
							if (index === length) {
								// if the closing tag is body or html
								// we want to push the styles before we close them
								if (eof && styles[0].length !== 0) {
									stream.push(styles[0]);
									styles[0] = '';
								}

								stream.push(closing);
							} else {
								stream._pipe(children[index++], false, stack, styles, lookup);
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
		} else {
			// if a blueprint is not already constructed
			if (subject._html == null) {
				subject._html = renderToString(subject);
			}
		}
	}

	return subject;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * stream
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * create stream, getter/setter
 * 
 * @param  {*}                    value
 * @param  {(function(...*)|boolean)} middleware
 * @return {function}
 */
function stream (value, middleware) {
	var store;
	// this allows us to return values in a .then block that will
	// get passed to the next .then block
	var chain = { then: null, catch: null }; 
	// .then/.catch listeners
	var listeners = { then: [], catch: [] };

	// predetermine if a middlware was passed
	var hasMiddleware = middleware != null;
	// predetermine if the middlware passed is a function
	var middlewareFunc = hasMiddleware && typeof middleware === 'function';

	function Stream (value) {
		// received value, update stream
		if (arguments.length !== 0) {
			return (setTimeout(dispatch, 0, 'then', store = value), Stream);
		} else {
			// if you pass a middleware function i.e a = stream(1, String)
			// the stream will return 1 processed through String
			// if you pass a boolean primitive the assumtion is made that the store
			// is a function and that it should return the functions return value
			if (hasMiddleware) {
				return middlewareFunc ? middleware(store) : store();
			} else {
				return store;
			}
		}
	}

	// dispatcher, dispatches listerners
	function dispatch (type, value) {
		var collection = listeners[type];
		var length = collection.length;

		if (length !== 0) {
			// executes a listener, adding the return value to the chain
			var action = function (listener) {
				// link in the .then / .catch chain
				var link = listener(chain[type] || value);
				// add to chain if defined
				if (link !== void 0) { chain[type] = link; }
			}

			for (var i = 0; i < length; i++) {
				sandbox(action, reject, collection[i]);
			}
		}
	}

	// resolve value
	function resolve (value) {
		return Stream(value); 
	}

	// reject
	function reject (reason) { 
		setTimeout(dispatch, 0, 'catch', reason);
	}

	// add done listener, ends the chain
	function done (listener, onerror) {
		then(listener, onerror || true);
	}
	
	// add catch/error listener
	function error (listener) {
		return push('catch', listener, null);
	}

	// ...JSON.strinfigy()
	function toJSON () {
		return store;
	}

	// {function}.valueOf()
	function valueOf () {
		return store; 
	}

	// push listener
	function push (type, listener, end) {
		listeners[type].push(function (chain) {
			return listener(chain);
		});

		return end === null ? Stream : void 0;
	};

	// add then listener
	function then (listener, onerror) {
		if (onerror) {
			error(onerror);
		}

		if (listener) {
			return push('then', listener, onerror || null);
		}
	}

	// create a map
	function map (callback) {
		return stream(function (resolve) {
			resolve(function () { return callback(Stream()); });
		}, true);
	}

	// end/reset a stream
	function end (value) {
		if (value) store = value;

		chain.then = null;
		chain.catch = null; 
		listeners.then = []; 
		listeners.catch = [];
	}

	// assign public methods
	Stream.then = then;
	Stream.done = done;
	Stream.catch = error;
	Stream.map = map;
	Stream.end = end;
	Stream.valueOf = valueOf;
	Stream.toJSON = toJSON;
	// signature
	Stream._stream = true;

	// acts like a promise if a function is passed as value
	typeof value === 'function' ? value(resolve, reject) : Stream(value);

	return Stream;
}


/**
 * create new stream in resolved state
 * 
 * @param  {*}    value
 * @return {(function)}
 */
stream.resolve = function (value) {
	return stream(function (resolve, reject) {
		resolve(value);
	});
};


/**
 * create new stream in rejected state
 * 
 * @param  {*}    value 
 * @return {Stream}
 */
stream.reject = function (value) {
	return stream(function (resolve, reject) {
		reject(value);
	});
};


/**
 * do something after all dependecies have resolved
 * 
 * @param  {any[]}    deps
 * @return {(function)}
 */
stream.all = function (deps) {
	var resolved = [];

	// pushes a value to the resolved array and compares if resolved length
	// is equal to deps this will tell us when all dependencies have resolved
	function resolver (value, resolve) {
		resolved[resolved.length] = value;
		if (resolved.length === deps.length) {
			resolve(resolved)
		}
	}

	return stream(function (resolve, reject) {
		// check all dependencies, if a dependecy is a stream attach a listener
		// reject / resolve as nessessary.
		for (var i = 0, length = deps.length; i < length; i++) {
			var value = deps[i];

			if (value._stream) {
				value.then(function (value) { resolver(value, resolve); }).catch(function (reason) { reject(reason); });
			} else {
				resolver(value, resolve);
			}
		}
	});
};


/**
 * ---------------------------------------------------------------------------------
 * 
 * requests
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * http requests
 * 
 * @param  {string}  url
 * @param  {*}       payload 
 * @param  {string}  enctype 
 * @param  {boolean} withCredentials
 * @return {Object}
 */
function http () {
/**
 * serialize + encode object
 * 
 * @example serialize({url:'http://.com'}) //=> 'url=http%3A%2F%2F.com'
 * 
 * @param  {Object} object   
 * @param  {Object} prefix
 * @return {string}
 */
function serialize (object, prefix) {
	var arr = [];

	each(object, function (value, key) {
		var prefixValue = prefix !== void 0 ? prefix + '[' + key + ']' : key;

		// when the value is equal to an object 
		// we have somethinglike value = {name:'John', addr: {...}}
		// re-run param(addr) to serialize 'addr: {...}'
		arr[arr.length] = typeof value == 'object' ? 
								serialize(value, prefixValue) :
								encodeURIComponent(prefixValue) + '=' + encodeURIComponent(value);
	});

	return arr.join('&');
}


/**
 * parse, format response
 * 
 * @param  {Object} xhr
 * @return {*} 
 */
function response (xhr, type) {			
	var body; 
	var type; 
	var data;
	var header = xhr.getResponseHeader('Content-Type');

	if (!xhr.responseType || xhr.responseType === 'text') {
        data = xhr.responseText;
    } else if (xhr.responseType === 'document') {
        data = xhr.responseXML;
    } else {
        data = xhr.response;
    }

	// get response format
	type = (
		header.indexOf(';') !== -1 ? 
		header.split(';')[0].split('/') : 
		header.split('/')
	)[1];

	switch (type) {
		case 'json': { body = JSON.parse(data); break; }
		case 'html': { body = (new DOMParser()).parseFromString(data, 'text/html'); break; }
		default    : { body = data; }
	}

	return body;
}


/**
 * create http request
 * 
 * @param  {string}            method
 * @param  {string}            uri
 * @param  {(Object|string)=}  payload
 * @param  {string=}           enctype
 * @param  {boolean=}          withCredential
 * @param  {initial=}          initial
 * @param  {function=}         config
 * @param  {string=}           username
 * @param  {string=}           password
 * @return {function}
 */
function create (
	method, uri, payload, enctype, withCredentials, initial, config, username, password
) {
	// return a a stream
	return stream(function (resolve, reject, stream) {
		// if XMLHttpRequest constructor absent, exit early
		if (window.XMLHttpRequest === void 0) {
			return;
		}

		// create xhr object
		var xhr = new window.XMLHttpRequest();

		// retrieve browser location 
		var location = window.location;

		// create anchor element
		var anchor = document.createElement('a');
		
		// plug uri as href to anchor element, 
		// to extract hostname, port, protocol properties
		anchor.href = uri;

		// check if cross origin request
		var isCrossOriginRequest = !(
			anchor.hostname   === location.hostname && 
			anchor.port       === location.port &&
			anchor.protocol   === location.protocol && 
			location.protocol !== 'file:'
		);

		// remove reference, for garbage collection
		anchor = null;

		// open request
		xhr.open(method, uri, true, username, password);

		// on success resolve
		xhr.onload  = function onload () { resolve(response(this)); };
		// on error reject
		xhr.onerror = function onerror () { reject(this.statusText); };
		
		// cross origin request cookies
		if (isCrossOriginRequest && withCredentials) {
			xhr.withCredentials = true;
		}

		// assign content type and payload
		if (method === 'POST' || method === 'PUT') {
			xhr.setRequestHeader('Content-Type', enctype);

			if (enctype.indexOf('x-www-form-urlencoded') > -1) {
				payload = serialize(payload);
			} else if (enctype.indexOf('json') > -1) {
				payload = JSON.stringify(payload);
			}
		}

		// if, assign inital value of stream
		if (initial !== void 0) {
			resolve(initial);
		}

		// if config, expose underlying XMLHttpRequest object
		// allows us to save a reference to it and call abort when required
		if (config !== void 0 && typeof config !== 'function') {
			config(xhr);
		}

		// send request
		payload !== void 0 ? xhr.send(payload) : xhr.send();
	});
}


/**
 * create request method
 * 
 * @param {string}
 * @param {function}
 */
function method (method) {
	return function (
		url, payload, enctype, withCredentials, initial, config, username, password
	) {
		// encode url
		var uri = encodeURI(url);

		// enctype syntax sugar
		switch (enctype) {
			case 'json': { enctype = 'application/json'; break; }
			case 'text': { enctype = 'text/plain'; break; }
			case 'file': { enctype = 'multipart/form-data'; break; }
			default:     { enctype = 'application/x-www-form-urlencoded'; }
		}

		// if has payload && GET pass payload as query string
		if (method === 'GET' && payload) {
			uri = uri + '?' + (typeof payload === 'object' ? serialize(payload) : payload);
		}

		// return promise-like stream
		return create(
			method, uri, payload, enctype, withCredentials, initial, config, username, password
		);
	}
}


/**
 * request constructor
 * 
 * request({method: 'GET', url: '?'}) === request.get('?')
 * 
 * @param  {Object} subject
 * @return {function}
 */
function request (subject) {
	if (typeof subject === 'string') {
		return request.get(subject);
	} else {
		return request[(subject.method || 'GET').toLowerCase()](
			subject.url, 
			subject.payload || subject.data,
			subject.enctype, 
			subject.withCredentials,
			subject.initial,
			subject.config,
			subject.username, 
			subject.password
		);
	}
}

request.get  = method('GET'),
request.post = method('POST');



	return request;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * router
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * router
 * 
 * @param  {Object}        routes
 * @param  {string}        address 
 * @param  {string}        initialiser
 * @param  {(string|Node)} element
 * @param  {middleware}    middleware
 * @return {Object}
 */
function router (routes, address, initialiser, element, middleware) {
	if (typeof routes === 'function') {
		routes = routes();
	}

	if (typeof address === 'function') {
		address = address();
	}

	if (typeof address === 'object') {
		element     = address.mount,
		initialiser = address.init,
		middleware  = address.middleware,
		address     = address.root;
	}

	if (element !== void 0) {
		each(routes, function (component, uri) {
			if (middleware !== void 0) {
				routes[uri] = function (data) {
					middleware(component, data, element, uri);
				}
			} else {
				routes[uri] = function (data) {
					render(VComponent(component, data), element);
				}
			}
		});
	}

	return createRouter(routes, address, initialiser);
}


/**
 * router constructor
 * 
 * @param {any[]}     routes
 * @param {string=}   address
 * @param {function=} initialiser
 */
function createRouter (routes, address, initialiser) {
	// listens for changes to the url
	function listen () {
		if (interval !== 0) {
			// clear the interval if it's already set
			clearInterval(interval);
		}

		// start listening for a change in the url
		interval = setInterval(function () {
			var current = window.location.pathname;

			// if our store of the current url does not 
			// equal the url of the browser, something has changed
			if (location !== current) {					
				// update the location
				location = current;
				// dispatch route change
				dispatch();
			}
		}, 50);
	}

	// register routes
	function register () {
		// assign routes
		each(routes, function (callback, uri) {
			// - params is where we store variable names
			// i.e in /:user/:id - user, id are variables
			var params = [];

			// uri is the url/RegExp that describes the uri match thus
			// given the following /:user/:id/*
			// the pattern will be / ([^\/]+) / ([^\/]+) / (?:.*)
			var pattern = uri.replace(regRoute, function () {
				// id => 'user', '>>>id<<<', undefned
				var id = arguments[2];
				// if, not variable, else, capture variable
				return id != null ? (params[params.length] = id, '([^\/]+)') : '(?:.*)';
			});

			// assign a route item
			routes[uri] = [callback, new RegExp((address ? address + pattern : pattern) + '$'), params];
		});
	}

	// called when the listener detects a route change
	function dispatch () {
		each(routes, function (route, uri) {
			var callback = route[0];
			var pattern  = route[1];
			var params   = route[2];
			var match    = location.match(pattern);

			// we have a match
			if (match != null) {
				// create params object to pass to callback
				// i.e {user: 'simple', id: '1234'}
				var data = match.slice(1, match.length);

				var args = data.reduce(function (previousValue, currentValue, index) {
					// if this is the first value, create variables store
					if (previousValue === null) {
						previousValue = {};
					}

					// name: value
					// i.e user: 'simple'
					// `vars` contains the keys for the variables
					previousValue[params[index]] = currentValue;

					return previousValue;

					// null --> first value
				}, null); 

				callback(args, uri);
			}
		});
	}

	// navigate to a uri
	function navigate (uri) {
		if (typeof uri === 'string') {
			history.pushState(null, null, address ? address + uri : uri);
		}
	}

	// middleware between event and route
	function link (to) {
		var func = typeof to === 'function';

		return function (e) {
			var target = e.currentTarget;
			var value  = func ? to.call(target, target) : to;

			navigate(target[value] || target.getAttribute(value) || value); 
		};
	}

	var addrlen = address.length;

	// normalize rootAddress format
	// i.e '/url/' -> '/url', 47 === `/` character
	if (typeof address === 'string' && address.charCodeAt(addrlen-1) === 47) {
		address = address.substring(0, addrlen - 1);
	}

	var location = '';
	var interval = 0;
	var api      = {
		nav:    navigate,
		go:     history.go, 
		back:   history.back, 
		foward: history.foward, 
		link:   link
	};

	// register routes, start listening for changes
	register();
	// listens only while in the browser enviroment
	browser && listen();

	// initialiser, if function pass api as args, else string, navigate to uri
	if (initialiser !== void 0) {
		var type = typeof initialiser;

		if (type === 'function') {
			// initialiser function
			initialiser(api);
		} else if (type === 'string') {
			// navigate to path
			navigate(initialiser);
		}
	}

	return api;
}



/**
 * ---------------------------------------------------------------------------------
 * 
 * store
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * creates a store enhancer
 *
 * @param   {...function} middlewares
 * @return  {function}    a store enhancer
 */
function applyMiddleware () {
	var middlewares = [];
	var length = arguments.length;

	// passing arguments to a function i.e [].splice() will prevent this function
	// from getting optimized by the VM, so we manually build the array in-line
	for (var i = 0; i < length; i++) {
		middlewares[i] = arguments[i];
	}

	return function (Store) {
		return function (reducer, initialState, enhancer) {
			// create store
			var store = Store(reducer, initialState, enhancer);
			var api   = {
				getState: store.getState,
				dispatch: store.dispatch
			};

			// create chain
			var chain = [];

			// add middlewares to chain
			for (var i = 0; i < length; i++) {
				chain[i] = middlewares[i](api);
			}

			// return store with composed dispatcher
			return {
				getState: store.getState, 
				dispatch: compose.apply(null, chain)(store.dispatch), 
				subscribe: store.subscribe,
				connect: store.connect,
				replaceReducer: store.replaceReducer
			};
		}
	}
}


/**
 * combines a set of reducers
 * 
 * @param  {Object}  reducers
 * @return {function}
 */
function combineReducers (reducers) {
	var keys   = Object.keys(reducers);
	var length = keys.length;

	// create and return a single reducer
	return function (state, action) {
		state = state || {};

		var nextState = {};

		for (var i = 0; i < length; i++) {
			var key = keys[i]; 

			nextState[key] = reducers[key](state[key], action);
		}

		return nextState;
	}
}
/**
 * create store interface
 * 
 * @param  {function}  reducer
 * @param  {*}         initialState
 * @param  {function=} enhancer
 * @return {Object}    {getState, dispatch, subscribe, connect, replaceReducer}
 */
function createStore (reducer, initialState, enhancer) {
	// exit early, reducer is not a function
	if (typeof reducer !== 'function') {
		panic('reducer should be a function');
	}

	// if initialState is a function and enhancer is undefined
	// we assume that initialState is an enhancer
	if (typeof initialState === 'function' && enhancer === void 0) {
		enhancer = initialState;
		initialState = void 0;
	}

	// delegate to enhancer if defined
	if (enhancer !== void 0) {
		// exit early, enhancer is not a function
		if (typeof enhancer !== 'function') {
			panic('enhancer should be a function');
		}

		return applyMiddleware(enhancer)(Store)(reducer, initialState);
	}

	// if object, multiple reducers, else, single reducer
	return typeof reducer === 'object' ? Store(combineReducers(reducer)) : Store(reducer);
}
/**
 * create store constructor
 * 
 * @param  {function} reducer
 * @param  {*}        initialState
 * @return {Object}   {getState, dispatch, subscribe, connect, replaceReducer}
 */
function Store (reducer, initialState) {
	var currentState = initialState;
	var listeners    = [];

	// state getter, retrieves the current state
	function getState () {
		return currentState;
	}

	// dispatchs a action
	function dispatch (action) {
		if (action.type === void 0) {
			panic('actions without type');
		}

		// update state with return value of reducer
		currentState = reducer(currentState, action);

		// dispatch to all listeners
		for (var i = 0, length = listeners.length; i < length; i++) {
			listeners[i](currentState);
		}

		return action;
	}

	// subscribe to a store
	function subscribe (listener) {
		if (typeof listener !== 'function') {
			panic('listener should be a function');
		}

		// retrieve index position
		var index = listeners.length;

		// append listener
		listeners[index] = listener;

		// return unsubscribe function
		return function unsubscribe () {
			// for each listener
			for (var i = 0, length = listeners.length; i < length; i++) {
				// if currentListener === listener, remove
				if (listeners[i] === listener) {
					listeners.splice(i, 1);
				}
			}
		}
	}

	// replace a reducer
	function replaceReducer (nextReducer) {
		// exit early, reducer is not a function
		if (typeof nextReducer !== 'function') {
			panic('reducer should be a function');
		}

		// replace reducer
		reducer = nextReducer;

		// dispath initial action
		dispatch({type: '@/STORE'});
	}

	// auto subscribe a component to a store
	function connect (subject, element) {
		var callback;

		// if component
		if (element && typeof render === 'function' && typeof VComponent === 'function') {
			// create renderer
			callback = render(VComponent(subject, currentState, []), element);
		} else {
			callback = subject;
		}

		// subscribe to state updates, dispatching render on update
		subscribe(callback);
	}

	// dispath initial action
	dispatch({type: '@/STORE'});

	return {
		getState:       getState, 
		dispatch:       dispatch, 
		subscribe:      subscribe,
		connect:        connect,
		replaceReducer: replaceReducer
	};
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

	// stores
	createStore:      createStore,
	applyMiddleware:  applyMiddleware,
	combineReducers:  combineReducers,
	
	// http
	request:          http(),
	router:           router,
	
	// utilities
	stream:           stream,
	stylis:           stylis,
	escape:           escape,
	panic:            panic,
	sandbox:          sandbox,
	compose:          compose,
	random:           random,
	defer:            defer,

	// version
	version:          version,

	// alias
	h:                createElement,
};


}));