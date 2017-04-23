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
	 * @param {Object} state
	 * @param {Function?} callback
	 */
	function setState (state, callback) {
		var owner = this;
		var newState;
		var prevState;
	
		if (state === void 0 || state === null) {
			return;
		}
		mergeState(prevState = owner._state = {}, owner.state, true);
	
		if (typeof newState === 'function') {
			newState = callbackBoundary(owner, newState, prevState, 0);
	
			if (newState === void 0 || newState === null) {
				return;
			}
		}
	
		newState = owner._pending = state;
	
		if (newState.constructor === Promise) {
			newState.then(function (value) {
				owner.setState(value);
			});
		} else {
			mergeState(owner.state, newState, false);
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
	
		patch(older, older, older, 3);
	
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
	 * Merge State
	 *
	 * @param  {Object} state
	 * @param  {Object} nextState
	 * @return {Object}
	 */
	function mergeState (state, nextState) {
		for (var name in nextState) {
			state[name] = nextState[name];
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
		var newer = new Tree(2);
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
		}
	
		switch (type.constructor) {
			case String: {
				newer.tag = type;
				newer.attrs = props;
				break;
			}
			case Function: {
				if ((proto = type.prototype) !== void 0 && proto.render !== void 0) {
					newer.group = 2;
				} else {
					newer.group = 1;
					newer.owner = type;
				}
				break;
			}
		}
		newer.type = type;
	
		if (length > 1) {
			newer.children = new Array(size);
	
			for (; i < length; i++) {
				index = adopt(newer, index, arguments[i]);
			}
		}
	
		return newer;
	}
	
	/**
	 * Adopt Element Children
	 *
	 * @param  {Tree} newer
	 * @param  {Number} index
	 * @param  {Any} decedent
	 * @return {Number}
	 */
	function adopt (newer, index, decedent) {
		var children = newer.children;
		var child;
		var length;
	
		if (decedent === null || decedent === void 0) {
			child = text('');
		} else if (decedent.group !== void 0) {
			if (newer.keyed === false && decedent.key !== null) {
				newer.keyed = true;
			}
			child = decedent;
		} else {
			switch (typeof decedent) {
				case 'function': {
					child = element(decedent, null);
					break;
				}
				case 'object': {
					if ((length = decedent.length) !== void 0) {
						for (var j = 0, i = index; j < length; j++) {
							i = adopt(newer, i, decedent[j]);
						}
						return i;
					} else {
						child = text(decedent.constructor === Date ? decedent+'' : '');
					}
					break;
				}
				default: {
					child = text(decedent);
				}
			}
		}
	
		children[index] = child;
	
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
	 * Clone Tree
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Boolean} deep
	 */
	function clone (older, newer, deep) {
		older.flag = newer.flag;
		older.tag = newer.tag;
		older.node = newer.node;
		older.attrs = newer.attrs;
		older.xmlns = newer.xmlns;
		older.async = newer.async;
		older.keyed = newer.keyed;
		older.children = newer.children;
	
		if (deep === true) {
			older.props = newer.props;
			older.owner = newer.owner;
			older.yield = newer.yield;
			older.group = newer.group;
			older.type = newer.type;
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
	 * Node Boundary
	 *
	 * @param  {Number} flag
	 * @param  {Tree} newer
	 * @param  {String?} xmlns
	 * @param  {Tree} ancestor
	 * @return {Node}
	 */
	function nodeBoundary (flag, newer, ancestor, xmlns) {
		try {
			if (xmlns === null) {
				return document.createElement(newer.tag);
			} else {
				return document.createElementNS(newer.xmlns === xmlns, newer.tag);
			}
		} catch (err) {
			return errorBoundary(err, ancestor.owner, newer.flag = 3, typeof ancestor.owner === 'function' ? 2 : 1);
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
	
		if (e !== null && e.defaultPrevented !== true && e.allowDefault !== true) {
			e.preventDefault();
		}
	
		if (state !== false) {
			if (sync === true) {
				owner.setState(state);
			} else {
				requestIdleCallback(function () {
					owner.setState(state);
				});
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
				switch (from) {
					case 1: return 'render';
					case 2: return 'function';
				}
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
				return 'render';
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
			message+'\n\n  ^^ Error caught in Component '+'"'+component+'"'+
			' from "'+location+'" \n'
		);
	}
	
	/**
	 * Attribute Identifier [Whitelist]
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
	 * Create Attributes
	 *
	 * @param {Tree} newer
	 * @param {Tree} ancestor
	 * @param {String?} xmlns
	 */
	function attribute (newer, ancestor, xmlns) {
		var attrs = newer.attrs;
		var type = 0;
		var value;
	
		for (var name in attrs) {
			type = attr(name);
	
			if (type < 31) {
				value = attrs[name];
	
				if (type === 30) {
					refs(value, ancestor, newer, 0);
				} else if (type < 20) {
					assign(type, name, value, xmlns, newer);
				} else if (type > 20) {
					event(newer, name, value, ancestor);
				} else {
					style(newer);
				}
			}
		}
	}
	
	/**
	 * Reconcile Attributes
	 *
	 * @param {Tree} newer
	 * @param {Tree} older
	 * @param {Tree} ancestor
	 */
	function attributes (older, newer, ancestor) {
		var old = older.attrs;
		var attrs = newer.attrs;
		var xmlns = older.xmlns;
		var type = 0;
		var prev;
		var next;
	
		for (var name in attrs) {
			type = attr(name);
	
			if (type < 31) {
				next = attrs[name];
	
				if (type === 30) {
					refs(next, ancestor, older, 2);
				} else {
					prev = old[name];
	
					if (next !== prev && next !== null && next !== void 0) {
						if (type < 20) {
							assign(type, name, next, xmlns, older);
						} else if (type > 20) {
							event(older, name, next, ancestor);
						} else {
							styles(older, newer);
						}
					}
				}
			}
		}
	
		for (var name in old) {
			type = attr(name);
	
			if (type < 30) {
				next = attrs[name];
	
				if (next === null || next === void 0) {
					if (type < 20) {
						assign(type, name, next, xmlns, older);
					} else if (type > 20) {
						event(older, name, next, ancestor);
					}
				}
			}
		}
	
		older.attrs = attrs;
	}
	
	/**
	 * Create Refs
	 *
	 * @param  {Function|String} value
	 * @param  {Tree} ancestor
	 * @param  {Tree} older
	 * @param  {Number} type
	 */
	function refs (value, ancestor, older, type) {
		var stateful;
		var owner;
	
		if (ancestor !== null) {
			if ((owner = ancestor.owner) !== null && ancestor.group > 1) {
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
				if (stateful === true && type === 0) {
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
				patch(older, newer, older, 0);
			}
		});
	
		return older.node !== null ? older : text('');;
	}
	
	/**
	 * Exchange Tree
	 *
	 * @param {Tree} newer
	 * @param {Tree} older
	 * @param {Tree} ancestor
	 * @param {Boolean} deep
	 */
	function exchange (older, newer, ancestor, deep) {
		swap(older, newer, ancestor);
	
		if (older.flag !== 1 && older.children.length > 0) {
			unmount(older, false);
		}
	
		if (older.owner !== null && older.owner.componentWillUnmount !== void 0) {
			mountBoundary(older.owner, 2);
		}
	
		clone(older, newer, deep);
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
			older.owner = null;
			older.node = null;
		}
	}
	
	/**
	 * Fill Children
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} length
	 * @param {Tree} ancestor
	 */
	function fill (older, newer, length, ancestor) {
		var parent = older.node;
		var children = newer.children;
	
		for (var i = 0, child; i < length; i++) {
			create(child = children[i], ancestor, 1, null, parent, null);
		}
		older.children = children;
	}
	
	/**
	 * Render Tree
	 *
	 * @param  {Tree} _newer
	 * @param  {Node} _target
	 */
	function render (_newer, _target) {
		var newer = _newer;
		var target = _target;
		var older;
	
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
				mount = global.document !== void 0 ? (document.body || document.documentElement) : null;
			}
	
			target = mount;
	
			// server enviroment
			if (target === null && newer.toString !== void 0) {
				return newer.toString();
			}
		}
	
		if ((older = target._older) !== void 0) {
			if (older.key === newer.key) {
				patch(older, newer, older, older.group);
			} else {
				exchange(older, newer, newer, true);
			}
		} else {
			create(newer, newer, 1, null, target, null);
			target._older = newer;
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
	 * Patch Tree
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Tree} _ancestor
	 * @param {Number} group
	 */
	function patch (older, _newer, _ancestor, group) {
		var ancestor = _ancestor;
		var newer = _newer;
	
		if (older.type !== newer.type) {
			return exchange(older, newer, ancestor, true);
		}
	
		if (group > 0) {
			if (shouldUpdate(older, newer, group) === false) {
				return;
			}
	
			newer = shape(renderBoundary(older, group), older, true);
	
			if (newer.tag !== older.tag) {
				return exchange(older, newer, older, false);
			}
	
			if (older.async === 2) {
				return;
			}
	
			older.async = 0;
	
			if (group > 1) {
				ancestor = older;
			}
		}
	
		if (older.flag === 1) {
			return content(older.node, older.children = newer.children);
		}
	
		var newLength = newer.children.length;
		var oldLength = older.children.length;
	
		if (oldLength === 0) {
			// fill children
			if (newLength !== 0) {
				fill(older, newer, newLength, ancestor), older.children = newer.children;
			}
		} else if (newLength === 0) {
			// empty children
			if (oldLength !== 0) {
				unmount(older, false), clear(older.node), older.children = newer.children;
			}
		} else if (newer.keyed === true) {
			keyed(older, newer, ancestor, oldLength, newLength);
		} else {
			nonkeyed(older, newer, ancestor, oldLength, newLength);
		}
	
		attributes(older, newer, ancestor);
	
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
	 * Reconcile Non-Keyed Children
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Tree} ancestor
	 * @param  {Number} _oldLength
	 * @param  {Number} _newLength
	 */
	function nonkeyed (older, newer, ancestor, _oldLength, _newLength) {
		var parent = older.node;
		var oldChildren = older.children;
		var newChildren = newer.children;
		var oldLength = _oldLength;
		var newLength = _newLength;
		var length = newLength > oldLength ? newLength : oldLength;
	
		for (var i = 0, newChild, oldChild; i < length; i++) {
			if (i >= newLength) {
				oldChild = oldChildren.pop();
				if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
					mountBoundary(oldChild.owner, 2);
				}
				remove(oldChild.node, parent);
				unmount(oldChild, true);
				oldLength--;
			} else if (i >= oldLength) {
				create(newChild = oldChildren[i] = newChildren[i], ancestor, 1, null, parent, null);
				oldLength++;
			} else {
				newChild = newChildren[i];
				oldChild = oldChildren[i];
	
				if (newChild.flag === 1 && oldChild.flag === 1) {
					content(oldChild.node, oldChild.children = newChild.children);
				} else if (newChild.type !== oldChild.type) {
					if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
						mountBoundary(oldChild.owner, 2);
					}
					change(oldChild, oldChildren[i] = newChild, parent, ancestor);
					unmount(oldChild, true);
				} else {
					patch(oldChild, newChild, ancestor, oldChild.group);
				}
			}
		}
	}
	
	/**
	 * Reconcile Keyed Children [Simple]
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Tree} ancestor
	 * @param {Number} oldLength
	 * @param {Number} newLength
	 */
	function keyed (older, newer, ancestor, oldLength, newLength) {
	 	var parent = older.node;
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
	 	var nextNode;
	
	 	// step 1, sync leading [a, b ...], trailing [... c, d], opposites [a, b] [b, a] recursively
	 	outer: while (true) {
	 		// sync leading nodes
	 		while (oldStartNode.key === newStartNode.key) {
	 			newChildren[newStart] = oldStartNode;
	 			patch(oldStartNode, newStartNode, ancestor, oldStartNode.group);
	
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
	 			patch(oldEndNode, newEndNode, ancestor, oldEndNode.group);
	
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
	 			move(oldEndNode.node, oldStartNode.node, parent);
	 			patch(oldEndNode, newStartNode, ancestor, oldEndNode.group);
	
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
	 				move(oldStartNode.node, oldChildren[nextPos].node, parent);
	 			} else {
	 				append(oldStartNode.node, parent);
	 			}
	
	 			patch(oldStartNode, newEndNode, ancestor, oldStartNode.group);
	
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
	 			nextNode = nextPos < newLength ? newChildren[nextPos].node : null;
	
	 			do {
	 				create(newStartNode = newChildren[newStart++], ancestor, 2, null, parent, nextNode);
	 			} while (newStart <= newEnd);
	 		}
	 	} else if (newStart > newEnd) {
	 		// new children is synced, remove the difference
	 		do {
	 			oldStartNode = oldChildren[oldStart++];
	 			if (oldStartNode.group > 0 && oldStartNode.owner.componentWillUnmount !== void 0) {
	 				mountBoundary(oldStartNode.owner, 2);
	 			}
	 			remove(oldStartNode.node, parent);
	 			unmount(oldStartNode, true);
	 		} while (oldStart <= oldEnd);
	 	} else if (newStart === 0 && newEnd === newLength-1) {
	 		// all children are out of sync, remove all, append new set
	 		unmount(older, false);
	 		clear(parent);
	 		fill(older, newer, newLength, ancestor);
	 	} else {
	 		// could sync all children, move on the the next phase
	 		complex(older, newer, ancestor, oldStart, newStart, oldEnd+1, newEnd+1, oldLength, newLength);
	 	}
	 	older.children = newChildren;
	}
	
	/**
	 * Reconcile Keyed Children [Complex]
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Tree} ancestor
	 * @param {Number} oldStart
	 * @param {Number} newStart
	 * @param {Number} oldEnd
	 * @param {Number} newEnd
	 * @param {Number} oldLength
	 * @param {number} newLength
	 */
	function complex (older, newer, ancestor, oldStart, newStart, oldEnd, newEnd, oldLength, newLength) {
		var parent = older.node;
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
		var nextNode;
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
				oldIndex = oldStart;
				newIndex = newStart;
				break;
			}
		}
	
		// step 2, insert and sync nodes from left to right [a, b, ...]
		while (newIndex < newEnd) {
			newChild = newChildren[newIndex];
			oldIndex = oldKeys[newChild.key];
	
			// new child doesn't exist in old children, insert
			if (oldIndex === void 0) {
				nextPos = newIndex - newOffset;
				nextNode = nextPos < oldLength ? oldChildren[nextPos].node : null;
				create(newChild, ancestor, 2, null, parent, nextNode);
				newOffset++;
			} else if (newIndex === oldIndex) {
				oldChild = oldChildren[oldIndex];
				patch(newChildren[newIndex] = oldChild, newChild, ancestor, oldChild.group);
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
				remove(oldChild.node, parent);
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
						move(oldChild.node, newChildren[nextPos].node, parent);
					} else {
						append(oldChild.node, parent);
					}
					patch(newChildren[newIndex] = oldChild, newChild, ancestor, oldChild.group);
				}
			}
			newIndex--;
		}
	}
	
	/**
	 * Create Node
	 *
	 * @param  {Tree} newer
	 * @param  {Tree?} _ancestor
	 * @param  {Number} action
	 * @param  {String?} _xmlns
	 * @param  {Node} parent
	 * @param  {Node} sibling
	 */
	 function create (older, _ancestor, action, _xmlns, parent, sibling) {
	 	var xmlns = _xmlns;
	 	var ancestor = _ancestor;
	 	var group = older.group;
	 	var flag = older.flag;
	 	var type = 0;
	 	var owner;
	 	var node;
	 	var children;
	 	var length;
	 	var newer;
	
	 	// preserve last namespace among children
	 	if (flag !== 1 && older.xmlns !== null) {
	 		xmlns = older.xmlns;
	 	}
	
	 	if (group > 0) {
	 		// every instance registers the last root component, children will use
	 		// this when attaching events, to support boundless events
	 		if (group > 1) {
	 			ancestor = older;
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
	 			create(newer, ancestor, action, xmlns, parent, sibling);
	 		}
	 	} else {
	 		type = 2;
	 	}
	
	 	if (type === 2) {
	 		if (flag === 1) {
	 			node = older.node = document.createTextNode((type = 1, older.children));
	 		} else {
	 			node = nodeBoundary(flag, older, ancestor, xmlns);
	
	 			if (older.flag === 3) {
	 				create(node, ancestor, action, xmlns, parent, sibling);
	 				clone(older, node, (type = 0, false));
	 			} else {
	 				older.node = node;
	 				children = older.children;
	 				length = children.length;
	
	 				if (length > 0) {
	 					for (var i = 0, child; i < length; i++) {
	 						// hoisted
	 						if ((child = children[i]).node !== null) {
	 							clone(child = children[i] = new Tree(child.flag), child, false);
	 						}
	 						create(child, ancestor, 1, xmlns, node, null);
	 					}
	 				}
	 			}
	 		}
	 	}
	
	 	if (type !== 0) {
	 		switch (action) {
	 			case 1: parent.appendChild(node); break;
	 			case 2: parent.insertBefore(node, sibling); break;
	 			case 3: parent.replaceChild(node, sibling); break;
	 		}
	 		if (type !== 1) {
	 			attribute(older, ancestor, xmlns);
	 		}
	 	}
	
	 	if (group > 0 && owner.componentDidMount !== void 0) {
	 		mountBoundary(owner, 1);
	 	}
	 }
	
	/**
	 * Change Node
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Node} parent
	 * @param {Tree} ancestor
	 */
	function change (older, newer, parent, ancestor) {
		create(newer, ancestor, 3, null, parent, older.node);
	}
	
	/**
	 * Swap Node
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Tree} ancestor
	 */
	function swap (older, newer, ancestor) {
		create(newer, ancestor, 3, null, older.node.parentNode, older.node);
	}
	
	/**
	 * Move Node
	 *
	 * @param {Node} node
	 * @param {Node} sibling
	 * @param {Node} parent
	 */
	function move (node, sibling, parent) {
		parent.insertBefore(node, sibling);
	}
	
	/**
	 * Append Node
	 *
	 * @param {Node} node
	 * @param {Node} parent
	 */
	function append (node, parent) {
		parent.appendChild(node);
	}
	
	/**
	 * Remove Node
	 *
	 * @param {Node} node
	 * @param {Node} parent
	 */
	function remove (node, parent) {
		parent.removeChild(node);
	}
	
	/**
	 * Replace Node
	 *
	 * @param {Node} node
	 * @param {Node} sibling
	 * @param {Node} parent
	 */
	function replace (node, sibling, parent) {
		parent.replaceChild(node, sibling);
	}
	
	/**
	 * Clear Node
	 *
	 * @param {Node} node
	 */
	function clear (node) {
		node.textContent = null;
	}
	
	/**
	 * Update Text Content
	 *
	 * @param {Node} older
	 * @param {String|Number} value
	 */
	function content (node, value) {
		node.nodeValue = value;
	}
	
	/**
	 * Assign Attributes
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
					assign(2, name, value, xmlns, node);
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
	 * Assign Unknown Attribute
	 *
	 * @param {String} name
	 * @param {Any} value
	 * @param {Node} node
	 */
	function set (name, value, node) {
		try {
			node[name] = value;
		} catch (err) {}
	}
	
	/**
	 * Assign Styles
	 *
	 * @param {Tree} newer
	 */
	function style (newer) {
		var node = newer.node.style;
		var next = newer.attrs.style;
	
		if (typeof next === 'string') {
			node.cssText = next;
		} else {
			for (var name in next) {
				if (name in node) {
					node[name] = next[name];
				}
			}
		}
	}
	
	/**
	 * Update Styles
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 */
	function styles (older, newer) {
		var node = older.node.style;
		var next = newer.attrs.style;
		var prev = older.attrs.style;
		var value;
	
		if (typeof next === 'string') {
			if (next !== prev) {
				node.cssText = next;
			}
		} else {
			for (var name in next) {
				if ((value = next[name]) !== prev[name]) {
					node[name] = value;
				}
			}
		}
	}
	
	/**
	 * Create Events
	 *
	 * @param {Tree} older
	 * @param {String} name
	 * @param {Function} handler
	 * @param {Tree} ancestor
	 */
	function event (older, name, handler, ancestor) {
		older.node[name.toLowerCase()] = typeof handler !== 'function' ? null : (
			ancestor !== null && ancestor.group > 1 ? function proxy (e) {
				eventBoundary(ancestor.owner, handler, e);
			} : handler
		);
	}
	
	// hollow nodes
	var hollow = {'area': 0, 'base': 0, 'br': 0, '!doctype': 0, 'col': 0, 'embed': 0, 'wbr': 0, 'track': 0,
	'hr': 0, 'img': 0, 'input': 0, 'keygen': 0, 'link': 0, 'meta': 0, 'param': 0, 'source': 0};
	
	// unicode characters
	var unicodes = {'<': '&lt;', '>': '&gt;','"': '&quot;',"'": '&#39;','&': '&amp;'};
	
	/**
	 * Stringify Tree
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
	 * @param  {String} _char
	 * @return {String}
	 */
	function encode (_char) {
		var char = unicodes[char];
		return char !== void 0 ? char : _char;
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
