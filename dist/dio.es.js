/**
 * @type {function}
 * @param {number}
 * @return {number}
 */

/**
 * @type {function}
 * @return {number}
 */
var random = Math.random;

/**
 * @param {*}
 * @return {(object|function)}
 */
var object = Object;

/**
 * @type {function}
 * @param {*}
 * @param {(string|number|symbol)}
 * @return {object}
 */
var descriptors = Object.getOwnPropertyDescriptors;

/**
 * @type {function}
 * @param {object}
 * @return {Array<string>}
 */
var keys = Object.keys;

/**
 * @type {function}
 * @param {*}
 * @param {(string|number|symbol)}
 * @param {object}
 * @return {object}
 */
var define = Object.defineProperty;

/**
 * @param {(object|function)?}
 * @param {object}
 * @return {object}
 */
var create = Object.create;

/**
 * @return {(symbol|number)} where number is not a valid array index
 */
var symbol = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol : define(function () {
	return -random()
}, 'for', function (value) {
  for (var i = 0, h = 0; i < value.length; ++i) {
    h = ((h << 5) - h) + value.charCodeAt(i);
  }

  return -h
});

/**
 * @param {number} value
 * @return {number}
 */
function hash (value) {
	return -((-(value + 1)) >>> 0)
}

/**
 * @param {object} object
 * @param {*} key
 * @return {boolean}
 */
function has (object, key) {
	return Object.hasOwnProperty.call(object, key)
}

/**
 * @param {function} value
 * @param {*} that
 * @return {boolean}
 */
function bind (value, that) {
	return value.bind(that)
}

/**
 * @param {function} constructor
 * @param {object} props
 * @param {object?} prototype
 * @return {function}
 */
function extend (constructor, properties, prototype) {
	return define(constructor, 'prototype', {value: create(prototype || null, properties || {})})
}

/**
 * @return {void}
 */
function noop () {}

/**
 * @throws {Error}
 * @param {string} message
 */
function invariant (message) {
	throw new Error(message)
}

/**
 * @param {object} value
 * @return {boolean}
 */
function fetchable (value) {
	return typeof value.blob === 'function' && typeof value.text === 'function' && typeof value.json === 'function'
}

/**
 * @param {object} value
 * @return {boolean}
 */
function thenable (value) {
	return typeof value.then === 'function' && typeof value.catch === 'function'
}

/**
 * @param {object} value
 * @param {boolean}
 */
function iterable (value) {
	return typeof value[symbol.iterator] === 'function' || Array.isArray(value)
}

/**
 * @param {*} a
 * @param {*} b
 * @return {boolean}
 */
function is (a, b) {
	return a === b ? (a !== 0 || 1/a === 1/b) : (a !== a && b !== b)
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object}
 */
function merge$1 (a, b) {
	var value = {};

	for (var key in a) {
		value[key] = a[key];
	}
	for (var key in b) {
		value[key] = b[key];
	}

	return value
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object}
 */
function assign (a, b) {
	for (var key in b) {
		a[key] = b[key];
	}

	return a
}

/**
 * @param {object} a
 * @param {object} b
 * @return {boolean}
 */
function compare (a, b) {
	for (var key in a) {
		if (!has(b, key)) {
			return true
		}
	}
	for (var key in b) {
		if (!is(a[key], b[key])) {
			return true
		}
	}

	return false
}

/**
 * @param {function} callback
 * @param {*?} value
 * @param {number} index
 */
function each (callback, value, index) {
	if (value != null) {
		if (Array.isArray(value)) {
			for (var i = 0, j = index | 0; i < value.length; ++i) {
				if (each(callback, value[i], i + j) != null) {
					break
				}
			}
		} else if (iterable(value)) {
			if (typeof value.next === 'function') {
				for (var i = 0, j = index | 0, next = value.next(next); !next.done; ++i) {
					if (each(callback, next.value, i + j) != null) {
						break
					} else {
						next = value.next(next.value);
					}
				}
			} else {
				each(callback, value[symbol.iterator](), index | 0);
			}
		} else {
			return callback(value, index | 0)
		}
	}
}

// stable key
var key = -(-1 >>> 0);

// element identifier
var thenable$1 = -5;
var iterable$1 = -4;
var component = -3;
var fragment = -2;
var portal = -1;
var node = 0;
var text = 1;
var empty = 2;
var comment = 3;

// from
var search$1 = 0;
var update = 1;
var create$1 = 2;

// active
var idle = 0;
var active = 1;

// component
var props = 0;
var state = 1;
var force = 2;

// interface
var owner$1 = 0;
var event = 1;

// properties
var prototype = 'prototype';

// lifecycles
var refs = 'refs';

var render = 'render';
var setState = 'setState';
var forceUpdate = 'forceUpdate';

var getInitialState = 'getInitialState';
var getChildContext = 'getChildContext';
var getDerivedStateFromProps = 'getDerivedStateFromProps';

var componentDidCatch = 'componentDidCatch';
var componentDidMount = 'componentDidMount';
var componentDidUpdate = 'componentDidUpdate';
var componentWillMount = 'componentWillMount';
var componentWillUpdate = 'componentWillUpdate';
var componentWillUnmount = 'componentWillUnmount';
var componentWillReceiveProps = 'componentWillReceiveProps';
var shouldComponentUpdate = 'shouldComponentUpdate';

// static properties
var displayName = 'displayName';
var defaultProps = 'defaultProps';

// validation types
var propTypes = 'propTypes';
var contextTypes = 'contextTypes';

// system symbols
var iterator = symbol.iterator || '@@iterator';
var asyncIterator = symbol.asyncIterator || '@@asyncIterator';

// library symbols
var memoize = symbol.for('@@memoize');
var element$1 = symbol.for('@@element');
var context = symbol.for('@@context');
var exception = symbol.for('@@exception');

// values
var object$1 = {};

function prepare (target, registry) {
	target.textContent = '';
}

function create$2 (element, xmlns, from) {
	if (from === search$1) {
		return search(element, index) || create$2(element, xmlns, -from)
	} else {
		switch (element.uuid) {
			case node:
				if (xmlns) {
					return document.createElementNS(xmlns, element.type)
				} else {
					return document.createElement(element.type)
				}
			case text:
			case empty:
				return document.createTextNode(element.children)
			case comment:
				return document.createComment(element.children)
			case portal:
				return target(element.type)
			case fragment:
				return document.createDocumentFragment()
		}
	}

	return element.owner
}

function remove (parent, element) {
	parent.owner.removeChild(element.owner);
}

function append (parent, element) {
	parent.owner.appendChild(element.owner);
}

function insert (parent, element, sibling) {
	parent.owner.insertBefore(element.owner, sibling.owner);
}

function content (element, value) {
	element.owner.nodeValue = value;
}

function valid (value, type) {
	switch (type) {
		case event:
			return value.BUBBLING_PHASE === 3
		case owner$1:
		case component:
			return value.ELEMENT_NODE === 1
	}
}

function owner$2 (value) {
	return value
}

function target (value) {
	if (value) {
		return typeof value === 'string' ? document.querySelector(value) : value
	} else {
		return document.documentElement
	}
}

function namespace (element, xmlns) {
	switch (element.type) {
		case 'svg':
			return 'http://www.w3.org/2000/svg'
		case 'math':
			return 'http://www.w3.org/1998/Math/MathML'
		case 'foreignObject':
			return ''
		default:
			return xmlns
	}
}

function event$1 (element, event$$1) {
	return element.state[event$$1.type]
}

function props$1 (element, props$$1, from) {
	switch (from) {
		case update:
			switch (element.type) {
				case 'input':
					return merge({type: null, step: null, min: null, max: null}, props$$1)
				case 'select':
					if (props$$1.defaultValue != null || props$$1.multiple) {
						return Utility.assign({value: props$$1.defaultValue}, props$$1)
					}
			}
		case create$1:
			return props$$1
	}
}

function commit (element, name, value, xmlns, from) {
	switch (name) {
		case 'style':

			break
		case 'className':
			if (!xmlns && value) {
				return property(element, name, value)
			}
		case 'class':
			return attribute(element, 'class', value, '')
		case 'xlink:href':
			return attribute()(element, name, value, 'http://www.w3.org/1999/xlink')
		case 'innerHTML':
			return html(element, name, value ? value : '', [])
		case 'dangerouslySetInnerHTML':
			return commit(element, 'innerHTML', value && value.__html, xmlns, signature)
		case 'acceptCharset':
			return commit(element, 'accept-charset', value, xmlns, signature)
		case 'httpEquiv':
			return commit(element, 'http-equiv', value, xmlns, signature)
		case 'tabIndex':
			return commit(element, name.toLowerCase(), value, xmlns, signature)
		case 'autofocus':
		case 'autoFocus':
			return element.owner[value ? 'focus' : 'blur']()
		case 'defaultValue':
			if (element.type === 'select') {
				return
			}
			break
		case 'width':
		case 'height':
			if (element.type === 'img') {
				return attribute(element, name, value, '')
			}
			break
		case 'form':
			if (element.type === 'input') {
				return attribute(element, name, value, '')
			}
			break
	}

	if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 2) {
		if (element.state[name]) {
			element.state[name] = value;
		} else {
			element.owner.addEventListener(name.substring(2).toLowerCase(), element, false);
		}
	} else {
		switch (typeof value) {
			case 'object':
				return property(element, name, value && element.props[name])
			case 'string':
			case 'number':
			case 'boolean':
				if (xmlns || !(name in element.owner)) {
					return attribute(element, name, value, '')
				}
			default:
				property(element, name, value);
		}
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {any} value
 */
function property (element, name, value) {
	switch (value) {
		case null:
		case false:
		case undefined:
			return attribute(element, name, value, element.owner[name] = '')
		default:
			element.owner[name] = value;
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {any} value
 * @param {string?} xmlns
 */
function attribute (element, name, value, xmlns) {
	switch (value) {
		case null:
		case false:
		case undefined:
			if (xmlns) {
				element.owner.removeAttributeNS(xmlns, name);
			}

			return element.owner.removeAttribute(name)
		case true:
			return attribute(element, name, '', xmlns)
		default:
			if (!xmlns) {
				element.owner.setAttribute(name, value);
			} else {
				element.owner.setAttributeNS(xmlns, name, value);
			}
	}
}

function html (element, name, value, nodes) {
	if (element.owner[name])
		element.children.forEach(function (children) {
			nodes.push(children.owner);
		});

	if (element.owner[name] = value) {
		nodes.push.apply(nodes, element.owner.childNodes);
	}

	nodes.forEach(function (node$$1) {
		element.owner.appendChild(node$$1);
	});
}

/*
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {Promise<*>} type
 */
function thenable$2 (host, parent$$1, element, type) {
	element.type.then(function (value) {
		if (element.active > idle) {
			if (element.type === type) ;
		}
	}, function (err) {
		Error.raise(element, err, render);
	});
}









/**
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {number} from
 */
function create$3 (host, parent$$1, snapshot, from$$1) {
	try {
		var xmlns = namespace(snapshot, parent$$1.xmlns);
		var element = new constructor$5(host, parent$$1, snapshot, create$2(snapshot, xmlns, from$$1));
		var current = element;

		if (!element.owner) {
			if (current = parent$$1, element.uuid === component) {
				return finalize(element, put(element, create$3(element, parent$$1, mount$1(host, element)), from$$1))
			}
		}
		if (element.uuid < text) {
			for (var i = 0, j = element.children; i < j.length; ++i) {
				append$1(current, j[i] = create$3(host, current, j[i], from$$1), create$1);
			}
			if (element.props !== object$1) {
				props$2(element, element.props, xmlns, create$1);
			}
		}

		return element
	} catch (err) {
		throw err
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @return {object}
 */
function destroy (parent$$1, element) {
	try {
		switch (element.active = idle, element.uuid) {
			case component:
				unmount$1(element);
			default:
				for (var i = 0, j = element.children; i < j.length; ++i) {
					destroy(element, j[i]);
				}
			case text:
			case empty:
			case comment:
				return element
		}
	} finally {
		if (element.ref) {
			console.log(element, element.ref);
			refs$1(element);
		}
	}
}

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {number} index
 */
function replace (host, parent$$1, element, snapshot, index) {
	mount(parent$$1, parent$$1.children[index] = create$3(host, parent$$1, snapshot, create$1), element);
	unmount(parent$$1, destroy(parent$$1, element));
}

/**
 * @param {object} parent
 * @param {object} element
 */
function unmount (parent$$1, element) {
	if (element.state) {
		if (thenable(element.state)) {
			return element.state.then(function () {
				remove$1(parent$$1, element);
			})
		}
	}

	remove$1(parent$$1, element);
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
function mount (parent$$1, element, sibling) {
	if (sibling) {
		insert$1(parent$$1, element, sibling, update);
	} else {
		append$1(parent$$1, element, update);
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
function remove$1 (parent$$1, element) {
	if (element.uuid < node) {
		element.children.forEach(function (element) {
			remove$1(parent$$1, element);
		});
	} else {
		remove(parent(parent$$1), element);
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {number} from
 */
function append$1 (parent$$1, element, from$$1) {
	if (element.uuid < node) {
		if (element.uuid !== portal) {
			element.children.forEach(function (element) {
				append$1(parent$$1, element, from$$1);
			});
		}
	} else {
		append(parent(parent$$1, from$$1), element);
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 * @param {number} from
 */
function insert$1 (parent$$1, element, sibling, from$$1) {
	if (element.uuid < node) {
		if (element.uuid !== portal) {
			element.children.forEach(function (element) {
				insert$1(parent$$1, element, sibling, from$$1);
			});
		}
	} else {
		insert(parent(parent$$1, from$$1), element, node$1(sibling));
	}
}

/**
 * @param {object} element
 * @param {(string|number)} value
 */
function content$1 (element, value) {
	content(element, value);
}

/**
 * @param {object} element
 * @param {object} props
 * @param {string?} xmlns
 * @param {number} from
 */
function props$2 (element, props$$1, xmlns, from$$1) {
	for (var key$$1 in props$1(element, props$$1, from$$1)) {
		switch (key$$1) {
			case 'ref':
				refs$1(element, props$$1[key$$1], from$$1);
			case 'key':
			case 'xmlns':
			case 'children':
				break
			default:
				commit(element, key$$1, props$$1[key$$1], xmlns, from$$1);
		}
	}
}

/**
 * @param {object} element
 * @param {*?} value
 * @param {number?} from
 */
function refs$1 (element, value, from$$1) {
	switch (from$$1) {
		default:
			refs$2(element, element.ref, null);
		case create$1:
			if (value) {
				refs$2(element, element.ref = value, element.owner);
			}
	}
}

/**
 * @type {object}
 */
var descriptors$1 = {
	/**
	 * @type {function}
	 */
	toString: {
		value: function () {
			return this.message
		}
	},
	/**
	 * @type {string}
	 */
	message: {
		get: function () {
			return this.message = delete this.message && (
				'Exception: ' + Object(this.error).toString() + '\n\n' +
				'The following error occurred in `\n' + this.componentStack + '` from "' + this.origin + '"'
			)
		}
	},
	/**
	 * @type {string}
	 */
	componentStack: {
		get: function () {
			this.componentStack = delete this.componentStack && (
				trace(this[element$1].host, '<' + display(this[element$1]) + '>\n')
			);
		}
	}
};

/**
 * @constructor
 * @param {object} element
 * @param {any} err
 * @param {string} origin
 */
var constructor$1 = extend(function Exception (element, err, origin) {
	this.error = err;
	this.origin = origin;
	this.bubbles = true;
	this[element$1] = element;
}, descriptors$1);

var prototype$1 = constructor$1[prototype];

/**
 * @throws object
 * @param {object} element
 * @param {any} err
 * @param {string} origin
 */
function raise (element, err, origin) {
	throw new constructor$1(element, err, origin)
}

/**
 * @param {object} element
 * @param {string} stack
 * @return {string}
 */
function trace (host, stack) {
	return host && host.host ? stack + trace(host.host, '<' + display(host) + '>\n') : stack
}

/**
 * @type {object}
 */
var descriptors$2 = {
  /**
   * @type {function}
   * @param {object} key
   * @return {boolean}
   */
  has: {
    value: function (key) {
      return this.uuid in key
    }
  },
  /**
   * @type {function}
   * @param {object} key
   * @return {any}
   */
  get: {
    value: function (key) {
      return key[this.uuid]
    }
  },
  /**
   * @type {function}
   * @param {object} key
   * @param {object} value
   * @return {object}
   */
  set: {
    value: function (key, value) {
      return define(key, this.uuid, {value: value, configurable: true}), this
    }
  }
};

/**
 * @constructor
 */
var constructor$2 = typeof WeakMap !== 'function' ? WeakMap : extend(function Registry () {
  define(this, 'uuid', {value: symbol('@@registry')});
}, descriptors$2);

var instance = new constructor$2();

/**
 * @param {(object|function)} key
 * @return {boolean}
 */
function has$1 (key) {
  return instance.has(key)
}

/**
 * @param {(object|function)} key
 * @return {*}
 */
function get (key) {
  return instance.get(key)
}

/**
 * @param {(object|function)} key
 * @param {*} value
 * @return {*}
 */
function set (key, value) {
  return instance.set(key, value)
}

/**
 * @type {object}
 */
var descriptors$3 = {
	/**
	 * @type {function}
	 * @param {object} state
	 * @param {function} callback
	 */
	setState: {
		value: function (state$$1, callback$$1) {
			this.enqueue(this[element$1], this, state$$1, callback$$1, state);
		}
	},
	/**
	 * @type {function}
	 * @param {function} callback
	 */
	forceUpdate: {
		value: function (callback$$1) {
			this.enqueue(this[element$1], this, object$1, callback$$1, force);
		}
	}
};

/**
 * @constructor
 * @param {object} props
 * @param {object} context
 */
var constructor$3 = extend(function component$$1 (props$$1, context$$1) {
	this.refs = {};
	this.state = {};
	this.props = props$$1;
	this.context = context$$1;
}, descriptors$3);

/**
 * @type {object}
 */
var prototype$2 = constructor$3[prototype];

/**
 * @constructor
 * @param {object} props
 * @param {object} context
 */
var pure = extend(function pure (props$$1, context$$1) {
	constructor$3.call(this, props$$1, context$$1);
}, assign({
	/**
	 * @type {function}
	 * @param {object} props
	 * @param {object} state
	 * @return {boolean}
	 */
	shouldComponentUpdate: {
		value: function (props$$1, state$$1) {
			return compare(this.props, props$$1) || compare(this.state, state$$1)
		}
	}
}, descriptors$3));

/**
 * @param {object} value
 * @return {function}
 */
function create$4 (value) {
	return extend$1(object(value), function constructor$$1 () {
		for (var i = 0, keys$$1 = keys(constructor$$1[prototype]); i < keys$$1.length; ++i) {
			this[keys$$1[i]] = bind(this[keys$$1[i]], this);
		}
	})
}

/**
 * @param {object} owner
 * @return {boolean}
 */
function valid$1 (owner) {
	return typeof owner[setState] === 'function' && typeof owner[forceUpdate] === 'function'
}

/**
 * @param {(function|object)} value
 * @param {object} descriptors
 * @return {object}
 */
function describe (value, descriptors$$1) {
	for (var key$$1 in value) {
		switch (key$$1) {
			case render:
			case getInitialState:
			case getChildContext:
			case getDerivedStateFromProps:
			case componentDidCatch:
			case componentDidMount:
			case componentDidUpdate:
			case componentWillMount:
			case componentWillUpdate:
			case componentWillUnmount:
			case componentWillReceiveProps:
			case shouldComponentUpdate:
				descriptors$$1[key$$1] = {value: value[key$$1], writable: true, enumerable: false, configurable: true};
			case displayName:
			case defaultProps:
			case propTypes:
			case contextTypes:
				break
			default:
				descriptors$$1[key$$1] = {value: value[key$$1], writable: true, enumerable: typeof value === 'function', configurable: true};
		}
	}

	return descriptors$$1
}

/**
 * @param {(function|object)} value
 * @param {function} constructor
 * @return {function}
 */
function extend$1 (value, constructor$$1) {
	if (value[memoize]) {
		return value[memoize]
	} else if (typeof value === 'function') {
		if (typeof value[render] !== 'function') {
			return extend$1(value[render] = value, function () {})
		}
	}

	define(value, memoize, {value: extend(constructor$$1, describe(value, {}), prototype$2)});

	return constructor$$1
}

/**
 * @param {function} type
 * @param {object?} proto
 * @return {function}
 */
function identity (type, proto) {
	if (type[memoize]) {
		return type[memoize]
	} else if (proto) {
		if (proto[render]) {
			if (valid$1(proto)) {
				return type
			} else {
				return extend(type, descriptors(type, prototype), prototype$2)
			}
		}
	}

	return extend$1(type)
}

/**
 * @param {object} host
 * @param {object} element
 * @return {object}
 */
function mount$1 (host, element) {
	var type = element.type;
	var props$$1 = element.props;
	var children$$1 = element.children;
	var context$$1 = host.state = host.state || {};
	var constructor$$1 = identity(type, type[prototype]);
	var owner = element.owner = constructor$4(element, constructor$$1, props$$1, context$$1);
	var state$$1 = owner.state = owner.state || {};

	element.ref = props$$1.ref;
	owner.props = props$$1;
	owner.context = context$$1;
	owner[element$1] = element;

	if (has$2(owner, getInitialState)) {
		state$$1 = owner.state = update$2(element, getInitialState, props$$1, state$$1, context$$1) || state$$1;
	}

	if (has$2(owner, componentWillMount)) {
		update$2(element, componentWillMount, props$$1, state$$1, context$$1);
	}

	if (thenable(state$$1 = owner.state)) {
		children$$1 = create$5({then: promise(element, owner, state$$1), catch: noop});
	} else {
		children$$1 = render$1(element, owner);
	}

	if (has$2(owner, getChildContext)) {
		element.context = merge$1(context$$1, update$2(element, Constnat.getChildContext, props$$1, state$$1, context$$1));
	}

	return children$$1
}

/**
 * @param {object} element
 * @param {object} children
 * @param {object}
 */
function finalize (element, children$$1) {
	try {
		return element
	} finally {
		if (has$2(element.owner, componentDidMount)) {
			mount$2(element, componentDidMount);
		}

		if (element.ref) {
			refs$1(element, element.ref);
			console.log(element.ref);
		}
	}
}

/**
 * @param {object} element
 */
function unmount$1 (element) {
	if (element.state = has$2(element.owner, componentWillUnmount)) {
		if (element.state = mount$2(element, componentWillUnmount)) {
			if (thenable(element.state)) {
				return element.state.catch(function (err) {
					raise(element, err, componentWillUnmount);
				})
			}
		}
	}
}

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {number} from
 */
function update$1 (host, parent$$1, element, snapshot, payload, from$$1) {
	try {
		var props$$1 = snapshot.props;
		var owner = element.owner;
		var value = owner.props;
		var state$$1 = owner.state;
		var context$$1 = owner.context;
		var current = element.state = payload !== object$1 ? merge$1(state$$1, payload) : state$$1;

		switch (from$$1) {
			case force:
				break
			case props:
				if (has$2(owner, componentWillReceiveProps)) {
					update$2(element, componentWillReceiveProps, props$$1, context$$1, current);
				}
			default:
				if (has$2(owner, shouldComponentUpdate)) {
					if (!update$2(element, shouldComponentUpdate, props$$1, current, context$$1)) {
						return void (owner.state = current)
					}
				}
		}

		if (has$2(owner, componentWillUpdate)) {
			update$2(element, componentWillUpdate, props$$1, current, context$$1);
		}

		switch (from$$1) {
			default:
				owner.state = current;
			case force:
				owner.props = props$$1;
		}

		if (has$2(owner, getChildContext)) {
			assign(element.context, update$2(element, getChildContext, props$$1, current, context$$1));
		}

		Reconcile.children(element, parent$$1, element.children, children(render$1(element, owner)));

		if (has$2(owner, componentDidUpdate)) {
			update$2(element, componentDidUpdate, value, state$$1, context$$1);
		}
	} catch (err) {
		raise(element, host, err);
	}
}

/**
 * @param {Element} element
 * @param {object?} value
 * @param {string} from
 */
function resolve (element, value, from$$1) {
	if (value) {
		switch (typeof value) {
			case 'object':
			case 'function':
				switch (from$$1) {
					case getInitialState:
					case getChildContext:
					case getDerivedStateFromProps:
					case shouldComponentUpdate:
					case componentWillUnmount:
						break
					default:
						enqueue(element, element.owner, value, state);
				}
		}
	}

	return value
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {(object|function)} value
 * @param {function?} callback
 * @param {number} from
 */
function enqueue (element, owner, value, callback$$1, from$$1) {
	if (value) {
		if (element) {
			switch (typeof value) {
				case 'function':
					return enqueue(element, owner, callback$1(element, owner, value), callback$$1, from$$1)
				case 'object':
					if (thenable(value)) {
						return dequeue(element, owner, value, callback$$1, from$$1)
					} else if (element.active < active) {
						assign(owner.state, value);
					} else if (element.active > active) {
						assign(element.state, value);
					} else {
						update$1(element, element, element.parent, element, value, from$$1);
					}
			}
		} else {
			owner.state = value;
		}

		if (callback$$1) {
			callback$1(element, owner, callback$$1);
		}
	}
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {Promise<object>} value
 * @param {function?} callback
 * @param {number} from
 */
function dequeue (element, owner, value, callback$$1, from$$1) {
	value.then(function (value) {
		if (fetchable(object(value))) {
			enqueue(element, owner, value.json(), callback$$1, from$$1);
		} else {
			enqueue(element, owner, value, callback$$1, from$$1);
		}
	}, function (err) {
		// TODO
		// if (Utility.thenable(element.children.type)) {
		// 	try {
		// 		owner[Constant.exception] = new Exception.constructor(element, err, Constant.setState)
		// 	} finally {
		// 		Lifecycle.callback(element, owner, callback)
		// 	}
		// } else {
		// 	Exception.raise(element, err, Constant.setState)
		// }
	});
}








/**
 * @param {object} element
 * @param {object} owner
 * @param {object} value
 * @return {function}
 */
function promise (element, owner, value) {
// TODO
// 	return function (resolve, reject) {
// 		queue(element, owner, value, Constant.state, function () {
// 			if (owner[Constant.exception]) {
// 				reject(owner[Constant.exception])
// 			} else {
// 				resolve(element.children.type.then === then && Lifecycle.render(element, owner))
// 			}
// 		})
// 	}
}

/**
 * @param {object} element
 * @param {function} type
 * @param {object} props
 * @param {object} context
 * @return {object}
 */
function constructor$4 (element, type, props$$1, context$$1) {
	try {
		return element.owner = new type(props$$1, context$$1)
	} catch (err) {
		throw err
		// Exception.raise(element, err, Constant.constructor)
	}
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {function} value
 */
function callback$1 (element, owner, value) {
	try {
		if (typeof value === 'function') {
			return value.call(owner, owner.state, owner.props, owner.context)
		}
	} catch (err) {
		throw err
		// Exception.raise(element, err, Constant.callback)
	}
}

/**
 * @param {object} element
 * @param {*?} value
 * @param {number?} from
 */
function refs$2 (element, value, owner) {
	try {
		switch (typeof value) {
			case 'function':
				return value.call(element, owner)
			case 'object':
				return object(value).current = owner
			default:
				if (valid$1(element.host.owner)) {
					object(element.host.owner[refs])[value] = owner;
				}
		}
	} catch (err) {
		throw err
		// Exception.raise(element.host, err, Constant.refs)
	}
}

/**
 * @param {object} element
 * @param {object} owner
 * @return {object}
 */
function render$1 (element, owner) {
	try {
		return from(owner.render(owner.props, owner.state, owner.context), key)
	} catch (err) {
		throw err
		// Exception.raise(element, err, Constant.render)
	}
}

/**
 * @param {object} element
 * @param {string} from
 */
function mount$2 (element, from$$1) {
	try {
		return resolve(element, element.owner[from$$1](), from$$1)
	} catch (err) {
		throw err
		// Exception.raise(element, err, from)
	}
}

/**
 * @param {object} element
 * @param {string} from
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @return {any}
 */
function update$2 (element, from$$1, props$$1, state$$1, context$$1) {
	if (from$$1 != componentDidUpdate) {
		element.active = update;
	}

	try {
		return resolve(element, element.owner[from$$1](props$$1, state$$1, context$$1), from$$1)
	} catch (err) {
		throw err
		// Exception.raise(element, err, from)
	} finally {
		element.active = active;
	}
}

/**
 * @param {object} element
 * @param {object} from
 * @param {object} value
 * @param {object} callback
 * @param {object} props
 * @param {object} state
 * @param {object} context
 */
function event$2 (element, from$$1, value, callback$$1, props$$1, state$$1, context$$1) {
	try {
		if (typeof callback$$1 === 'function') {
			resolve(element, callback$$1.call(owner, value, props$$1, state$$1, context$$1), from$$1);
		} else if (typeof callback$$1.handleEvent === 'function') {
			resolve(element, callback$$1.handleEvent(value, props$$1, state$$1, context$$1), from$$1);
		}
	} catch (err) {
		throw err
		// Exception.report(element, err, from + '(' + value.type + ')' + ':' + Element.display(callback.handleEvent || callback))
	}
}

/**
 * @param {object} owner
 * @param {string} from
 * @return {boolean}
 */
function has$2 (owner, from$$1) {
	return typeof owner[from$$1] === 'function'
}

/**
 * @this {object}
 * @param {object}
 */
function handle (event$$1) {
	dispatch(this.host, this, this.host.owner, event$$1, event$1(element, event$$1));
}

/**
 * @param {object} element
 * @param {object} host
 * @param {object} owner
 * @param {object} event
 * @param {*} calllback
 */
function dispatch (host, element, owner, event$$1, callback$$1) {
	if (callback$$1) {
		if (iterable(callback$$1)) {
			each(function (value) {
				dispatch(element, host, owner, event$$1, callback$$1);
			}, callback$$1);
		} else {
			event$2(host, event, event$$1, callback$$1, owner.props, owner.state, owner.context);
		}
	}
}

/**
 * @type {object}
 */
var descriptors$4 = define({
	/**
	 * @type {sybmol}
	 */
	constructor: {
		value: element$1
	},
	/**
	 * @type {function}
	 */
	handleEvent: {
		value: handle
	}
}, iterator, {value: iterator});

/**
 * @constructor
 * @param {object} element
 */
var constructor$5 = extend(function element (host, parent, element, owner) {
	this.key = element.key;
 	this.uuid = element.uuid;
 	this.type = element.type;
 	this.props = element.props;
 	this.children = element.children;
 	this.ref = null;
 	this.host = host;
 	this.xmlns = '';
 	this.state = null;
 	this.owner = owner;
 	this.parent = parent;
 	this.active = active;
}, descriptors$4);

/**
 * @type {object}
 */
var prototype$3 = constructor$5[prototype];

/**
 * @constructor
 * @param {number} uuid
 * @param {*} type
 * @param {Array<object>} children
 * @param {object} props
 * @param {*} key
 */
var struct = extend(function node$$1 (uuid, type, props$$1, children, key$$1) {
	this.key = key$$1;
 	this.uuid = uuid;
 	this.type = type;
 	this.props = props$$1;
 	this.children = children;
}, descriptors$4);

/**
 * @param {object} owner
 * @return {object}
 */
function target$1 (owner) {
	return new constructor$5(null, null, create$5('#root'), owner)
}

/**
 * @param {*} children
 * @param {*} target
 * @param {*} key
 * @return {object}
 */
function portal$1 (children, target, key$$1) {
	return create$5(target, {key: key$$1}, children)
}

/**
 * @param {number} type
 * @param {Array<object>} children
 * @param {number} key
 * @return {object}
 */
function iterable$2 (type, children, key$$1) {
	return new struct(type, '#iterable', object$1, children, key$$1)
}


/**
 * @param {(number|string)} children
 * @param {*} key
 * @return {object}
 */
function comment$1 (children, key$$1) {
	return new struct(comment, '#comment', object$1, children, key$$1)
}

/**
 * @param {(number|string)} children
 * @param {number} index
 * @return {object}
 */
function text$1 (children, index) {
	return new struct(text, '#text', object$1, children, hash(index))
}

/**
 * @param {number} index
 * @return {object}
 */
function empty$1 (index) {
	return new struct(empty, '#empty', object$1, '', hash(index))
}

/**
 * @param {*} a
 * @param {(object|*)?} b
 * @param {...*?}
 * @return {object}
 * @public
 */
function create$5 (a, b) {
	var index = 0;
	var length = arguments.length;
	var i = properties(b) ? 2 : 1;
	var size = length - i;
	var uuid = identity$1(a);
	var type = a;
	var props$$1 = i === 2 ? b : {};
	var children = [];
	var key$$1 = props$$1.key || key;
	var element = new struct(uuid, type, props$$1, children, key$$1);

	if (uuid === component) {
		if (size) {
			for (props$$1.children = size === 1 ? arguments[i++] : children = []; i < length; ++i) {
				children.push(arguments[i]);
			}
		}
		if (type[defaultProps]) {
			defaults(element, type[defaultProps]);
		}
	} else {
		if (size) {
			for (; i < length; ++i) {
				children[index] = from(arguments[i], index++);
			}
		} else if (has(props$$1, 'children')) {
			children[index] = from(arguments[i], index);
		}
		if (uuid < node) {
			return iterable$2(fragment, [empty$1(key), element, empty$1(key)], key$$1)
		}
	}

	return element
}

/**
 * @param {*} value
 * @param {number} index
 * @return {object}
 */
function from (value, index) {
	if (value != null) {
		if (value.constructor === element$1) {
			return value
		} else {
			switch (typeof value) {
				case 'number':
				case 'string':
					return text$1(value, index)
				case 'function':
				case 'object':
					if (iterable(value)) {
						if (index === key) {
							return iterable$2(fragment, value.map(from), hash(index))
						} else {
							return iterable$2(iterable$1, value.map(from), hash(index))
						}
					} else {
						return create$5(value, object$1)
					}
			}
		}
	}

	return empty$1(index)
}

/**
 * @param {*} value
 * @return {number}
 */
function identity$1 (value) {
	switch (typeof value) {
		case "string":
			return node
		case 'function':
			return component
		case 'number':
			return fragment
		case 'object':
			return thenable(value) ? thenable$1 : portal
	}
}

/**
 * @param {*} value
 * @return {boolean}
 */
function properties (value) {
	if (value) {
		if (typeof value === 'object') {
			switch (value.constructor) {
				case Object:
					return true
				case element$1:
					break
				default:
					return !iterable(value)
			}
		}
	}

	return false
}

/**
 * @param {*} value
 * @return {string}
 */
function display (value) {
	switch (typeof value) {
		case 'function':
			return display(value[displayName] || value.name)
		case 'object':
			if (valid$2(value)) {
				return display(value.type)
			}
		default:
			return value.toString()
	}
}

/**
 * @param {object} element
 * @param {object?} value
 * @return {object}
 */
function defaults (element, value) {
	if (value) {
		if (typeof value === 'function') {
			defaults(element, value.call(element.type, element.props));
		} else {
			for (var key$$1 in value) {
				if (element.props[key$$1] === undefined) {
					element.props[key$$1] = value[key$$1];
				}
			}
		}
	}

	return element
}

/**
 * @param {*} element
 * @return {boolean}
 */
function valid$2 (element) {
	return element != null && element.constructor === element$1
}

/**
 * @param {object} value
 * @param {...*?}
 * @return {object}
 */
function clone (element) {
	return defaults(create$5.apply(null, [element.type].concat([].slice.call(arguments, 1))), element.props)
}

/**
 * @param {object} element
 * @param {number} from
 * @return {object}
 */
function parent (element, from) {
	if (element.uuid < portal) {
		if (element.uuid !== -from) {
			return parent(element.parent, from, element, to)
		}
	}

	return element
}

/**
 * @param {object} element
 * @return {object}
 */
function node$1 (element) {
	if (element.uuid < node) {
		return node$1(element.children[node])
	}

	return element
}

/**
 * @param {Array<*>} element
 * @param {*} value
 * @return {*}
 */
function put (element, value) {
	return element.children.push(value), value
}

/**
 * @param {object} element
 * @return {Array<object>}
 */
function children (element) {
	return [element]
}

/**
 * @param {*} type
 * @return {function}
 */
function from$1 (type) {
	return create$5.bind(null, type)
}

var Children = {only: only, count: count, filter: filter, find: find, map: map, forEach: each$1, toArray: array$1};

/**
 * @throws {Error} if invalid element
 * @param {*} value
 * @return {object?}
 */
function only (value) {
	if (valid$2(value)) {
		return value
	} else {
		invariant('Expected to receive a single element!');
	}
}

/**
 * @memberof Children
 * @param {*} value
 * @return {number}
 */
function count (value) {
	var length = 0;

	each(function () {
		length++;
	}, value);

	return length
}

/**
 * @param {*} value
 * @param {function} callback
 * @param {*} that
 */
function filter (value, callback$$1, that) {
	if (value != null) {
		var children$$1 = [];

		each(function (v, i) {
			if (callback$$1.call(that, v, i, value)) {
				children$$1[i] = v;
			}
		}, value);

		return children$$1
	}
}

/**
 * @param {*} value
 * @param {function} callback
 * @param {*} that
 */
function find (value, callback$$1, that) {
	if (value != null) {
		var children$$1 = null;

		each(function (v, i) {
			if (callback$$1.call(that, v, i, value)) {
				return children$$1 = v
			}
		}, value);

		return children$$1
	}
}

/**
 * @param {*} value
 * @param {function} callback
 * @param {*} that
 * @return {Array<*>}
 */
function map (value, callback$$1, that) {
	if (value != null) {
		var children$$1 = [];

		each(function (v, i) {
			children$$1[i] = callback$$1.call(that, v, i, value);
		}, value);

		return children$$1
	}
}

/**
 * @param {*} value
 * @param {function} callback
 * @param {*} that
 */
function each$1 (value, callback$$1, that) {
	if (value != null) {
		each(function (v, i) {
			callback$$1.call(that, v, i, value);
		}, value);
	}
}

/**
 * @param {*} value
 * @return {Array<*>}
 */
function array$1 (value) {
	var children$$1 = [];

	each(function (v) {
		children$$1.push(v);
	}, value);

	return children$$1
}

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {number} index
 */
function update$3 (host, parent, element, snapshot, index) {
	if (element.type !== snapshot.type) {
		if (element.uuid !== thenable$1 || snapshot.uuid !== thenable$1) {
			return replace(host, parent, element, snapshot, index)
		}
	}

	switch (element.uuid) {
		case text:
		case empty:
		case comment:
			return content$2(element, element.children, snapshot.children)
		case component:
			return update$1(host, parent, element, snapshot, object$1, update)
		case thenable$1:
			return thenable$2(host, parent, element, index, element.type = snapshot.type)
		default:
			children$1(host, element, element.children, snapshot.children);
			props$3(element, element.props, snapshot.props);
	}
}

/**
 * @param {object} element
 * @param {(string|number)} a
 * @param {(string|number)} b
 */
function content$2 (element, a, b) {
	if (a != b) {
		content$1(element, element.children = b);
	}
}

/**
 * @param {object} element
 * @param {object} a
 * @param {object} b
 */
function props$3 (element, a, b) {
	if (a !== b) {
		props$2(element, object$2(a, element.props = b), element.xmlns, update);
	}
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object?}
 */
function object$2 (a, b) {
	var size = 0;
	var diff = {};

	for (var key$$1 in a) {
		if (!has(b, key$$1)) {
			diff[++size, key$$1] = null;
		}
	}

	for (var key$$1 in b) {
		var prev = a[key$$1];
		var next = b[key$$1];

		if (prev !== next) {
			if (typeof next !== 'object' || next === null) {
				diff[++size, key$$1] = next;
			} else if (next = object$2(prev || {}, next)) {
				diff[++size, key$$1] = next;
			}
		}
	}

	if (size) {
		return diff
	}
}

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {number} b
 */
function children$1 (host, parent, a, b) {
	var prev = parent;
	var next = parent;
	var alen = a.length;
	var blen = b.length;
	var aend = alen - 1;
	var bend = blen - 1;
	var min = bend > aend ? aend : bend;
	var max = bend > aend ? bend : aend;
	var idx = 0;
	var ptr = 0;

	// step 1, prefix/suffix
	outer: {
		while ((prev = a[idx]).key === (next = b[idx]).key) {
			update$3(host, parent, prev, next, idx);
			if (++idx > min) { break outer }
		}
		while ((prev = a[aend]).key === (next = b[bend]).key) {
			update$3(host, parent, a[max] = prev, next, bend);
			if (--aend, --bend, --max, idx > --min) { break outer }
		}
	}

	// step 2, mount/unmount/sort
	if (idx > aend++) {
		if (idx <= bend++) {
			if (bend < blen) do {
				mount(parent, a[--bend] = create$3(host, parent, b[bend], create$1), a[bend + 1]);
			} while (idx < bend) else do {
				mount(parent, a[--bend] = create$3(host, parent, b[bend], create$1), null);
			} while (idx < bend)
		}
	} else if ((ptr = idx) > bend++) {
		do { unmount(parent, destroy(parent, a[idx++])); } while (idx < aend)
		a.splice(ptr, aend - bend);
	} else {
		sort(host, parent, a, b, idx, aend, bend);
	}
}

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {number} idx
 * @param {number} aend
 * @param {number} bend
 */
function sort (host, parent, a, b, idx, aend, bend) {
	var aidx = idx;
	var bidx = idx;
	var akey = [];
	var bkey = [];
	var move = 0;
	var pos = bend;
	var child = parent;

	// step 3, map
	while (aidx < aend | bidx < bend) {
		if (aidx < aend) { akey[a[aidx].key] = aidx++; }
		if (bidx < bend) { bkey[b[bidx].key] = bidx++; }
	}

	// step 4, sort
	while (aidx > idx | bidx > idx) {
		if (aidx > idx) {
			if ((move = bkey[(child = a[--aidx]).key]) !== undefined) {
				update$3(host, parent, child, b[move], move);

				if (move < aidx & aidx !== 0) {
					mount(parent, child, a[move]);
					a.splice(aidx++, 1);
					a.splice(move, 0, child);
					continue
				}
			} else {
				unmount(parent, destroy(parent, child));
				a.splice(aidx, 1);
				if (--pos) { continue }
			}
		}

		if (bidx > idx) {
			if ((move = akey[(child = b[--bidx]).key]) === undefined) {
				mount(parent, child = create$3(host, parent, child, create$1), a[pos]);
				a.splice(pos, 0, child);
			} else {
				pos = move;
			}
		}
	}
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
function render$2 (element, target$$1, callback$$1) {
	commit$1(from(element, key), target(target$$1), create$1, callback$$1);
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
function hydrate (element, target$$1, callback$$1) {
	commit$1(from(element, key), target(target$$1), search$1, callback$$1);
}

/**
 * @param {object} target
 * @return {boolean}
 */
function unmount$2 (target$$1) {
	return has$1(target(target$$1)) && !render$2(null, target$$1)
}

/**
 * @param {*} parent
 * @param {*} element
 * @param {*?} target
 * @param {number} from
 * @param {function?} callback
 */
function commit$1 (element, target$$1, from$$1, callback$$1) {
	if (has$1(target$$1)) {
		update$4(get(target$$1), element);
	} else if (valid(target$$1, owner$1)) {
		mount$3(target$1(target$$1), element, target$$1, from$$1);
	} else {
		invariant('Invalid target!');
	}

	if (callback$$1) {
		Lifecycle.callback(element, callback$$1);
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} target
 * @param {number} from
 */
function mount$3 (parent$$1, element, target$$1, from$$1) {
	prepare(target$$1, set(target$$1, parent$$1));
	append$1(parent$$1, put(parent$$1, create$3(parent$$1, parent$$1, element, from$$1)));
}

/**
 * @param {object} element
 * @param {object} snapshot
 */
function update$4 (element, snapshot) {
	children$1(element, element, element.children, children(snapshot));
}

/**
 * @param {any} value
 * @return {object?}
 */
function find$1 (value) {
	if (value) {
		if (Component.valid(value)) {
			return find$1(node$1(value[element$1]))
		} else if (valid$2(value)) {
			if (element.active > idle) {
				return find$1(node$1(value))
			}
		} else if (valid(value, owner$1)) {
			return owner$2(value)
		}
	}
}

// export {create as createContext} from './src/Context.js'
// export {create as createRef, forward as forwardRef} from './src/Refs.js'

export { create$5 as h, create$5 as createElement, portal$1 as createPortal, comment$1 as createComment, clone as cloneElement, valid$2 as isValidElement, from$1 as createFactory, constructor$3 as Component, pure as PureComponent, create$4 as createClass, fragment as Fragment, Children, render$2 as render, hydrate, unmount$2 as unmountComponentAtNode, find$1 as findDOMNode };
