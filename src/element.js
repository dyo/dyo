/**
 * ---------------------------------------------------------------------------------
 * 
 * element
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * DOM factory
 *
 * @param {any[]=} types
 * create references to common dom elements
 */
function DOM (types) {
	// default to preset types if non passed
	types = types || [
		'h1','h2','h3','h4','h5', 'h6','audio','video','canvas',
		'header','nav','main','aside','footer','section','article','div',
		'form','button','fieldset','form','input','label','option','select','textarea',
		'ul','ol','li','p','a','pre','code','span','img','strong','time','small','hr','br',
		'table','tr','td','th','tbody','thead',
	];

	var elements = {};

	// add element factories
	for (var i = 0, length = types.length; i < length; i++) {
		var type = types[i]; elements[type] = VElement.bind(null, type);
	}

	// optional usefull helpers
	if (elements.text)      { elements.text      = VText; }
	if (elements.fragment)  { elements.fragment  = VFragment; }
	if (elements.component) { elements.component = VComponent; }
	
	// if in list of types, add related svg element factories
	if (elements.svg) {
		var svgs = [
			'rect','path','polygon','circle','ellipse','line','polyline','image','marker','a','symbol',
			'linearGradient','radialGradient','stop','filter','use','clipPath','view','pattern','svg',
			'g','defs','text','textPath','tspan','mpath','defs','g','marker','mask'
		];

		for (var i = 0, length = svgs.length; i < length; i++) {
			var type = svgs[i]; elements[type] = VSvg.bind(null, type);
		}
	}

	return elements;
}

/**
 * virtual fragment node factory
 * 
 * @param {any[]} children
 */
function VFragment (children) {
	return {
		nodeType: 11, 
		type: '@', 
		props: emptyObject, 
		children: children,
		_el: null
	};
}

/**
 * virtual text node factory
 * 
 * @param {string=} text
 */
function VText (text) {
	return {
		nodeType: 3, 
		type: 'text', 
		props: emptyObject, 
		children: text, 
		_el: null
	};
}
	
/**
 * virtual element node factory
 * 
 * @param {string} type
 * @param {Object=} props
 * @param {any[]=}  children
 */
function VElement (type, props, children) {
	return {
		nodeType: 1, 
		type: type, 
		props: props || {}, 
		children: children || [], 
		_el: null
	};
}

/**
 * virtual svg node factory
 * 
 * @param {string} type
 * @param {Object=} props
 * @param {any[]=} children
 */
function VSvg (type, props, children) {
	props = props || {}, props.xmlns = svgNS;

	return {
		nodeType: 1, 
		type: type, 
		props: props, 
		children: children || [],
		_el: null
	};
}

/**
 * virtual component node factory
 * 
 * @param {function} type
 * @param {Object=}  props
 * @param {any[]=}   children
 */
function VComponent (type, props, children) {
	return {
		nodeType: 2, 
		type: type, 
		props: props || type.defaultProps || {}, 
		children: children || [],
		_el: null
	};
}

/**
 * virtual blueprint node factory
 * 
 * @param  {Object} VNode
 * @return {Object} Vnode
 */
function VBlueprint (VNode) {
	if (isDefined(VNode)) {
		// if array run all VNodes through VBlueprint
		if (isArray(VNode)) {
			for (var i = 0, length = VNode.length; i < length; i++) {
				VBlueprint(VNode[i]);
			}
		} else {
			// if a blueprint not already constructed
			if (VNode._el === null) {
				if (document) {
					// create node returns a dom element
					// the opt is that createNode() uses .cloneNode if _el is assigned
					// so the next time this element is created cloneNode is used
					// instead of createElement, the benefits incremental depending
					// on the size(children...) of the node in question.
					VNode._el = createNode(VNode);
				} else {
					extractVNode(VNode);
				}
			}
		}
	}

	return VNode;
}

/**
 * create virtual element
 * 
 * @param  {(string|function|Object)} type
 * @param  {Object=}                  props
 * @param  {...*=}                    children - everything after props
 * @return {Object}
 */
function createElement (type, props) {
	var length = arguments.length, children = [], position = 2;

	// if props is not a normal object
	if (props == null || props.nodeType !== undefined || props.constructor !== Object) {
		// update position if props !== undefined|null
		// this assumes that it would look like
		// createElement('type', null, ...children);
		if (props !== null) {
			position = 1; 
		}

		// default
		props = {};
	}

	// construct children
	for (var i = position; i < length; i++) {
		var child = arguments[i];
		
		// only add non null/undefined children
		if (child != null) {
			// if array add all its items this means that we can have
			// createElement('type', null, 'Hello', [1, 2], 'World')
			// then Hello, 1, 2 and World will all become
			// individual items in the children array of the VNode
			if (child.constructor === Array) {
				var len = child.length;

				// add array child
				for (var j = 0; j < len; j = j + 1) {
					assignElement(child[j], children); 
				} 
			} else {
				// add non-array child
				assignElement(child, children);
			}
		}
	}

	// if type is a function, create component
	if (typeof type === 'function') {
		return VComponent(type, props, children);
	} else {
		// if first letter = @, create fragment, else create element
		var element = type[0] === '@' ? VFragment(children) : VElement(type, props, children);

		// special type, i.e [type] | div.class | #id
		if ((type.indexOf('.') > -1 || type.indexOf('[') > -1 || type.indexOf('#') > -1)) {
			parseVNodeType(type, props || {}, element);
		}

		// if !props.xmlns && type === svg|math assign svg && math props.xmlns
		if (element.props.xmlns === undefined) {	
			if (type === 'svg') { 
				element.props.xmlns = svgNS; 
			} else if (type === 'math') { 
				element.props.xmlns = mathNS; 
			}
		}

		return element;
	}
}

/**
 * assign virtual element
 * 
 * @param  {*}     element
 * @param  {any[]} children
 */
function assignElement (element, children) {
	var childNode;

	if (element != null && element.nodeType !== undefined) {
		// default element
		childNode = element;
	} else if (typeof element === 'function') {
		// component
		childNode = VComponent(element);
	} else {
		// primitives, string, bool, number
		childNode = VText(element);
	}

	// push to children array
	children[children.length] = childNode;
}

/**
 * special virtual element types
 *
 * @example h('inpu#id[type=radio]') <-- yields --> h('input', {id: 'id', type: 'radio'})
 * 
 * @param  {Object} element
 * @return {Object} element
 */
function parseVNodeType (type, props, element) {
	var matches, classList = [];

	// default type
	element.type = 'div';

	// if undefined, create RegExp
	if (parseVNodeTypeRegExp === undefined) {
		parseVNodeTypeRegExp = new RegExp(
			'(?:(^|#|\\.)([^#\\.\\[\\]]+))|(\\[(.+?)(?:\\s*=\\s*(\"|\'|)((?:\\\\[\"\'\\]]|.)*?)\\5)?\\])','g'
		);
	}

	// execute RegExp, iterate matches
	while (matches = parseVNodeTypeRegExp.exec(type)) {
		var matchedType      = matches[1],
			matchedValue     = matches[2],
			matchedProp      = matches[3],
			matchedPropKey   = matches[4],
			matchedPropValue = matches[6];

		if (matchedType === '' && matchedValue !== '') {
			// type
			element.type = matchedValue;
		} else if (matchedType === '#') { 
			// id
			props.id = matchedValue;
		} else if (matchedType === '.') { 
			// class(es)
			classList[classList.length] = matchedValue;
		} else if (matchedProp[0] === '[') { 
			// attribute
			var prop = matchedPropValue;

			// remove `[`, `]`, `'` and `"` characters
			if (prop !== undefined) {
				prop = prop.replace(/\\(["'])/g, '$1').replace(/\\\\/g, "\\");
			}

			// h('input[checked]') or h('input[checked=true]') yield {checked: true}
			props[matchedPropKey] = prop || true;
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
 * clone and return an element having the original element's props
 * with new props merged in shallowly and new children replacing existing ones.
 * 
 * @param  {Object}  subject
 * @param  {Object=} props
 * @param  {any[]=}  children
 * @return {Object}
 */
function cloneElement (subject, props, children) {
	// copy props
	each(props, function (value, name) {
		subject.props[name] = value;
	});

	// if new children
	if (isArray(children)) {
		var length = children.length;

		// and new children is not an empty array
		if (length !== 0) {
			subject.children = [];

			// copy old children
			for (var i = 0; i < length; i++) {
				assignElement(children[i], subject.children);
			}
		}
	}

	return subject;
}


/**
 * is valid element
 * 
 * @param  {*} subject
 * @return {boolean}
 */
function isValidElement (subject) {
	return (
		subject != null && subject.nodeType !== undefined
	);
}


/**
 * create element factory
 * 
 * @param  {string} element
 * @return {function}
 */
function createFactory (type, props) {
	return (
		!props ? VElement.bind(null, type) : VElement.bind(null, type, props)
	);
}


/**
 * Children
 * 
 * mocks React.Children Top-Level API
 *
 * @return {Object}
 */
function Children () {
	return {
		only: function only (children) {
		  	return isArray(children) && children.length === 1 ? children[0] : panic('expects one child!');
		},
		map: function map (children, func) {
			return isArray(children) ? children.map(func) : children;
		},
		forEach: function forEach (children, func) {
			return isArray(children) ? children.forEach(func) : children;
		},
		toArray: function toArray (children) {
			return isArray(children) ? children : children.slice(0);
		},
		count: function count (children) {
			return isArray(children) ? children.length : 0;
		}
	}
}