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
	var version = '7.0.0';
	var noop = function () {};
	var array = [];
	var object = {};
	var server = global.global === global;
	var browser = global.window === global;
	var Promise = global.Promise || noop;
	var requestAnimationFrame = global.requestAnimationFrame || setTimeout;
	var requestIdleCallback = global.requestIdleCallback || setTimeout;
	var mount = null;
	var empty = new Tree(2);
	
	/**
	 * ## Element Flag
	 *
	 * 1: text
	 * 2: element
	 * 3: error
	 *
	 * ## Element Group
	 *
	 * 0: Element
	 * 1: Function
	 * 2: Component
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
	 */
	
	/**
	 * ## Component Shape
	 *
	 * _older: current tree {Tree?}
	 * _async: component async, tracks async lifecycle methods flag {Number}
	 * _state: previous cached state {Object}
	 * _pending: pending cached state {Object}
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
		this._older = null;
		this._async = 0;
	
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
				state = getInitialState(dataBoundary(this, 1, props), this);
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
	
		if (typeof newer === 'function') {
			newer = callbackBoundary(owner, newer, state, 0);
	
			if (newer === void 0 || newer === null) {
				return;
			}
		}
	
		if (newer.constructor === Promise) {
			newer.then(function (value) {
				owner.setState(value, callback);
			});
		} else {
			owner._pending = newer;
	
			var older = owner._state = {};
	
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
		var older = owner._older;
	
		if (older === null || older.node === null || older.async !== 0 || owner._async !== 0) {
			// this is to avoid maxium call stack when componentDidUpdate
			// produces a infinite render loop
			if (older.async === 3) {
				requestAnimationFrame(function () {
					owner.forceUpdate(callback);
				});
			}
			return;
		}
	
		patch(older, older, 3);
	
		if (callback !== void 0 && typeof callback === 'function') {
			callbackBoundary(owner, callback, owner.state, 1);
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
		var recievedProps;
		var nextState;
		var nextProps;
		var newer;
	
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
	
		recievedProps = group < 3 && nextProps !== object;
	
		if (recievedProps === true) {
			if (type.propTypes !== void 0) {
				propTypes(owner, type, nextProps);
			}
			if (owner.componentWillReceiveProps !== void 0) {
				dataBoundary(owner, 0, nextProps);
			}
			if (type.defaultProps !== void 0) {
				merge(type.defaultProps, nextProps);
			}
		}
	
		if (
			owner.shouldComponentUpdate !== void 0 &&
			updateBoundary(owner, 0, nextProps, nextState) === false
		) {
			return older.async = 0, false;
		}
		if (recievedProps === true) {
			(group > 1 ? owner : older).props = nextProps;
		}
		if (owner.componentWillUpdate !== void 0) {
			updateBoundary(owner, 1, nextProps, nextState);
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
			owner._async = 1;
			state.then(function (value) {
				owner._async = 0;
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
		var obj = callbackBoundary(owner, fn, props, 0);
		if (obj !== void 0 && obj !== null) {
			Object.defineProperty(owner, type, {value: obj});
		}
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
		var validators = type.propTypes;
		var validator;
		var result;
	
		try {
			for (var name in validators) {
				validator = validators[name];
				result = validator(props, name, display);
	
				if (result) {
					console.error(result);
				}
			}
		} catch (err) {
			errorBoundary(err, owner, 2, validator);
		}
	}
	
	/**
	 * Create Element
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
		var i = 2;
		var group = 0;
		var older = new Tree(2);
		var proto;
		var children;
	
		if (props !== null) {
			switch (props.constructor) {
				case Object: {
					if (props.key !== void 0) {
						older.key = props.key;
					}
					if (props.xmlns !== void 0) {
						older.xmlns = props.xmlns;
					}
					older.props = props;
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
		}
	
		switch (type.constructor) {
			case String: {
				older.tag = type;
				older.attrs = props;
				break;
			}
			case Function: {
				if ((proto = type.prototype) !== void 0 && proto.render !== void 0) {
					group = older.group = 2;
				} else {
					group = older.group = 1;
					older.owner = type;
				}
				break;
			}
		}
	
		older.type = type;
	
		if (length > 1) {
			children = new Array(size);
	
			if (group < 1) {
				for (older.children = children; i < length; i++) {
					index = push(older, index, arguments[i]);
				}
			} else {
				if ((props = older.props) === null || props === object) {
					props = older.props = {};
				}
				for (older.children = children; i < length; i++) {
					index = pull(older, index, arguments[i]);
				}
	
				props.children = index > 1 ? children : children[0];
				older.children = array;
			}
		}
	
		return older;
	}
	
	/**
	 * Push Children
	 *
	 * @param  {Tree} older
	 * @param  {Number} index
	 * @param  {Any} newer
	 * @return {Number}
	 */
	function push (older, index, newer) {
		var children = older.children;
		var child;
		var length;
	
		if (newer === null || newer === void 0) {
			child = text('');
		} else if (newer.group !== void 0) {
			if (older.keyed === false && newer.key !== null) {
				older.keyed = true;
			}
			child = newer;
		} else {
			switch (typeof newer) {
				case 'function': {
					child = element(newer, null);
					break;
				}
				case 'object': {
					if ((length = newer.length) !== void 0) {
						for (var j = 0, i = index; j < length; j++) {
							i = push(older, i, newer[j]);
						}
						return i;
					} else {
						child = text(newer.constructor === Date ? newer+'' : '');
					}
					break;
				}
				default: {
					child = text(newer);
				}
			}
		}
		children[index] = child;
	
		return index + 1;
	}
	
	/**
	 * Pull Children
	 *
	 * @param  {Tree} older
	 * @param  {Number} index
	 * @param  {Any} newer
	 * @return {Number}
	 */
	function pull (older, index, newer) {
		var children = older.children;
	
		if (newer !== null && typeof newer === 'object') {
			var length = newer.length;
	
			if (length !== void 0) {
				for (var j = 0, i = index; j < length; j++) {
					i = pull(older, i, newer[j]);
				}
				return i;
			}
		}
		children[index] = newer;
	
		return index + 1;
	}
	
	/**
	 * Create Text
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
	 * Create Fragment
	 *
	 * @param  {Array<Tree>|Tree|Function} children
	 * @return {Tree}
	 */
	function fragment (children) {
		return element('section', null, children);
	}
	
	/**
	 * Copy Tree
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Boolean} deep
	 */
	function copy (older, newer, deep) {
		older.flag = newer.flag;
		older.tag = newer.tag;
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
		this.type = null;
		this.node = null;
		this.host = null;
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
	 * Tree Prototype
	 *
	 * @type {Object}
	 */
	var TreePrototype = Tree.prototype = element.prototype = Object.create(null);
	
	/**
	 * Data Boundary
	 *
	 * @param  {Component} owner
	 * @param  {Number} type
	 * @param  {Object} props
	 * @return {Object?}
	 */
	function dataBoundary (owner, type, props) {
		try {
			switch (type) {
				case 0: return returnBoundary(owner.componentWillReceiveProps(props), owner, null, true);
				case 1: return owner.getInitialState(props);
			}
		} catch (err) {
			errorBoundary(err, owner, 0, type);
		}
	}
	
	/**
	 * Update Boundary
	 *
	 * @param  {Component} owner
	 * @param  {Number} type
	 * @param  {Object} props
	 * @param  {Object} state
	 * @return {Boolean?}
	 */
	function updateBoundary (owner, type, props, state) {
		try {
			switch (type) {
				case 0: return owner.shouldComponentUpdate(props, state);
				case 1: return returnBoundary(owner.componentWillUpdate(props, state), owner, null, true);
				case 2: return returnBoundary(owner.componentDidUpdate(props, state), owner, null, false);
			}
		} catch (err) {
			errorBoundary(err, owner, 1, type);
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
				switch (group) {
					case 1: return older.yield(older.props);
					case 2: case 3: return older.yield(older.owner.props, older.owner.state);
				}
			}
			switch (group) {
				case 1: return older.type(older.props);
				case 2: case 3: return older.owner.render(older.owner.props, older.owner.state);
			}
		} catch (err) {
			return errorBoundary(err, group > 1 ? older.owner : older.type, 3, group);
		}
	}
	
	/**
	 * Mount Boundary
	 *
	 * @param {Component} owner
	 * @param {Number} type
	 */
	function mountBoundary (owner, type) {
		try {
			switch (type) {
				case 0: return returnBoundary(owner.componentWillMount(), owner, null, false);
				case 1: return returnBoundary(owner.componentDidMount(), owner, null, true);
				case 2: return owner.componentWillUnmount();
			}
		} catch (err) {
			errorBoundary(err, owner, 4, type);
		}
	}
	
	/**
	 * Callback Boundary
	 *
	 * @param {Function} callback
	 * @param {Component} owner
	 * @param {Object|Node} param
	 */
	function callbackBoundary (owner, callback, param, type) {
		try {
			if (type === 0) {
				return callback.call(owner, param);
			} else {
				return returnBoundary(callback.call(owner, param), owner, null, false);
			}
		} catch (err) {
			errorBoundary(err, owner, 2, callback);
		}
	}
	
	/**
	 * Events Boundary
	 *
	 * @param {Component} owner
	 * @param {Function} fn
	 * @param {Event} e
	 */
	function eventBoundary (owner, fn, e) {
		try {
			return returnBoundary(fn.call(owner, owner.props, owner.state, e), owner, e, true);
		} catch (err) {
			errorBoundary(err, owner, 5, fn);
		}
	}
	
	/**
	 * Return Boundary
	 *
	 * @param  {(Object|Promise)?} state
	 * @param  {Component} owner
	 * @param  {Event?} e
	 * @param  {Boolean} sync
	 */
	function returnBoundary (state, owner, e, sync) {
		if (state === void 0 || state === null || owner === null || owner.UUID === void 0) {
			return;
		}
	
		if (state !== false) {
			if (sync === true) {
				owner.setState(state);
			} else {
				requestIdleCallback(function () {
					owner.setState(state);
				});
			}
		} else {
			if (e !== null && e.defaultPrevented !== true) {
				e.preventDefault();
			}
		}
	}
	
	/**
	 * Error Boundary
	 *
	 * @param  {Error|String} message
	 * @param  {Component} owner
	 * @param  {Number} type
	 * @param  {Number|Function} from
	 * @return {Tree?}
	 */
	function errorBoundary (message, owner, type, from) {
		var component = '#unknown';
		var location;
		var newer;
	
		console.log(type);
	
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
			return shape(newer, owner !== null ? owner._older : null, true);
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
			message+'\n\n  ^^ Error caught in '+'"'+component+'"'+
			' from "'+location+'" \n'
		);
	}
	
	/**
	 * Attributes [Whitelist]
	 *
	 * @param  {String} name
	 * @return {Number}
	 */
	function attr (name) {
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
	 * Assign Attributes
	 *
	 * @param {Tree} newer
	 * @param {String?} xmlns
	 */
	function attribute (newer, xmlns) {
		var attrs = newer.attrs;
		var type = 0;
		var value;
	
		for (var name in attrs) {
			type = attr(name);
	
			if (type < 31) {
				value = attrs[name];
	
				if (type === 30) {
					refs(value, newer, 0);
				} else if (type < 20) {
					if (value !== void 0 && value !== null) {
						assign(type, name, value, xmlns, newer);
					}
				} else if (type > 20) {
					event(newer, name, value, 1);
				} else {
					style(newer, newer, 0);
				}
			}
		}
	}
	
	/**
	 * Reconcile Attributes
	 *
	 * @param {Tree} newer
	 * @param {Tree} older
	 */
	function attributes (older, newer) {
		var old = older.attrs;
		var attrs = newer.attrs;
		var xmlns = older.xmlns;
		var type = 0;
		var prev;
		var next;
	
		// old attributes
		for (var name in old) {
			type = attr(name);
	
			if (type < 30) {
				next = attrs[name];
	
				if (next === null || next === void 0) {
					if (type < 20) {
						assign(type, name, next, xmlns, older);
					} else if (type > 20) {
						event(older, name, next, 0);
					}
				}
			}
		}
	
		// new attributes
		for (var name in attrs) {
			type = attr(name);
	
			if (type < 31) {
				next = attrs[name];
	
				if (type === 30) {
					refs(next, older, 2);
				} else {
					prev = old[name];
	
					if (next !== prev && next !== null && next !== void 0) {
						if (type < 20) {
							assign(type, name, next, xmlns, older);
						} else if (type > 20) {
							event(older, name, next, 2);
						} else {
							style(older, newer, 1);
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
	 * @param  {Function|String} value
	 * @param  {Tree} older
	 * @param  {Number} type
	 */
	function refs (value, older, type) {
		var host = older.host;
		var stateful = false;
		var owner;
	
		if (host !== null) {
			if ((owner = host.owner) !== null && host.group > 1) {
				stateful = true;
			}
		}
	
		if (stateful === true && owner.refs === null) {
			owner.refs = {};
		}
	
		switch (typeof value) {
			case 'function': {
				callbackBoundary(owner, value, older.node, type);
				break;
			}
			case 'string': {
				if (stateful === true) {
					owner.refs[value] = older.node;
				}
				break;
			}
		}
	}
	
	/**
	 * Merge Props
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
	 * Extract Component Tree
	 *
	 * @param  {Tree} older
	 * @return {Tree}
	 */
	function extract (older) {
		var type = older.type;
		var props = older.props;
		var children = older.children;
		var length = children.length;
		var group = older.group;
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
	
			if (owner._async === 0) {
				older.async = 1;
				newer = renderBoundary(older, group);
				older.async = 0;
			}
			newer = shape(newer, owner._older = older, true);
		} else {
			newer = shape(renderBoundary(older, group), older, true);
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
	 * Shape Tree
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
					newer = element(newer, older === null ? null : older.props);
					break;
				}
				case 'string':
				case 'number':
				case 'boolean': {
					newer = text(newer);
					break;
				}
				case 'object': {
					switch (newer.constructor) {
						case Promise: return older === null ? text('') : resolve(older, newer);
						case Array: newer = fragment(newer); break;
						case Date: newer = text(newer+''); break;
						case Object: newer = text(''); break;
						default: {
							newer = newer.next !== void 0 && older !== null ? coroutine(older, newer) : text('');
						}
					}
					break;
				}
			}
		}
	
		return newer.group > 0 && abstract === true ? fragment(newer) : newer;
	}
	
	/**
	 * Resolve Tree
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
				exchange(older, newer, older, false);
			} else {
				patch(older, newer, 0);
			}
		});
	
		return older.node !== null ? older : text('');;
	}
	
	/**
	 * Create Coroutine
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
	 * Exchange Tree
	 *
	 * @param {Tree} newer
	 * @param {Tree} older
	 * @param {Boolean} deep
	 */
	function exchange (older, newer, deep) {
		swap(older, newer, older.host);
	
		if (older.flag !== 1 && older.children.length > 0) {
			unmount(older, false);
		}
	
		if (older.owner !== null && older.owner.componentWillUnmount !== void 0) {
			mountBoundary(older.owner, 2);
		}
	
		copy(older, newer, deep);
	}
	
	/**
	 * Unmount Children
	 *
	 * @param  {Tree} older
	 * @param  {Boolean} release
	 */
	function unmount (older, release) {
		var children = older.children;
		var length = children.length;
	
		if (older.flag === 1 || length === 0) {
			return;
		}
	
		for (var i = 0, child; i < length; i++) {
			child = children[i];
			if (child.group > 0 && child.owner.componentWillUnmount !== void 0) {
				mountBoundary(child.owner, 2);
			}
			unmount(child, true);
		}
	
		if (release === true) {
			older.parent = null;
			older.owner = null;
			older.node = null;
			older.host = null;
		}
	}
	
	/**
	 * Fill Children
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} length
	 */
	function fill (older, newer, length) {
		var children = newer.children;
		var host = older.host;
	
		for (var i = 0, child; i < length; i++) {
			create(child = children[i], host, older, empty, 1, null);
		}
		older.children = children;
	}
	
	/**
	 * Render
	 *
	 * @param  {Tree} _newer
	 * @param  {Node} _target
	 */
	function render (_newer, _target) {
		var newer = _newer;
		var target = _target;
		var older;
		var parent;
	
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
			if (mount === null) {
				if (global.document !== void 0) {
					mount = document.body || document.documentElement;
				} else {
					mount = null;
				}
			}
	
			target = mount;
	
			// server enviroment
			if (target === null && newer.toString !== void 0) {
				return newer.toString();
			}
		}
	
		if ((older = target._older) !== void 0) {
			if (older.key === newer.key && older.type === newer.type) {
				patch(older, newer, older.group);
			} else {
				exchange(older, newer, newer, true);
			}
		} else {
			parent = new Tree(2);
			parent.node = target;
	
			create(target._older = newer, newer, parent, empty, 1, null);
		}
	}
	
	/**
	 * Shallow Render
	 *
	 * @param  {Any} older
	 * @return {Tree}
	 */
	function shallow (value) {
		var newer = shape(value, null, false);
	
		while (newer.tag === null) {
			newer = extract(newer);
		}
	
		return newer;
	}
	
	/**
	 * Patch
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
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
		}
	
		if (older.flag === 1) {
			return content(older, older.children = newer.children);
		}
	
		var newLength = newer.children.length;
		var oldLength = older.children.length;
	
		if (oldLength === 0) {
			// fill children
			if (newLength !== 0) {
				fill(older, newer, newLength);
				older.children = newer.children;
			}
		} else if (newLength === 0) {
			// empty children
			if (oldLength !== 0) {
				unmount(older, false);
				clear(older.node);
				older.children = newer.children;
			}
		} else if (newer.keyed === true) {
			keyed(older, newer, oldLength, newLength);
		} else {
			nonkeyed(older, newer, oldLength, newLength);
		}
	
		attributes(older, newer);
	
		if (group > 0) {
			var owner = older.owner;
	
			if (owner.componentDidUpdate !== void 0) {
				older.async = 3;
				updateBoundary(owner, 2, owner._props, owner._state);
				older.async = 0;
			}
		}
	}
	
	/**
	 * Non-Keyed Children [Simple]
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Number} _oldLength
	 * @param  {Number} newLength
	 */
	function nonkeyed (older, newer, _oldLength, newLength) {
		var host = older.host;
		var oldChildren = older.children;
		var newChildren = newer.children;
		var oldLength = _oldLength;
		var length = newLength > oldLength ? newLength : oldLength;
	
		for (var i = 0, newChild, oldChild; i < length; i++) {
			if (i >= newLength) {
				if ((oldChild = oldChildren.pop()).group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
					mountBoundary(oldChild.owner, 2);
				}
				remove(oldChild, older);
				unmount(oldChild, true);
				oldLength--;
			} else if (i >= oldLength) {
				create(newChild = oldChildren[i] = newChildren[i], host, older, empty, 1, null);
				oldLength++;
			} else {
				newChild = newChildren[i];
				oldChild = oldChildren[i];
	
				if (newChild.flag === 1 && oldChild.flag === 1) {
					content(oldChild, oldChild.children = newChild.children);
				} else if (newChild.type !== oldChild.type) {
					if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
						mountBoundary(oldChild.owner, 2);
					}
					create(oldChildren[i] = newChild, host, older, oldChild, 3, null);
					unmount(oldChild, true);
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
	 			move(oldEndNode, oldStartNode, older);
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
	 				move(oldStartNode, oldChildren[nextPos], older);
	 			} else {
	 				append(oldStartNode, older);
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
	 			nextChild = nextPos < newLength ? newChildren[nextPos] : empty;
	
	 			do {
	 				create(newStartNode = newChildren[newStart++], host, older, nextChild, 2, null);
	 			} while (newStart <= newEnd);
	 		}
	 	} else if (newStart > newEnd) {
	 		// new children is synced, remove the difference
	 		do {
	 			oldStartNode = oldChildren[oldStart++];
	 			if (oldStartNode.group > 0 && oldStartNode.owner.componentWillUnmount !== void 0) {
	 				mountBoundary(oldStartNode.owner, 2);
	 			}
	 			remove(oldStartNode, older);
	 			unmount(oldStartNode, true);
	 		} while (oldStart <= oldEnd);
	 	} else if (newStart === 0 && newEnd === newLength-1) {
	 		// all children are out of sync, remove all, append new set
	 		unmount(older, false);
	 		clear(older);
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
				nextChild = nextPos < oldLength ? oldChildren[nextPos] : empty;
				create(newChild, host, older, nextChild, 2, null);
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
				if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
					mountBoundary(oldChild.owner, 2);
				}
				remove(oldChild, older);
				unmount(oldChild, true);
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
						move(oldChild, newChildren[nextPos], older);
					} else {
						append(oldChild, older);
					}
					patch(newChildren[newIndex] = oldChild, newChild, oldChild.group);
				}
			}
			newIndex--;
		}
	}
	
	/**
	 * DOM
	 *
	 * @param  {Tree} newer
	 * @param  {Tree} host
	 * @param  {String?} xmlns
	 * @return {Node}
	 */
	function DOM (newer, host, xmlns) {
		try {
			if (xmlns === null) {
				return document.createElement(newer.tag);
			} else {
				return document.createElementNS(newer.xmlns === xmlns, newer.tag);
			}
		} catch (err) {
			return errorBoundary(err, host.owner, newer.flag = 3, 0);
		}
	}
	
	/**
	 * Create
	 *
	 * @param  {Tree} newer
	 * @param  {Tree?} _host
	 * @param  {Tree} parent
	 * @param  {Tree} sibling
	 * @param  {Number} action
	 * @param  {String?} _xmlns
	 */
	function create (older, _host, parent, sibling, action, _xmlns) {
		var host = _host;
		var xmlns = _xmlns;
		var group = older.group;
		var flag = older.flag;
		var type = 0;
		var owner;
		var node;
		var children;
		var length;
		var newer;
	
	 	// preserve last namespace context among children
	 	if (flag !== 1 && older.xmlns !== null) {
	 		xmlns = older.xmlns;
	 	}
	
	 	if (group > 0) {
	 		// every instance registers the last root component, children will use
	 		// this when attaching events, to support boundless events
	 		if (group > 1) {
	 			host = older.host = older;
	 		}
	
	 		newer = extract(older);
	 		flag = newer.flag;
	 		owner = older.owner;
	
	 		if (owner.componentWillMount !== void 0) {
	 			mountBoundary(owner, 0);
	 		}
	
	 		if (newer.group === 0) {
	 			type = 2;
	 		} else {
	 			create(newer, host, parent, sibling, action, xmlns);
	 		}
	 	} else {
	 		type = 2;
	
	 		if (host !== null) {
	 			older.host = host;
	 		}
	 	}
	
	 	if (type === 2) {
	 		if (flag === 1) {
	 			node = older.node = document.createTextNode((type = 1, older.children));
	 		} else {
	 			node = DOM(older, host, xmlns);
	
	 			if (older.flag === 3) {
	 				create(node, host, older, sibling, action, xmlns);
	 				copy(older, node, false);
	 				type = 0;
	 			} else {
	 				older.node = node;
	 				children = older.children;
	 				length = children.length;
	
	 				if (length > 0) {
	 					for (var i = 0, child; i < length; i++) {
	 						// hoisted
	 						if ((child = children[i]).node !== null) {
	 							copy(child = children[i] = new Tree(child.flag), child, false);
	 						}
	 						create(child, host, older, sibling, 1, xmlns);
	 					}
	 				}
	 			}
	 		}
	 	}
	
	 	if (type !== 0) {
	 		older.parent = parent;
	
	 		switch (action) {
	 			case 1: parent.node.appendChild(node); break;
	 			case 2: parent.node.insertBefore(node, sibling.node); break;
	 			case 3: parent.node.replaceChild(node, sibling.node); break;
	 		}
	 		if (type !== 1) {
	 			attribute(older, xmlns);
	 		}
	 	}
	
	 	if (group > 0 && owner.componentDidMount !== void 0) {
	 		mountBoundary(owner, 1);
	 	}
	}
	
	/**
	 * Swap
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 */
	function swap (older, newer) {
		create(newer, older.host, older.parent, older, 3, null);
	}
	
	/**
	 * Move
	 *
	 * @param {Tree} older
	 * @param {Tree} sibling
	 * @param {Tree} parent
	 */
	function move (older, sibling, parent) {
		parent.node.insertBefore(older.node, sibling.node);
	}
	
	/**
	 * Append
	 *
	 * @param {Tree} older
	 * @param {Tree} parent
	 */
	function append (older, parent) {
		parent.node.appendChild(older.node);
	}
	
	/**
	 * Remove
	 *
	 * @param {Tree} older
	 * @param {Tree} parent
	 */
	function remove (older, parent) {
		parent.node.removeChild(older.node);
	}
	
	/**
	 * Clear
	 *
	 * @param {Tree} older
	 */
	function clear (older) {
		older.node.textContent = null;
	}
	
	/**
	 * Text
	 *
	 * @param {Tree} older
	 * @param {String|Number} value
	 */
	function content (older, value) {
		older.node.nodeValue = value;
	}
	
	/**
	 * Attribute
	 *
	 * @param {Number} type
	 * @param {String} name
	 * @param {Any} value
	 * @param {String?} xmlns
	 * @param {Tree} newer
	 */
	function assign (type, name, value, xmlns, newer) {
		var node = newer.node;
	
		switch (type) {
			case 0: {
				if (value !== null && value !== void 0 && value !== false) {
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
					assign(0, 'class', value, xmlns, node);
				}
				break;
			}
			case 3: {
				if (node[name] === void 0) {
					node.style.setProperty(name, value);
				} else if (isNaN(Number(value)) === true) {
					assign(0, name, value, xmlns, node);
				} else {
					assign(6, name, value, xmlns, node);
				}
				break;
			}
			case 4: {
				node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value);
				break;
			}
			case 5:
			case 6: {
				node[name] = value;
				break;
			}
			case 10: {
				node.innerHTML = value;
				break;
			}
		}
	}
	
	/**
	 * Style
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} type
	 */
	function style (older, newer, type) {
		var node = older.node.style;
		var next = newer.attrs.style;
	
		if (typeof next !== 'string') {
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
		} else {
			node.cssText = next;
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
	function event (older, type, value, action) {
		var name = type.toLowerCase().substring(2);
		var host = older.host;
		var node = older.node;
		var fns = node._fns;
	
		if (fns === void 0) {
			fns = node._fns = {};
		}
	
		switch (action) {
			case 0: {
				node.removeEventListener(name, proxy);
	
				if (node._owner !== void 0) {
					node._owner = null;
				}
				break;
			}
			case 1: {
				node.addEventListener(name, proxy);
			}
			case 2: {
				if (host !== null && host.group > 1) {
					node._owner = host.owner;
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
	function proxy (e) {
		var type = e.type;
		var fns = this._fns;
		var fn = fns[type];
	
		if (fn === null || fn === void 0) {
			return;
		}
	
		var owner = this._owner;
	
		if (owner !== void 0) {
			eventBoundary(owner, fn, e);
		} else {
			fn.call(this, e);
		}
	}
	
	// hollow nodes
	var hollow = {'area': 0, 'base': 0, 'br': 0, '!doctype': 0, 'col': 0, 'embed': 0, 'wbr': 0, 'track': 0,
	'hr': 0, 'img': 0, 'input': 0, 'keygen': 0, 'link': 0, 'meta': 0, 'param': 0, 'source': 0};
	
	// unicode characters
	var unicodes = {'<': '&lt;', '>': '&gt;','"': '&quot;',"'": '&#39;','&': '&amp;'};
	
	/**
	 * Stringify
	 *
	 * @return {String}
	 */
	TreePrototype.toString = function () {
		if (this.group > 0) {
			return extract(this).toString();
		}
		var newer = this;
		var group = newer.group;
		var type = newer.type;
		var flag = newer.flag;
		var tag = newer.tag;
		var children = newer.children;
		var body = '';
		var length = 0;
		var props;
	
		if (flag === 1) {
			return sanitize(children);
		}
		if (newer.props !== object && newer.props.innerHTML !== void 0) {
			body = newer.props.innerHTML;
		} else if ((length = children.length) > 0) {
			for (var i = 0; i < length; i++) {
				body += children[i].toString();
			}
		}
		return '<'+tag+attrs(newer)+'>'+ (hollow[tag] !== 0 ? body+'</'+tag+'>' : '');
	}
	
	/**
	 * Stringify Attributes
	 *
	 * @param  {Tree} newer
	 * @return {String}
	 */
	function attrs (newer) {
		var props = newer.props;
		var body = '';
		var value;
		var val;
	
		if (props === object) {
			return body;
		}
	
		for (var name in props) {
			value = props[name];
	
			switch (attr(name)) {
				case 10: case 21: case 30: case 31: {
					continue;
				}
				case 1: {
					value = ' class="'+sanitize(value)+'"';
					break;
				}
				case 5: {
					value = props.value === void 0 ? ' value="'+sanitize(value)+'"' : '';
					break;
				}
				case 20: {
					if (typeof value === 'object') {
						name = '';
						for (var key in value) {
							val = value[key];
							if (key !== key.toLowerCase()) {
								key = key.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase();
							}
							name += key + ':' + val + ';';
						}
						value = name;
					}
					value = ' style="'+sanitize(value)+'"';
					break;
				}
				default: {
					switch (value) {
						case false: case null: case void 0: continue;
						case true: body += ' '+name; continue;
					}
					value = ' '+name+'="'+sanitize(value)+'"';
				}
			}
			body += value;
		}
		return body;
	}
	
	/**
	 * Sanitize String
	 *
	 * @param  {String|Boolean|Number} value
	 * @return {String}
	 */
	function sanitize (value) {
		return (value+'').replace(/[<>&"']/g, encode);
	}
	
	/**
	 * Encode Unicode
	 *
	 * @param  {String} char
	 * @return {String}
	 */
	function encode (char) {
		return unicodes[char] || char;
	}
	
	return {
		version: version,
		h: element,
		createElement: element,
		Component: Component,
		render: render,
		shallow: shallow
	}
	
}));
