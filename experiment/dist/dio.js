/*
 *  ___ __ __
 * (   (  /  \
 *  ) ) )( () )
 * (___(__\__/
 *
 * a javascript library for building user interfaces
 */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	} else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	} else {
		window.dio = factory(window);
	}
}(function (global) {

	'use strict';

	/**
	 * ## Constants
	 */
	var noop = function () {};
	var array = [];
	var object = {children: array};
	var server = global.global === global;
	var browser = global.window === global;
	var Promise = global.Promise || noop;
	var requestAnimationFrame = global.requestAnimationFrame || setTimeout;
	var requestIdleCallback = global.requestIdleCallback || setTimeout;
	var body = null;
	var svg = 'http://www.w3.org/2000/svg';
	var xlink = 'http://www.w3.org/1999/xlink';
	var math = 'http://www.w3.org/1998/Math/MathML';
	var shared = new Tree(0);
	
	/**
	 * ## Element Flag
	 *
	 * 1: text
	 * 2: element
	 * 3: composit
	 * 4: fragment
	 * 5: error
	 *
	 * ## Element Group
	 *
	 * 0: Element
	 * 1: Function
	 * 2: Class
	 *
	 * ## Element Shape
	 *
	 * tag: node tag {String}
	 * type: node type {Function|Class|String}
	 * props: node properties {Object?}
	 * attrs: node attributes {Object?}
	 * children: node children {Array<Tree>}
	 * key: node key {Any}
	 * flag: node flag {Number}
	 * xmlns: node xmlns namespace {String?}
	 * owner: node component {Component?}
	 * node: node DOM reference {Node?}
	 * group: node ground {Number}
	 * async: node work state {Number} 0: ready, 1:blocked, 2:pending
	 * yield: coroutine {Function?}
	 * host: host component
	 *
	 * ## Component Shape
	 *
	 * this: current tree {Tree?}
	 * async: component async, tracks async lifecycle methods flag {Number}
	 *
	 * _props: previous props {Object}
	 * _state: previous state {Object}
	 * _pending: pending state {Object}
	 *
	 * props: current props {Object}
	 * state: current state {Object}
	 * refs: refs {Object?}
	 * setState: method {Function}
	 * forceUpdate: method {Function}
	 */
	
	/**
	 * Component
	 *
	 * @param {Object?} _props
	 */
	function Component (_props) {
		var props = _props;
		var state = this.state;
	
		this.refs = null;
		this.this = null;
		this.async = 0;
	
		// props
		if (this.props === void 0) {
			if (props === object || props === void 0 || props === null) {
				props = {};
			}
			this.props = props;
		}
	
		// state
		if (state === void 0) {
			if (this.getInitialState !== void 0) {
				state = getInitialState(dataBoundary(shared, this, 1, props), this);
			} else {
				state = {};
			}
			this.state = state;
		}
	
		this._props = props;
		this._state = state;
		this._pending = state;
	}
	
	/**
	 * Component Prototype
	 *
	 * @type {Object}
	 */
	var ComponentPrototype = {
		setState: {value: setState},
		forceUpdate: {value: forceUpdate},
		UUID: {value: 2}
	};
	
	Component.prototype = Object.create(null, ComponentPrototype);
	ComponentPrototype.UUID.value = 1;
	
	/**
	 * Extend Class
	 *
	 * @param {Function} type
	 * @param {Object} prototype
	 */
	function extendClass (type, prototype) {
		if (prototype.constructor !== type) {
			Object.defineProperty(prototype, 'constructor', {value: type});
		}
	
		Object.defineProperties(prototype, ComponentPrototype);
	}
	
	/**
	 * setState
	 *
	 * @param {Object} newer
	 * @param {Function?} callback
	 */
	function setState (newer, callback) {
		var owner = this;
	
		if (newer === void 0 || newer === null) {
			return;
		}
	
		var state = owner.state;
		var type = newer.constructor;
	
		if (type === Function) {
			newer = callbackBoundary(shared, owner, newer, state, 0);
	
			if (newer === void 0 || newer === null) {
				return;
			}
	
			type = newer.constructor;
		}
	
		if (type === Promise) {
			newer.then(function (value) {
				owner.setState(value, callback);
			});
		} else {
			var older = owner._state = {};
	
			owner._pending = newer;
	
			// cache current state
			for (var name in state) {
				older[name] = state[name];
			}
	
			// update current state
			for (var name in newer) {
				state[name] = newer[name];
			}
	
			owner.forceUpdate(callback);
		}
	}
	
	/**
	 * forceUpdate
	 *
	 * @param {Function?} callback
	 */
	function forceUpdate (callback) {
		var owner = this;
		var older = owner.this;
	
		if (older === null || older.node === null || older.async !== 0 || owner.async !== 0) {
			// this is to avoid maxium call stack when componentDidUpdate
			// introduces an infinite render loop
			if (older.async === 3) {
				requestAnimationFrame(function () {
					owner.forceUpdate(callback);
				});
			}
			return;
		}
	
		patch(older, older, 3);
	
		if (callback !== void 0 && typeof callback === 'function') {
			callbackBoundary(older, owner, callback, owner.state, 1);
		}
	}
	
	/**
	 * Should Update
	 *
	 * @param  {Tree} older
	 * @param  {Tree} _newer
	 * @param  {Number} group
	 * @return {Boolean}
	 */
	function shouldUpdate (older, _newer, group) {
		var type = older.type;
		var owner = older.owner;
		var nextProps = _newer.props;
		var nextState;
	
		if (owner === null || older.async !== 0) {
			return false;
		}
	
		older.async = 1;
	
		if (group > 1) {
			owner._props = older.props;
			nextState = owner._pending;
		} else {
			nextState = nextProps;
		}
	
		if (group < 3) {
			if (type.propTypes !== void 0) {
				propTypes(owner, type, nextProps);
			}
	
			if (owner.componentWillReceiveProps !== void 0) {
				dataBoundary(older, owner, 0, nextProps);
			}
	
			if (type.defaultProps !== void 0) {
				merge(type.defaultProps, nextProps === object ? (nextProps = {}) : nextProps);
			}
		}
	
		if (
			owner.shouldComponentUpdate !== void 0 &&
			updateBoundary(older, owner, 0, nextProps, nextState) === false
		) {
			older.async = 0;
			return false;
		}
	
		if (group < 3) {
			(group > 1 ? owner : older).props = nextProps;
		}
	
		if (owner.componentWillUpdate !== void 0) {
			updateBoundary(older, owner, 1, nextProps, nextState);
		}
	
		return true;
	}
	
	/**
	 * Get Initial State
	 *
	 * @param  {Object} state
	 * @param  {Component} owner
	 * @return {Object}
	 */
	function getInitialState (state, owner) {
		if (state === null || state === void 0) {
			return {};
		}
		if (state.constructor === Promise) {
			owner.async = 1;
			state.then(function (value) {
				owner.async = 0;
				owner.setState(value);
			});
			return {};
		}
		return state;
	}
	
	/**
	 * Get Initial Static
	 *
	 * @param  {Function} owner
	 * @param  {Function} fn
	 * @param  {String} type
	 * @param  {Object} props
	 * @return {Object?}
	 */
	function getInitialStatic (owner, fn, type, props) {
		if (typeof fn === 'object') {
			return fn;
		}
	
		var obj = callbackBoundary(shared, owner, fn, props, 0);
	
		if (obj !== void 0 && obj !== null) {
			Object.defineProperty(owner, type, {value: obj});
		}
	}
	
	/**
	 * Did Update
	 *
	 * @param {Tree} older
	 */
	function didUpdate (older) {
		var owner = older.owner;
	
		older.async = 3;
		updateBoundary(older, owner, 2, owner._props, owner._state);
		older.async = 0;
	}
	
	/**
	 * PropTypes
	 *
	 * @param {Component} owner
	 * @param {Function} type
	 * @param {Object} props
	 */
	function propTypes (owner, type, props) {
		var display = type.name;
		var types = type.propTypes;
	
		try {
			for (var name in types) {
				var valid = types[name];
				var result = valid(props, name, display);
	
				if (result) {
					console.error(result);
				}
			}
		} catch (err) {
			errorBoundary(err, shared, owner, 2, valid);
		}
	}
	
	/**
	 * Element
	 *
	 * @param  {String|Function} _type
	 * @param  {...} _props
	 * @return {Tree}
	 */
	function element (_type, _props) {
		var type = _type;
		var props = _props !== void 0 ? _props : null;
		var length = arguments.length;
		var size = 0;
		var index = 0;
		var offset = 0;
		var i = 2;
		var group = 0;
		var newer = new Tree(2);
		var children;
		var proto;
	
		if (props !== null) {
			switch (props.constructor) {
				case Object: {
					if (props.key !== void 0) {
						newer.key = props.key;
					}
					if (props.xmlns !== void 0) {
						newer.xmlns = props.xmlns;
					}
	
					offset++;
					newer.props = props;
	
					break;
				}
				case Array: {
					size = props.length;
				}
				default: {
					props = object;
					i = 1;
				}
			}
		} else {
			offset++;
		}
	
		switch (type.constructor) {
			case String: {
				newer.tag = type;
				newer.attrs = props;
				break;
			}
			case Function: {
				if ((proto = type.prototype) !== void 0 && proto.render !== void 0) {
					group = newer.group = 2;
				} else {
					group = newer.group = 1;
				}
				break;
			}
		}
	
		newer.type = type;
	
		if (length - offset > 1) {
			children = new Array(size);
	
			if (group < 1) {
				for (newer.children = children; i < length; i++) {
					index = push(newer, index, arguments[i]);
				}
			} else {
				if ((props = newer.props) === null || props === object) {
					props = newer.props = {};
				}
	
				for (newer.children = children; i < length; i++) {
					index = pull(newer, index, arguments[i]);
				}
	
				props.children = children;
				newer.children = array;
			}
		}
	
		return newer;
	}
	
	/**
	 * Push Children
	 *
	 * @param  {Tree} newer
	 * @param  {Number} index
	 * @param  {Any} value
	 * @return {Number}
	 */
	function push (newer, index, value) {
		var children = newer.children;
		var child;
		var length;
	
		if (value === null || value === void 0) {
			child = text('');
		} else if (value.group !== void 0) {
			if (newer.keyed === false && value.key !== null) {
				newer.keyed = true;
			}
			child = value;
		} else {
			switch (typeof value) {
				case 'function': {
					child = element(value, null);
					break;
				}
				case 'object': {
					if ((length = value.length) !== void 0) {
						for (var j = 0, i = index; j < length; j++) {
							i = push(newer, i, value[j]);
						}
						return i;
					} else {
						switch (value.constructor) {
							case Date: child = text(value+''); break;
							case Object: child = stringify(value); break;
							default: child = text('');
						}
					}
					break;
				}
				default: {
					child = text(value);
				}
			}
		}
	
		children[index] = child;
	
		return index + 1;
	}
	
	/**
	 * Pull Children
	 *
	 * @param  {Tree} newer
	 * @param  {Number} index
	 * @param  {Any} value
	 * @return {Number}
	 */
	function pull (newer, index, value) {
		var children = newer.children;
	
		if (value !== null && typeof value === 'object') {
			var length = value.length;
	
			if (length !== void 0) {
				for (var j = 0, i = index; j < length; j++) {
					i = pull(newer, i, value[j]);
				}
				return i;
			}
		}
	
		children[index] = value;
	
		return index + 1;
	}
	
	/**
	 * Text
	 *
	 * @param  {String|Number|Boolean} value
	 * @param  {Tree}
	 * @return {Tree}
	 */
	function text (value) {
		var newer = new Tree(1);
	
		newer.type = newer.tag = '#text';
		newer.children = (value === true || value === false) ? '' : value;
	
		return newer;
	}
	
	/**
	 * Fragment
	 *
	 * @param  {Array<Tree>|Tree|Function} children
	 * @return {Tree}
	 */
	function fragment (children) {
		var newer = element('div', null, children);
	
		newer.flag = 4;
	
		return newer;
	}
	
	/**
	 * Compose
	 *
	 * @param  {Tree} child
	 * @return {Tree}
	 */
	function compose (child) {
		var newer = new Tree(3);
	
		newer.children = [child];
	
		return newer;
	}
	
	/**
	 * Stringify
	 *
	 * @param {Object} value
	 * @return {Tree}
	 */
	function stringify (value) {
		try {
			return element('pre', null, JSON.stringify(value, null, 2));
		} catch (err) {
			return text('');
		}
	}
	
	/**
	 * Copy
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Boolean} deep
	 */
	function copy (older, newer, deep) {
		older.flag = newer.flag;
		older.tag = newer.tag;
		older.ref = newer.ref;
		older.node = newer.node;
		older.attrs = newer.attrs;
		older.xmlns = newer.xmlns;
		older.async = newer.async;
		older.keyed = newer.keyed;
		older.children = newer.children;
	
		if (deep === true) {
			older.parent = newer.parent;
			older.props = newer.props;
			older.owner = newer.owner;
			older.yield = newer.yield;
			older.group = newer.group;
			older.type = newer.type;
			older.host = newer.host;
			older.key = newer.key;
		}
	}
	
	/**
	 * Tree
	 *
	 * @param {Number} flag
	 */
	function Tree (flag) {
		this.flag = flag;
		this.tag = null;
		this.key = null;
		this.ref = null;
		this.type = null;
		this.node = null;
		this.host = null;
		this.root = null;
		this.group = 0;
		this.async = 0;
		this.props = object;
		this.attrs = object;
		this.xmlns = null;
		this.owner = null;
		this.yield = null;
		this.keyed = false;
		this.parent = null;
		this.children = array;
	}
	
	/**
	 * Prototype
	 *
	 * @type {Object}
	 */
	var TreePrototype = Tree.prototype = element.prototype = Object.create(null);
	
	/**
	 * Data Boundary
	 *
	 * @param  {Tree} older
	 * @param  {Component} owner
	 * @param  {Number} type
	 * @param  {Object} props
	 * @return {Object?}
	 */
	function dataBoundary (older, owner, type, props) {
		try {
			switch (type) {
				case 0: return returnBoundary(older, owner.componentWillReceiveProps(props), owner, null, true);
				case 1: return owner.getInitialState(props);
			}
		} catch (err) {
			errorBoundary(err, older, owner, 0, type);
		}
	}
	
	/**
	 * Update Boundary
	 *
	 * @param  {Tree} older
	 * @param  {Component} owner
	 * @param  {Number} type
	 * @param  {Object} props
	 * @param  {Object} state
	 * @return {Boolean?}
	 */
	function updateBoundary (older, owner, type, props, state) {
		try {
			switch (type) {
				case 0: return owner.shouldComponentUpdate(props, state);
				case 1: return returnBoundary(older, owner.componentWillUpdate(props, state), owner, null, true);
				case 2: return returnBoundary(older, owner.componentDidUpdate(props, state), owner, null, false);
			}
		} catch (err) {
			errorBoundary(err, older, owner, 1, type);
		}
	}
	
	/**
	 * Render Boundary
	 *
	 * @param  {Tree} older
	 * @param  {Number} group
	 * @return {Tree}
	 */
	function renderBoundary (older, group) {
		try {
			if (older.yield !== null) {
				return older.yield();
			}
			switch (group) {
				case 1: return older.type(older.props);
				case 2: case 3: return older.owner.render(older.owner.props, older.owner.state);
			}
		} catch (err) {
			return errorBoundary(err, older, group > 1 ? older.owner : older.type, 3, group);
		}
	}
	
	/**
	 * Mount Boundary
	 *
	 * @param {Tree} older
	 * @param {Component} owner
	 * @param {Node} node
	 * @param {Number} type
	 */
	function mountBoundary (older, owner, node, type) {
		try {
			switch (type) {
				case 0: return returnBoundary(older, owner.componentWillMount(node), owner, null, false);
				case 1: return returnBoundary(older, owner.componentDidMount(node), owner, null, true);
				case 2: return owner.componentWillUnmount(node);
			}
		} catch (err) {
			errorBoundary(err, older, owner, 4, type);
		}
	}
	
	/**
	 * Callback Boundary
	 *
	 * @param {Tree} older
	 * @param {Function} callback
	 * @param {Component} owner
	 * @param {Object|Node} param
	 */
	function callbackBoundary (older, owner, callback, param, type) {
		try {
			if (type === 0) {
				return callback.call(owner, param);
			} else {
				return returnBoundary(older, callback.call(owner, param), owner, null, false);
			}
		} catch (err) {
			errorBoundary(err, older, owner, 2, callback);
		}
	}
	
	/**
	 * Events Boundary
	 *
	 * @param {Tree} older
	 * @param {Component} owner
	 * @param {Function} fn
	 * @param {Event} e
	 */
	function eventBoundary (older, owner, fn, e) {
		try {
			return returnBoundary(older, fn.call(owner, e), owner, e, true);
		} catch (err) {
			errorBoundary(err, older, owner, 5, fn);
		}
	}
	
	/**
	 * Return Boundary
	 *
	 * @param {Tree} older
	 * @param {(Object|Promise)?} state
	 * @param {Component} owner
	 * @param {Event?} e
	 * @param {Boolean} sync
	 */
	function returnBoundary (older, state, owner, e, sync) {
		if (state === void 0 || state === null || older.group < 2) {
			return;
		}
	
		if (sync === true) {
			return owner.setState(state);
		}
	
		requestIdleCallback(function () {
			owner.setState(state);
		});
	}
	
	/**
	 * Error Boundary
	 *
	 * @param  {Error|String} message
	 * @param  {Tree} older
	 * @param  {Component} owner
	 * @param  {Number} type
	 * @param  {Number|Function} from
	 * @return {Tree?}
	 */
	function errorBoundary (message, older, owner, type, from) {
		var component = '#unknown';
		var location;
		var newer;
	
		try {
			location = errorLocation(type, from) || component;
	
			if (owner !== null) {
				if (owner.componentDidThrow !== void 0) {
					newer = owner.componentDidThrow({location: location, message: message});
				}
	
				component = typeof owner === 'function' ? owner.name : owner.constructor.name;
			}
		} catch (err) {
			message = err;
			location = 'componentDidThrow';
		}
	
		errorMessage(component, location, message instanceof Error ? message.stack : message);
	
		if (type === 3 || type === 5) {
			return shape(newer, older, browser);
		}
	}
	
	/**
	 * Error Location
	 *
	 * @param  {Number} type
	 * @param  {Number|Function} from
	 * @return {String?}
	 */
	function errorLocation (type, from) {
		if (typeof from === 'function') {
			return from.name;
		}
	
		switch (type) {
			case 0: {
				switch (from) {
					case 0: return 'componentWillReceiveProps';
					case 1: return 'getInitialState';
				}
				break;
			}
			case 1: {
				switch (from) {
					case 0: return 'shouldComponentUpdate';
					case 1: return 'componentWillUpdate';
					case 2: return 'componentDidUpdate';
				}
				break;
			}
			case 3: {
				return 'render';
				break;
			}
			case 4: {
				switch (from) {
					case 0: return 'componentWillMount';
					case 1: return 'componentDidMount';
					case 2: return 'componentWillUnmount';
				}
				break;
			}
			case 5: {
				return 'event';
			}
		}
	}
	
	/**
	 * Error Message
	 *
	 * @param  {String} component
	 * @param  {String} location
	 * @param  {String} message
	 */
	function errorMessage (component, location, message) {
		console.error(
			message + '\n\n  ^^ Error caught in ' + '"' + component + '"' +
			' from "' + location + '" \n'
		);
	}
	
	/**
	 * Whitelist
	 *
	 * @param  {String} name
	 * @return {Number}
	 */
	function whitelist (name) {
		switch (name) {
			case 'class':
			case 'className': return 1;
	
			case 'width':
			case 'height': return 3;
	
			case 'xlink:href': return 4;
	
			case 'defaultValue': return 5;
	
			case 'id':
			case 'selected':
			case 'hidden':
			case 'checked':
			case 'value': return 6;
	
			case 'innerHTML': return 10;
	
			case 'style': return 20;
	
			case 'ref': return 30;
			case 'key': case 'children': return 31;
	
			default: return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 ? 21 : 0;
		}
	}
	
	/**
	 * Attribute [Mount]
	 *
	 * @param {Tree} newer
	 * @param {String?} xmlns
	 */
	function attribute (newer, xmlns) {
		var attrs = newer.attrs;
		var node = newer.node;
	
		for (var name in attrs) {
			var type = whitelist(name);
	
			if (type < 31) {
				var value = attrs[name];
	
				if (type === 30) {
					refs(newer, value, 2);
				} else if (type < 20) {
					if (value !== void 0 && value !== null) {
						setAttribute(type, name, value, xmlns, node);
					}
				} else if (type > 20) {
					setEvent(newer, name, value, 1);
				} else {
					setStyle(newer, newer, 0);
				}
			}
		}
	}
	
	/**
	 * Attributes [Reconcile]
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 */
	function attributes (older, newer) {
		var node = older.node;
		var prevs = older.attrs;
		var attrs = newer.attrs;
	
		if (prevs === attrs && attrs === object) {
			return;
		}
	
		var xmlns = older.xmlns;
	
		// old attributes
		for (var name in prevs) {
			var type = whitelist(name);
	
			if (type < 31) {
				var next = attrs[name];
	
				if (next === null || next === void 0) {
					if (type < 20) {
						setAttribute(type, name, next, xmlns, node);
					} else if (type > 20) {
						setEvent(older, name, next, 0);
					}
				} else if (type === 30 && next !== (prev = prevs[name])) {
					refs(older, prev, 0);
				}
			}
		}
	
		// new attributes
		for (var name in attrs) {
			var type = whitelist(name);
	
			if (type < 31) {
				var next = attrs[name];
	
				if (type === 30) {
					refs(older, next, 2);
				} else {
					var prev = prevs[name];
	
					if (next !== prev && next !== null && next !== void 0) {
						if (type < 20) {
							setAttribute(type, name, next, xmlns, node);
						} else if (type > 20) {
							setEvent(older, name, next, 2);
						} else {
							setStyle(older, newer, 1);
						}
					}
				}
			}
		}
	
		older.attrs = attrs;
	}
	
	/**
	 * Refs
	 *
	 * @param  {Tree} older
	 * @param  {Function|String} value
	 * @param  {Number} type
	 */
	function refs (older, value, type) {
		var host = older.host;
		var stateful = false;
	
		if (host !== null) {
			var owner = host.owner;
	
			if (owner !== null && host.group > 1) {
				stateful = true;
			}
		}
	
		if (stateful === true && owner.refs === null) {
			owner.refs = {};
		}
	
		if ((older.ref = value) === void 0 || value === null) {
			return;
		}
	
		var node = type > 0 ? older.node : null;
	
		switch (value.constructor) {
			case Function: {
				callbackBoundary(older, owner, value, node, 2);
				break;
			}
			case String: {
				if (stateful === true) {
					owner.refs[value] = node;
				}
				break;
			}
		}
	}
	
	/**
	 * Merge
	 *
	 * @param {Object} source
	 * @param {Object} props
	 */
	function merge (source, props) {
		for (var name in source) {
			if (props[name] === void 0) {
				props[name] = source[name];
			}
		}
	}
	
	/**
	 * Create
	 *
	 * @param  {Tree} newer
	 * @param  {Tree} parent
	 * @param  {Tree} sibling
	 * @param  {Number} action
	 * @param  {Tree?} _host
	 * @param  {String?} _xmlns
	 */
	function create (newer, parent, sibling, action, _host, _xmlns) {
		var host = _host;
		var xmlns = _xmlns;
		var group = newer.group;
		var flag = newer.flag;
		var type = 2;
		var node = null;
		var skip;
		var owner;
		var temp;
		var tag;
	
		// resolve namespace
	 	if (flag !== 1 && newer.xmlns !== null) {
	 		xmlns = newer.xmlns;
	 	}
	
	 	// cache host
	 	if (host !== shared) {
			newer.host = host;
	 	}
	
	 	if (group > 0) {
	 		if (group > 1) {
	 			host = newer;
	 		}
	
	 		temp = extract(newer, true);
	 		flag = temp.flag;
	 		owner = newer.owner;
	 	}
	
	 	switch (flag) {
	 		case 1: {
	 			node = newer.node = createTextNode(newer.children);
	 			type = 1;
	 			break;
	 		}
	 		case 3: {
	 			create(temp = temp.children[0], parent, sibling, action, newer, _xmlns);
	 			newer.node = temp.node;
	 			break;
	 		}
	 		default: {
	 			// auto namespace svg & math roots
	 			switch ((tag = newer.tag)) {
	 				case 'svg': xmlns = svg; break;
	 				case 'math': xmlns = math; break;
	 			}
	
	 			node = createElement(tag, newer, host, xmlns);
	
	 			if (newer.flag === 5) {
	 				create(node, newer, sibling, action, host, xmlns);
	 				copy(newer, node, false);
	 				return;
	 			}
	
	 			newer.node = node;
	
	 			var children = newer.children;
	 			var length = children.length;
	
	 			if (length > 0) {
	 				for (var i = 0, child; i < length; i++) {
	 					// hoisted
	 					if ((child = children[i]).node !== null) {
	 						copy(child = children[i] = new Tree(child.flag), child, false);
	 					}
	
	 					create(child, newer, sibling, 1, host, xmlns);
	 				}
	 			}
	 		}
	 	}
	
		if (group > 0 && owner.componentWillMount !== void 0) {
			mountBoundary(newer, owner, node, 0);
		}
	
		newer.parent = parent;
	
		if (node !== null) {
			switch (action) {
				case 1: appendChild(newer, parent); break;
				case 2: insertBefore(newer, sibling, parent); break;
				case 3: skip = remove(sibling, newer, parent); break;
			}
	
			if (type !== 1) {
				attribute(newer, xmlns, node);
			}
		}
	
		if (group > 0 && skip !== true && owner.componentDidMount !== void 0) {
			mountBoundary(newer, owner, node, 1);
		}
	}
	
	/**
	 * Extract
	 *
	 * @param  {Tree} older
	 * @param  {Boolean} abstract
	 * @return {Tree}
	 */
	function extract (older, abstract) {
		var type = older.type;
		var props = older.props;
		var children = older.children;
		var group = older.group;
		var length = children.length;
		var defaults = type.defaultProps;
		var types = type.propTypes;
		var owner;
		var newer;
		var proto;
		var UUID;
	
		if (props === object) {
			props = {};
		}
	
		if (length !== 0) {
			props.children = children;
		}
	
		if (defaults !== void 0) {
			merge(getInitialStatic(type, defaults, 'defaultProps', props), props);
		}
	
		if (types !== void 0) {
			getInitialStatic(type, types, 'propTypes', props);
		}
	
		if (group > 1) {
			UUID = (proto = type.prototype).UUID;
	
			if (UUID === 2) {
				owner = new type(props);
			} else {
				if (UUID !== 1) {
					extendClass(type, proto);
				}
	
				owner = new type(props);
				Component.call(owner, props);
			}
	
			older.owner = owner;
	
			if (owner.async === 0) {
				older.async = 1;
				newer = renderBoundary(older, group);
				older.async = 0;
			}
	
			newer = shape(newer, owner.this = older, abstract);
		} else {
			newer = (older.owner = type, shape(renderBoundary(older, group), older, abstract));
		}
	
		older.tag = newer.tag;
		older.flag = newer.flag;
		older.node = newer.node;
		older.attrs = newer.attrs;
		older.xmlns = newer.xmlns;
		older.children = newer.children;
	
		return newer;
	}
	
	/**
	 * Shape
	 *
	 * @param  {Any} value
	 * @param  {Tree?} older
	 * @param  {Boolean} abstract
	 * @return {Tree}
	 */
	function shape (value, older, abstract) {
		var newer = (value !== null && value !== void 0) ? value : text('');
	
		if (newer.group === void 0) {
			switch (typeof newer) {
				case 'function': {
					if (older === null) {
						newer = element(newer, older);
					} else if (older.group === 2) {
						newer = element(newer, older.owner.props);
					} else {
						newer = element(newer, older.props);
					}
					break;
				}
				case 'string':
				case 'number':
				case 'boolean': {
					return text(newer);
				}
				case 'object': {
					switch (newer.constructor) {
						case Promise: {
							if (older === null || older.flag === 0) {
								return text('');
							} else {
								return resolve(older, newer);
							}
						}
						case Array: {
							return fragment(newer); break;
						}
						case Date: {
							return text(newer+''); break;
						}
						case Object: {
							return stringify(newer); break;
						}
						default: {
							if (newer.next !== void 0 && older !== null) {
								newer = coroutine(older, newer);
							} else {
								return text('');
							}
						}
					}
					break;
				}
			}
		}
	
		if (newer.group > 0 && abstract === true) {
			return compose(newer);
		} else {
			return newer;
		}
	}
	
	/**
	 * Resolve
	 *
	 * @param {Tree} older
	 * @param {Promise} pending
	 */
	function resolve (older, pending) {
		older.async = 2;
	
		pending.then(function (value) {
			var newer = value;
			if (older.node === null) {
				return;
			}
	
			older.async = 0;
			newer = shape(newer, older, true);
	
			if (older.tag !== newer.tag) {
				exchange(older, newer, false);
			} else {
				patch(older, newer, 0);
			}
		});
	
		return older.node !== null ? older : text('');;
	}
	
	/**
	 * Coroutine
	 *
	 * @param  {Tree} older
	 * @param  {Generator} generator
	 * @return {Tree}
	 */
	function coroutine (older, generator) {
		var previous;
		var current;
	
		older.yield = function () {
			var supply = generator.next(previous);
			var next = supply.value;
	
			if (supply.done === true) {
				current = shape(next !== void 0 && next !== null ? next : previous, older, true);
			} else {
				current = shape(next, older, true);
			}
	
			return previous = current;
		};
	
		return shape(renderBoundary(older, older.group), older, true);
	}
	
	/**
	 * Fill
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} length
	 */
	function fill (older, newer, length) {
		var children = newer.children;
		var host = older.host;
	
		for (var i = 0, child; i < length; i++) {
			create(child = children[i], older, shared, 1, host, null);
		}
	
		older.children = children;
	}
	
	/**
	 * Animate
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {tree} parent
	 * @param  {Promise} pending
	 * @param  {Node} node
	 */
	function animate (older, newer, parent, pending) {
		pending.then(function () {
			if (parent.node === null || older.node === null) {
				return;
			}
	
			if (newer === shared) {
				removeChild(older, parent);
			} else if (newer.node !== null) {
				replaceChild(older, newer, parent);
	
				if (newer.group > 0 && newer.owner.componentDidMount !== void 0) {
					mountBoundary(newer, newer.owner, newer.node, 1);
				}
			}
	
			unmount(older, true);
		});
	}
	
	/**
	 * Remove
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Tree} parent
	 * @return {Tree}
	 */
	function remove (older, newer, parent) {
		if (older.group > 0 && older.owner.componentWillUnmount !== void 0) {
			var pending = mountBoundary(older, older.owner, older.node, 2);
	
			if (pending !== void 0 && pending !== null && pending.constructor === Promise) {
				animate(older, newer, parent, pending, older.node);
	
				return true;
			}
		}
	
		unmount(older, false);
	
		if (newer === shared) {
			removeChild(older, parent);
		} else {
			replaceChild(older, newer, parent);
		}
	
		detach(older);
	
		return false;
	}
	
	/**
	 * Unmount
	 *
	 * @param  {Tree} older
	 * @param  {Boolean} unlink
	 */
	function unmount (older, unlink) {
		var children = older.children;
		var length = children.length;
		var flag = older.flag;
	
		if (flag > 1) {
			if (length !== 0) {
				for (var i = 0; i < length; i++) {
					var child = children[i];
	
					if (child.group > 0 && child.owner.componentWillUnmount !== void 0) {
						mountBoundary(child, child.owner, child.node, 2);
					}
	
					unmount(child, true);
				}
			}
	
			if (flag < 3 && older.ref !== null) {
				refs(older, older.ref, 0);
			}
		}
	
		if (unlink === true) {
			detach(older);
		}
	}
	
	/**
	 * Detach
	 *
	 * @return {Tree}
	 */
	function detach (older) {
		older.parent = null;
		older.owner = null;
		older.node = null;
		older.host = null;
	}
	
	/**
	 * Exchange
	 *
	 * @param {Tree} newer
	 * @param {Tree} older
	 * @param {Boolean} deep
	 */
	function exchange (older, newer, deep) {
		change(older, newer, older.host);
		copy(older, newer, deep);
		update(older.host, newer);
	}
	
	/**
	 * Update
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 */
	function update (older, newer) {
		if (older !== null && older.flag === 3) {
			older.node = newer.node;
			older.parent = newer.parent;
	
			if (older.host !== older) {
				update(older.host, newer);
			}
		}
	}
	
	/**
	 * Composite
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} group
	 */
	function composite (older, newer, group) {
		patch(older.children[0], newer.children[0], group);
	}
	
	/**
	 * Change
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 */
	function change (older, newer) {
		create(newer, older.parent, older, 3, older.host, null);
	}
	
	/**
	 * Render
	 *
	 * @param {Any} subject
	 * @param {Node?} container
	 * @param {Object?} options
	 */
	function render (subject, container, options) {
		var newer = subject;
		var target = container;
	
		if (newer === void 0 || newer === null) {
			newer = text('');
		} else if (newer.flag === void 0) {
			switch (typeof newer) {
				case 'function': {
					newer = element(newer);
					break;
				}
				case 'object': {
					newer = fragment(newer);
					break;
				}
				case 'number':
				case 'boolean':
				case 'string': {
					newer = text(newer);
					break;
				}
			}
		}
	
		if (target === void 0 || target === null) {
			// use <body> if it exists at this point
			// else default to the root <html> node
			if (body === null) {
				body = global.document !== void 0 ? (document.body || document.documentElement) : null;
			}
	
			target = body;
	
			// server enviroment
			if (server === true && target === null) {
				return exports.renderToString(newer);
			}
		}
	
		var older = target.this;
	
		if (older !== void 0) {
			if (older.key === newer.key && older.type === newer.type) {
				patch(older, newer, older.group);
			} else {
				exchange(older, newer, true);
			}
		} else {
			var parent = new Tree(2);
	
			target.this = newer;
	
			switch ((options !== void 0 ? options.type : options)) {
				case 'replace': {
					parent.node = (shared.node = target).parentNode;
					create(newer, parent, shared, 3, newer, null);
					shared.node = null;
					break;
				}
				case 'remove': {
					target.textContent = null;
				}
				default: {
					parent.node = target;
					create(newer, parent, shared, 1, newer, null);
				}
			}
		}
	
		if (options !== void 0 && options.constructor === Function) {
			options();
		}
	}
	
	/**
	 * Patch
	 *
	 * @param {Tree} older
	 * @param {Tree} _newer
	 * @param {Number} group
	 */
	function patch (older, _newer, group) {
		var newer = _newer;
	
		if (older.type !== newer.type) {
			return exchange(older, newer, true);
		}
	
		if (group > 0) {
			if (shouldUpdate(older, newer, group) === false) {
				return;
			}
	
			newer = shape(renderBoundary(older, group), older, true);
	
			if (older.async === 2) {
				return;
			}
	
			older.async = 0;
	
			if (newer.tag !== older.tag) {
				return exchange(older, newer, false);
			}
	
			if (newer.flag === 3) {
				composite(older, newer, group);
	
				if (older.owner.componentDidUpdate !== void 0) {
					didUpdate(older);
				}
				return;
			}
		}
	
		if (older.flag === 1) {
			if (older.children !== newer.children) {
				nodeValue(older, newer);
			}
			return;
		}
	
		var oldLength = older.children.length;
		var newLength = newer.children.length;
	
		if (oldLength === 0) {
			// fill children
			if (newLength !== 0) {
				fill(older, newer, newLength);
	
				older.children = newer.children;
			}
		} else if (newLength === 0) {
			// remove children
			if (oldLength !== 0) {
				unmount(older, false);
				removeChildren(older);
	
				older.children = newer.children;
			}
		} else {
			switch (newer.keyed) {
				case false: nonkeyed(older, newer, oldLength, newLength); break;
				case true: keyed(older, newer, oldLength, newLength); break;
			}
		}
	
		attributes(older, newer);
	
		if (group > 0 && older.owner.componentDidUpdate !== void 0) {
			didUpdate(older);
		}
	}
	
	/**
	 * Non-Keyed Children [Simple]
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} oldLength
	 * @param {Number} newLength
	 */
	function nonkeyed (older, newer, oldLength, newLength) {
		var host = older.host;
		var oldChildren = older.children;
		var newChildren = newer.children;
		var length = newLength > oldLength ? newLength : oldLength;
	
		for (var i = 0; i < length; i++) {
			if (i >= newLength) {
				remove(oldChildren.pop(), shared, older);
			} else if (i >= oldLength) {
				create(oldChildren[i] = newChildren[i], older, shared, 1, host, null);
			} else {
				var newChild = newChildren[i];
				var oldChild = oldChildren[i];
	
				if (newChild.flag === 1 && oldChild.flag === 1) {
					if (newChild.children !== oldChild.children) {
						nodeValue(oldChild, newChild);
					}
				} else if (newChild.type !== oldChild.type) {
					create(oldChildren[i] = newChild, older, oldChild, 3, host, null);
				} else {
					patch(oldChild, newChild, oldChild.group);
				}
			}
		}
	}
	
	/**
	 * Keyed Children [Simple]
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} oldLength
	 * @param {Number} newLength
	 */
	function keyed (older, newer, oldLength, newLength) {
		var host = older.host;
	 	var oldChildren = older.children;
	 	var newChildren = newer.children;
	 	var oldStart = 0;
	 	var newStart = 0;
	 	var oldEnd = oldLength - 1;
	 	var newEnd = newLength - 1;
	 	var oldStartNode = oldChildren[oldStart];
	 	var newStartNode = newChildren[newStart];
	 	var oldEndNode = oldChildren[oldEnd];
	 	var newEndNode = newChildren[newEnd];
	 	var nextPos;
	 	var nextChild;
	
	 	// step 1, sync leading [a, b ...], trailing [... c, d], opposites [a, b] [b, a] recursively
	 	outer: while (true) {
	 		// sync leading nodes
	 		while (oldStartNode.key === newStartNode.key) {
	 			newChildren[newStart] = oldStartNode;
	
	 			patch(oldStartNode, newStartNode, oldStartNode.group);
	
	 			oldStart++;
	 			newStart++;
	
	 			if (oldStart > oldEnd || newStart > newEnd) {
	 				break outer;
	 			}
	
	 			oldStartNode = oldChildren[oldStart];
	 			newStartNode = newChildren[newStart];
	 		}
	
	 		// sync trailing nodes
	 		while (oldEndNode.key === newEndNode.key) {
	 			newChildren[newEnd] = oldEndNode;
	
	 			patch(oldEndNode, newEndNode, oldEndNode.group);
	
	 			oldEnd--;
	 			newEnd--;
	
	 			if (oldStart > oldEnd || newStart > newEnd) {
	 				break outer;
	 			}
	
	 			oldEndNode = oldChildren[oldEnd];
	 			newEndNode = newChildren[newEnd];
	 		}
	
	 		// move and sync nodes from right to left
	 		if (oldEndNode.key === newStartNode.key) {
	 			newChildren[newStart] = oldEndNode;
	 			oldChildren[oldEnd] = oldStartNode;
	
	 			insertBefore(oldEndNode, oldStartNode, older);
	 			patch(oldEndNode, newStartNode, oldEndNode.group);
	
	 			oldEnd--;
	 			newStart++;
	
	 			oldEndNode = oldChildren[oldEnd];
	 			newStartNode = newChildren[newStart];
	
	 			continue;
	 		}
	
	 		// move and sync nodes from left to right
	 		if (oldStartNode.key === newEndNode.key) {
	 			newChildren[newEnd] = oldStartNode;
	 			oldChildren[oldStart] = oldEndNode;
	
	 			nextPos = newEnd + 1;
	
	 			if (nextPos < newLength) {
	 				insertBefore(oldStartNode, oldChildren[nextPos], older);
	 			} else {
	 				appendChild(oldStartNode, older);
	 			}
	
	 			patch(oldStartNode, newEndNode, oldStartNode.group);
	
	 			oldStart++;
	 			newEnd--;
	
	 			oldStartNode = oldChildren[oldStart];
	 			newEndNode = newChildren[newEnd];
	
	 			continue;
	 		}
	
	 		break;
	 	}
	
	 	// step 2, remove or insert or both
	 	if (oldStart > oldEnd) {
	 		// old children is synced, insert the difference
	 		if (newStart <= newEnd) {
	 			nextPos = newEnd + 1;
	 			nextChild = nextPos < newLength ? newChildren[nextPos] : shared;
	
	 			do {
	 				create(newStartNode = newChildren[newStart++], older, nextChild, 2, host, null);
	 			} while (newStart <= newEnd);
	 		}
	 	} else if (newStart > newEnd) {
	 		// new children is synced, remove the difference
	 		do {
	 			remove(oldStartNode = oldChildren[oldStart++], shared, older);
	 		} while (oldStart <= oldEnd);
	 	} else if (newStart === 0 && newEnd === newLength-1) {
	 		// all children are out of sync, remove all, append new set
	 		unmount(older, false);
	 		removeChildren(older);
	 		fill(older, newer, newLength);
	 	} else {
	 		// could sync all children, move on the the next phase
	 		complex(older, newer, oldStart, newStart, oldEnd + 1, newEnd + 1, oldLength, newLength);
	 	}
	
	 	older.children = newChildren;
	}
	
	/**
	 * Keyed Children [Complex]
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} oldStart
	 * @param {Number} newStart
	 * @param {Number} oldEnd
	 * @param {Number} newEnd
	 * @param {Number} oldLength
	 * @param {number} newLength
	 */
	function complex (older, newer, oldStart, newStart, oldEnd, newEnd, oldLength, newLength) {
		var host = older.host;
		var oldChildren = older.children;
		var newChildren = newer.children;
		var oldKeys = {};
		var newKeys = {};
		var oldIndex = oldStart;
		var newIndex = newStart;
		var oldOffset = 0;
		var newOffset = 0;
		var oldChild;
		var newChild;
		var nextChild;
		var nextPos;
	
		// step 1, build a map of keys
		while (true) {
			if (oldIndex < oldEnd) {
				oldChild = oldChildren[oldIndex];
				oldKeys[oldChild.key] = oldIndex++;
			}
	
			if (newIndex < newEnd) {
				newChild = newChildren[newIndex];
				newKeys[newChild.key] = newIndex++;
			}
	
			if (oldIndex === oldEnd && newIndex === newEnd) {
				break;
			}
		}
	
		// reset
		oldIndex = oldStart;
		newIndex = newStart;
	
		// step 2, insert and sync nodes from left to right [a, b, ...]
		while (newIndex < newEnd) {
			newChild = newChildren[newIndex];
			oldIndex = oldKeys[newChild.key];
	
			// new child doesn't exist in old children, insert
			if (oldIndex === void 0) {
				nextPos = newIndex - newOffset;
				nextChild = nextPos < oldLength ? oldChildren[nextPos] : shared;
	
				create(newChild, older, nextChild, 2, host, null);
	
				newOffset++;
			} else if (newIndex === oldIndex) {
				oldChild = oldChildren[oldIndex];
	
				patch(newChildren[newIndex] = oldChild, newChild, oldChild.group);
			}
	
			newIndex++;
		}
	
		// reset
		oldIndex = oldStart;
	
		// step 3, remove and sync nodes from left to right [a, b, ...]
		while (oldIndex < oldEnd) {
			oldChild = oldChildren[oldIndex];
			newIndex = newKeys[oldChild.key];
	
			// old child doesn't exist in new children, remove
			if (newIndex === void 0) {
				remove(oldChild, shared, older);
	
				oldOffset++;
			}
	
			oldIndex++;
		}
	
		// compute changes
		oldOffset = (oldEnd - oldStart) - oldOffset;
		newOffset = (newEnd - newStart) - newOffset;
	
		// new and old children positions are in sync
		if (oldOffset + newOffset === 2) {
			return;
		}
	
		// reset
		newIndex = newEnd - 1;
	
		// step 4, move and sync nodes from right to left, [..., c, d]
		while (newIndex >= newStart) {
			newChild = newChildren[newIndex];
	
			// moved node
			if (newChild.node === null) {
				// retreive index
				oldIndex = oldKeys[newChild.key];
	
				// exists
				if (oldIndex !== void 0) {
					oldChild = oldChildren[oldIndex];
	
					// within bounds
					if ((nextPos = newIndex + 1) < newLength) {
						insertBefore(oldChild, newChildren[nextPos], older);
					} else {
						appendChild(oldChild, older);
					}
	
					patch(newChildren[newIndex] = oldChild, newChild, oldChild.group);
				}
			}
	
			newIndex--;
		}
	}
	
	/**
	 * Generate
	 *
	 * @param  {String} tag
	 * @param  {Tree} newer
	 * @param  {Tree} host
	 * @param  {String?} xmlns
	 * @return {Node}
	 */
	function createElement (tag, newer, host, xmlns) {
		try {
			if (xmlns === null) {
				return document.createElement(tag);
			} else {
				return document.createElementNS(newer.xmlns = xmlns, tag);
			}
		} catch (err) {
			return errorBoundary(err, host, host.owner, newer.flag = 5, 0);
		}
	}
	
	/**
	 * Compose
	 *
	 * @return {value}
	 */
	function createTextNode (value) {
		return document.createTextNode(value);
	}
	
	/**
	 * Insert
	 *
	 * @param {Tree} newer
	 * @param {Tree} sibling
	 * @param {Tree} parent
	 */
	function insertBefore (newer, sibling, parent) {
		parent.node.insertBefore(newer.node, sibling.node);
	}
	
	/**
	 * Append
	 *
	 * @param {Tree} newer
	 * @param {Tree} parent
	 */
	function appendChild (newer, parent) {
		parent.node.appendChild(newer.node);
	}
	
	/**
	 * Remove
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Tree} parent
	 */
	function removeChild (older, parent) {
		parent.node.removeChild(older.node);
	}
	
	/**
	 * Replace
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Tree} parent
	 */
	function replaceChild (older, newer, parent) {
		parent.node.replaceChild(newer.node, older.node);
	}
	
	/**
	 * Remove All
	 *
	 * @param {Tree} older
	 */
	function removeChildren (older) {
		older.node.textContent = null;
	}
	
	/**
	 * Text
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 */
	function nodeValue (older, newer) {
		older.node.nodeValue = older.children = newer.children;
	}
	
	/**
	 * Attribute
	 *
	 * @param {Number} type
	 * @param {String} name
	 * @param {Any} value
	 * @param {String?} xmlns
	 * @param {Tree} node
	 */
	function setAttribute (type, name, value, xmlns, node) {
		switch (type) {
			case 0: {
				if (xmlns === null && name in node) {
					setUnknown(name, value, node);
				} else if (value !== null && value !== void 0 && value !== false) {
					node.setAttribute(name, (value === true ? '' : value));
				} else {
					node.removeAttribute(name);
				}
				break;
			}
			case 1: {
				if (xmlns === null) {
					node.className = value;
				} else {
					setAttribute(0, 'class', value, xmlns, node);
				}
				break;
			}
			case 3: {
				if (node[name] === void 0) {
					node.style.setProperty(name, value);
				} else if (isNaN(Number(value)) === true) {
					setAttribute(0, name, value, xmlns, node);
				} else {
					setAttribute(6, name, value, xmlns, node);
				}
				break;
			}
			case 4: {
				node.setAttributeNS(xlink, 'href', value);
				break;
			}
			case 5:
			case 6: {
				if (xmlns === null) {
					node[name] = value;
				} else {
					setAttribute(0, name, value, xmlns, node);
				}
				break;
			}
			case 10: {
				node.innerHTML = value;
				break;
			}
		}
	}
	
	/**
	 * Unknown
	 *
	 * @param  {String} name
	 * @param  {Any} value
	 * @param  {Node} node
	 */
	function setUnknown (name, value, node) {
		try {
			node[name] = value;
		} catch (e) {}
	}
	
	/**
	 * Style
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} type
	 */
	function setStyle (older, newer, type) {
		var node = older.node.style;
		var next = newer.attrs.style;
	
		if (next.constructor === String) {
			node.cssText = next;
		} else {
			switch (type) {
				// assign
				case 0: {
					for (var name in next) {
						var value = next[name];
	
						if (name.charCodeAt(0) === 45) {
							node.setProperty(name, value);
						} else {
							node[name] = value;
						}
					}
					break;
				}
				// update
				case 1: {
					var prev = older.attrs.style;
	
					for (var name in next) {
						var value = next[name];
	
						if (name.charCodeAt(0) === 45) {
							node.setProperty(name, value);
						} else {
							node[name] = value;
						}
					}
					break;
				}
			}
		}
	}
	
	/**
	 * Event
	 *
	 * @param {Tree} older
	 * @param {String} type
	 * @param {Function} value
	 * @param {Number} action
	 */
	function setEvent (older, type, value, action) {
		var name = type.toLowerCase().substring(2);
		var host = older.host;
		var node = older.node;
		var fns = node._fns;
	
		if (fns === void 0) {
			fns = node._fns = {};
		}
	
		switch (action) {
			case 0: {
				node.removeEventListener(name, eventProxy);
	
				if (node._this !== void 0) {
					node._this = null;
				}
				break;
			}
			case 1: {
				node.addEventListener(name, eventProxy);
			}
			case 2: {
				if (host !== null && host.group > 1) {
					node._this = older;
				}
			}
		}
	
		fns[name] = value;
	}
	
	/**
	 * Proxy
	 *
	 * @param {Event} e
	 */
	function eventProxy (e) {
		var type = e.type;
		var fns = this._fns;
		var fn = fns[type];
		var older;
	
		if (fn === null || fn === void 0) {
			return;
		}
	
		if ((older = this._this) !== void 0) {
			eventBoundary(older, older.host.owner, fn, e);
		} else {
			fn.call(this, e);
		}
	}
	
	/**
	 * Exports
	 *
	 * @type {Object}
	 */
	var exports = {
		version: '7.0.0',
		h: element,
		createElement: element,
		render: render,
		Component: Component
	};
	
	global.h = element;
	
	/**
	 * Server
	 */
	if (server === true && typeof require === 'function') {
		require('./dio.server.js')(exports, element, shape, extract, whitelist, object);
	}
	
	return exports;
	
}));
