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
	var browser = global.window !== void 0;
	var Promise = global.Promise || noop;
	var schedule = global.requestIdleCallback || global.requestAnimationFrame || setTimeout;
	
	/**
	 * ## Element Flags
	 *
	 * 1: text
	 * 2: element
	 * 3: error
	 * 4: n/a
	 * 5: n/a
	 * 6: n/a
	 * 7: n/a
	 * 8: n/a
	 * 9: n/a
	 * 10: n/a
	 * 11: n/a
	 *
	 * ## Element Groups
	 *
	 * 0: Element
	 * 1: Function
	 * 2: Component
	 * 3: Component
	 */
	
	/**
	 * ## Element Shape
	 *
	 * name: node tag {String}
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
	 * host: node host component(composites) {Component?}
	 * async: node work state {Number}
	 */
	
	 /**
	  * ## Element Async Flag
	  *
	  * 0: ready(sync)
	  * 1: blocked(delegates) `instance creation | prior set state`
	  * 2: pending(async) `resolving async render`
	  */
	
	/**
	 * ## Component Shape
	 *
	 * _tree: current tree {Tree?}
	 * _state: previous state {Object}
	 * _async: component async, tracks async lifecycle methods flag {Number}
	 *
	 * props: current props {Object}
	 * state: current state {Object}
	 * refs: refs {Object?}
	 * setState: method {Function}
	 * forceUpdate: method {Function}
	 */
	
	/**
	 * ## Notes
	 *
	 * `_name` prefix is used to identify function arguments
	 * when the value is expected to change within the function
	 * and private component properties.
	 *
	 * All code that interfaces with the DOM platform is in DOM.js
	 * it was structured this way to allow for future work on bridges with other platforms
	 * when that becomes possible and overall seperation of concerns.
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
		this.async = 0;
		this._tree = null;
	
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
		this._state = state;
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
	 * @param  {Class} type
	 * @param  {Object} proto
	 */
	function extendClass (type, proto) {
		if (proto.constructor !== type) {
			Object.defineProperty(proto, 'constructor', {value: type});
		}
		Object.defineProperties(proto, ComponentPrototype);
	}
	
	/**
	 * setState
	 *
	 * @param {Object} state
	 * @param {Function=} callback
	 */
	function setState (state, callback) {
		var nextState;
		var prevState;
		var owner;
	
		if (state === void 0 || state === null) {
			return;
		}
		nextState = state;
		prevState = this._state = this.state;
	
		if (typeof nextState === 'function') {
			nextState = callbackBoundary(this, nextState, prevState, 0);
	
			if (nextState === void 0 || nextState === null) {
				return;
			}
		}
	
		if (nextState.constructor === Promise) {
			owner = this;
			nextState.then(function (value) {
				owner.setState(value);
			});
		} else {
			this.state = updateState({}, prevState, nextState);
			this.forceUpdate(callback);
		}
	}
	
	/**
	 * forceUpdate
	 *
	 * @param {Function=} callback
	 */
	function forceUpdate (callback) {
		var older = this._tree;
	
		if (older === null || older.node === null || this.async !== 0) {
			return;
		}
	
		patch(older, older, 3, older);
	
		if (callback !== void 0 && typeof callback === 'function') {
			callbackBoundary(this, callback, this.state, 1);
		}
	}
	
	/**
	 * Update State
	 *
	 * @param  {Object} state
	 * @param  {Object} prevState
	 * @param  {Object} nextState
	 * @return {Object}
	 */
	function updateState (state, prevState, nextState) {
		for (var name in prevState) {
			state[name] = prevState[name];
		}
		for (var name in nextState) {
			state[name] = nextState[name];
		}
		return state;
	}
	
	/**
	 * shouldUpdate
	 *
	 * @param  {Tree} older
	 * @param  {Tree} _newer
	 * @param  {Number} group
	 * @param  {Tree} ancestor
	 * @return {Tree?}
	 */
	function shouldUpdate (older, _newer, group, ancestor) {
		var type = older.type;
		var owner = older.owner;
		var nextProps = _newer.props;
		var prevProps = older.props;
		var recievedProps;
		var defaultProps;
		var prevState;
		var nextState;
		var nextProps;
		var prevProps;
		var newer;
		var host;
		var tag;
	
		if (owner === null || older.async !== 0) {
			return;
		}
	
		older.async = 1;
	
		if (group > 1) {
			nextState = owner.state;
			prevState = owner._state;
		} else {
			nextState = nextProps;
			prevState = prevProps;
		}
	
		recievedProps = group < 3 && nextProps !== object;
	
		if (recievedProps === true) {
			if (type.propTypes !== void 0) {
				propTypes(owner, type, nextProps);
			}
			if (owner.componentWillReceiveProps !== void 0) {
				dataBoundary(owner, 0, nextProps);
			}
			defaultProps = older.type.defaultProps;
	
			if (defaultProps !== void 0) {
				merge(defaultProps, nextProps);
			}
		}
	
		if (
			owner.shouldComponentUpdate !== void 0 &&
			updateBoundary(owner, 0, nextProps, nextState) === false
		) {
			older.async = 0;
		} else {
			if (recievedProps === true) {
				(group > 1 ? owner : older).props = nextProps;
			}
			if (owner.componentWillUpdate !== void 0) {
				updateBoundary(owner, 1, nextProps, nextState);
			}
	
			newer = shape(renderBoundary(group > 1 ? owner : older, group), older);
	
			if ((tag = newer.tag) !== older.tag) {
				newer = updateHost(older, newer, ancestor, tag);
			}
			if (owner.componentDidUpdate !== void 0) {
				updateBoundary(owner, 2, prevProps, prevState);
			}
	
			if (older.async === 2) {
				return;
			}
	
			older.async = 0;
			return newer;
		}
	}
	
	/**
	 * Update Host
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Tree} ancestor
	 * @param  {String?} tag
	 */
	function updateHost (older, newer, ancestor, tag) {
		var host;
		var owner;
		var type;
	
		if (tag !== null) {
			return exchange(older, newer, 0, older);
		}
	
		if ((host = older.host) !== null) {
			owner = host.owner;
			type = newer.type;
	
			if (owner === type || (owner instanceof type)) {
				return patch(host, newer, host.group, ancestor);
			}
		}
	
		exchange(older, newer, 2, older);
		refresh(older);
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
		var children = length !== 1 ? [] : array;
		var tree = new Tree(2);
		var index = 0;
		var i = 2;
		var proto;
	
		if (props !== null) {
			if (props.group !== void 0 || props.constructor !== Object) {
				props = object;
				i = 1;
			} else {
				tree.props = props;
	
				if (props.key !== void 0) {
					tree.key = props.key;
				}
				if (props.xmlns !== void 0) {
					tree.xmlns = props.xmlns;
				}
			}
		}
	
		switch (typeof type) {
			case 'string': {
				tree.tag = type;
				tree.attrs = props;
				break;
			}
			case 'function': {
				if ((proto = type.prototype) !== void 0 && proto.render !== void 0) {
					tree.group = 2;
				} else {
					tree.group = 1;
					tree.owner = type;
				}
				break;
			}
			default: {
				tree.tag = 'noscript';
			}
		}
	
		tree.type = type;
		tree.children = children;
	
		if (length !== 1) {
			for (; i < length; i++) {
				index = adopt(tree, index, arguments[i]);
			}
		}
		return tree;
	}
	
	/**
	 * Adopt Element Children
	 *
	 * @param  {Tree} tree
	 * @param  {Number} index
	 * @param  {Any} child
	 * @return {Number}
	 */
	function adopt (tree, index, child) {
		var children = tree.children;
		var i = index;
		var length;
	
		if (child === null || child === void 0) {
			children[i] = text('');
		} else if (child.group !== void 0) {
			if (tree.keyed === false) {
				if (child.key !== null) {
					tree.keyed = true;
				}
			} else if (child.key === null) {
				// assign float key to non-keyed children in a keyed tree
				// an obscure floating point key avoids conflicts with int keyed children
				child.key = index/161800;
			}
			children[i] = child;
		} else {
			switch (typeof child) {
				case 'function': children[i] = element(child, null); break;
				case 'object': {
					if ((length = child.length) > 0) {
						for (var j = 0; j < length; j++) {
							i = adopt(tree, i, child[j]);
						}
						return i;
					} else if (child.constructor === Date) {
						return adopt(tree, i, text(child+''));
					} else {
						return adopt(tree, i, text(''));
					}
				}
				default: {
					return adopt(tree, i, text(child));
				}
			}
		}
		return i + 1;
	}
	
	/**
	 * Create Text
	 *
	 * @param  {String|Number|Boolean} value
	 * @param  {Tree}
	 * @return {Tree}
	 */
	function text (value) {
		var tree = new Tree(1);
	
		tree.type = tree.tag = '#text';
		tree.children = ((value === true || value === false) ? '' : value);
	
		return tree;
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
	 * Copy Tree [Shallow]
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 */
	function copy (older, newer) {
		older.tag = newer.tag;
		older.flag = newer.flag;
		older.node = newer.node;
		older.attrs = newer.attrs;
		older.keyed = newer.keyed;
		older.xmlns = newer.xmlns;
		older.children = newer.children;
	}
	
	/**
	 * Clone Tree [Deep]
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Boolean} type
	 */
	function clone (older, newer, type) {
		older.flag = newer.flag;
		older.tag = newer.tag;
		older.node = newer.node;
		older.attrs = newer.attrs;
		older.xmlns = newer.xmlns;
		older.async = newer.async;
		older.keyed = newer.keyed;
		older.parent = newer.parent;
		older.children = newer.children;
	
		switch (type) {
			case 1: {
				older.props = newer.props;
				older.owner = newer.owner;
				older.type = newer.type;
				older.group = newer.group;
				older.host = newer.host;
				older.key = newer.key;
				break;
			}
			case 2: {
				older.host = newer.owner === 'function' ? shape(newer.owner, newer) : newer;
				break;
			}
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
		this.host = null;
		this.node = null;
		this.group = 0;
		this.async = 0;
		this.props = object;
		this.attrs = object;
		this.xmlns = null;
		this.owner = null;
		this.keyed = false;
		this.parent = null;
		this.children = null;
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
				case 2: return returnBoundary(owner.componentDidUpdate(props, state), owner, null, true);
			}
		} catch (err) {
			errorBoundary(err, owner, 1, type);
		}
	}
	
	/**
	 * Render Boundary
	 *
	 * @param  {Component|Tree} owner
	 * @param  {Number} cast
	 * @return {Tree}
	 */
	function renderBoundary (owner, cast) {
		try {
			switch (cast) {
				case 1: return owner.type(owner.props);
				case 2: case 3: return owner.render(owner.props, owner.state);
			}
		} catch (err) {
			return errorBoundary(err, cast === 1 ? owner : owner.type, 3, cast);
		}
	}
	
	/**
	 * Node Boundary
	 *
	 * @param  {Number} flag
	 * @param  {Tree} newer
	 * @param  {String?} xmlns
	 * @param  {Component} owner
	 * @return {Node}
	 */
	function nodeBoundary (flag, newer, xmlns, owner) {
		try {
			if (xmlns === null) {
				return createElement(newer.tag);
			} else {
				return createElementNS(newer.xmlns === xmlns, newer.tag);
			}
		} catch (err) {
			return errorBoundary(err, owner, newer.flag = 3, typeof owner === 'function' ? 2 : 1);
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
				schedule(function () {
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
		var tree;
	
		try {
			location = errorLocation(type, from) || component;
	
			if (owner !== null) {
				if (owner.componentDidThrow !== void 0) {
					tree = owner.componentDidThrow({location: location, message: message});
				}
				component = typeof owner === 'function' ? owner.name : owner.constructor.name;
			}
		} catch (err) {
			message = err;
			location = 'componentDidThrow';
		}
		errorMessage(component, location, message instanceof Error ? message.stack : message);
	
		if (type === 3 || type === 5) {
			return shape(tree, owner._tree);
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
	 * Create Attributes
	 *
	 * @param {Tree} newer
	 * @param {Component?} owner
	 * @param {String?} xmlns
	 * @param {Node} node
	 * @param {Boolean} hydrate
	 */
	function attribute (newer, owner, xmlns, node, hydrate) {
		var newAttrs = newer.attrs;
		var value;
	
		for (var name in newAttrs) {
			if (name !== 'key' && name !== 'children') {
				value = newAttrs[name];
	
				if (name !== 'ref') {
					if (evt(name) === true) {
						event(node, name, owner, value);
					} else if (hydrate === false) {
						assign(attr(name), name, value, xmlns, node, newer);
					}
				} else {
					refs(value, owner, node, 0);
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
		var oldAttrs = older.attrs;
		var newAttrs = newer.attrs;
		var xmlns = older.xmlns;
		var node = older.node;
		var owner = ancestor.owner;
		var oldValue;
		var newValue;
	
		for (var name in newAttrs) {
			if (name !== 'key' && name !== 'children') {
				newValue = newAttrs[name];
	
				if (name !== 'ref') {
					oldValue = oldAttrs[name];
	
					if (newValue !== oldValue && newValue !== null && newValue !== void 0) {
						if (evt(name) === false) {
							assign(attr(name), name, newValue, xmlns, node, ancestor);
						} else {
							event(node, name, owner, newValue);
						}
					}
				} else {
					refs(newValue, ancestor.owner, node, 2);
				}
			}
		}
	
		for (var name in oldAttrs) {
			if (name !== 'key' && name !== 'children' && name !== 'ref') {
				newValue = newAttrs[name];
	
				if (newValue === null || newValue === void 0) {
					if (evt(name) === false) {
						assign(attr(name), name, newValue, xmlns, node, ancestor);
					} else {
						event(node, name, owner, newValue);
					}
				}
			}
		}
	
		older.attrs = newAttrs;
	}
	
	/**
	 * Create Refs
	 *
	 * @param  {Function|String} value
	 * @param  {Component} owner
	 * @param  {Node} node
	 * @param  {Number} type
	 */
	function refs (value, owner, node, type) {
		if (owner !== null && owner.refs === null) {
			owner.refs = {};
		}
	
		switch (typeof value) {
			case 'function': {
				callbackBoundary(owner, value, node, type);
				break;
			}
			case 'string': {
				if (type === 0 && owner !== null) {
					owner.refs[value] = node;
				}
				break;
			}
		}
	}
	
	/**
	 * Attribute Identifier [Whitelist]
	 *
	 * @param  {String} name
	 * @param  {Tree} tree
	 * @return {Number}
	 */
	function attr (name, tree) {
		switch (name) {
			case 'class':
			case 'className': return 1;
			case 'style': return 2;
			case 'width':
			case 'height': return 3;
			case 'id':
			case 'selected':
			case 'hidden':
			case 'value':
			case 'innerHTML': return 5;
			case 'xlink:href': return 6;
			default: return 0;
		}
	}
	
	/**
	 * Event Attribute Validator [Whitelist]
	 *
	 * @param  {String} name
	 * @return {Boolean}
	 */
	function evt (name) {
		return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110;
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
	 * @param  {Tree} tree
	 * @return {Tree}
	 */
	function extract (tree) {
		var type = tree.type;
		var props = tree.props;
		var children = tree.children;
		var length = children.length;
		var group = tree.group;
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
	
			if (owner.async === 0) {
				tree.async = 1;
				newer = renderBoundary(owner, group);
				tree.async = 0;
			}
			newer = shape(newer, tree);
			owner._tree = tree;
			tree.owner = owner;
		} else {
			newer = shape(renderBoundary(tree, group), tree);
		}
		return newer;
	}
	
	/**
	 * Shape Tree
	 *
	 * @param  {Any} _newer
	 * @param  {Tree?} older
	 * @return {Tree}
	 */
	function shape (_newer, older) {
		var newer = (_newer !== null && _newer !== void 0) ? _newer : text('');
	
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
						case Promise: return resolve(newer, older);
						case Array: newer = fragment(newer); break;
						case Date: newer = text(newer+''); break;
						case Object: newer = text(''); break;
						default: tree = text('');
					} break;
				}
			}
		}
		return newer;
	}
	
	/**
	 * Resolve Tree
	 *
	 * @param {Promise} pending
	 * @param {Tree} older
	 */
	function resolve (pending, older) {
		older.async = 2;
	
		pending.then(function (value) {
			var newer = value;
			if (older.node === null) {
				return;
			}
			older.async = 0;
			newer = shape(newer, older);
			if (older.tag !== newer.tag) {
				exchange(older, newer, 0, older);
			} else {
				patch(older, newer, 0, older);
			}
		});
	
		return older.node !== null ? older : text('');;
	}
	
	/**
	 * Exchange Tree
	 *
	 * @param {Tree} newer
	 * @param {Tree} older
	 * @param {Number} type
	 * @param {Tree} ancestor
	 */
	function exchange (older, newer, type, ancestor) {
		swap(older, newer, ancestor);
	
		switch (type) {
			case 0: {
				if (older.flag !== 1 && older.children.length > 0) {
					empty(older);
				}
				clone(older, newer, type);
				break;
			}
			case 1: {
				unmount(older);
				break;
			}
			case 2: {
				if (older.host !== null) {
					unmount(older.host);
				}
				break;
			}
		}
		clone(older, newer, type);
	}
	
	/**
	 * Refresh Tree
	 *
	 * @param {Tree} older
	 */
	function refresh (older) {
		var parent = older.parent;
	
		if (parent !== null) {
			parent.node = older.node;
			refresh(parent);
		}
	}
	
	/**
	 * Unmount
	 *
	 * @param {Tree} older
	 */
	function unmount (older) {
		var owner = older.owner;
		var host = older.host;
	
		if (owner !== null && owner.componentWillUnmount !== void 0) {
			mountBoundary(owner, 2);
		}
	
		if (host !== null) {
			unmount(host);
		}
	}
	
	/**
	 * Empty Children
	 *
	 * @param  {Tree} older
	 */
	function empty (older) {
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
			empty(child);
		}
		older.parent = null;
		older.host = null;
		older.owner = null;
		older.node = null;
	}
	
	/**
	 * Fill Children
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Tree} ancestor
	 */
	function fill (older, newer, ancestor) {
		var owner = ancestor.owner;
		var parent = older.node;
		var children = newer.children;
		var length = children.length;
	
		for (var i = 0, child; i < length; i++) {
			create(child = children[i], null, owner, parent, null, 1);
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
	
		if (target === void 0) {
			// mount points to document.body, if it's null dio was loaded before
			// the body node, try to use <body> if it exists at this point
			// else default to the root <html> node
			if (mount === null) {
				mount = browser === true ? (document.body || document.documentElement) : null;
			}
			target = mount;
	
			// server enviroment
			if (target === null && newer.toString !== void 0) {
				return newer.toString();
			}
		}
	
		if ((older = target._older) !== void 0) {
			if (older.key === newer.key) {
				patch(older, newer, older.group, older);
			} else {
				exchange(older, newer, 1, newer);
			}
		} else {
			create(newer, null, newer.owner, target, null, 1);
			target._older = newer;
		}
	}
	
	/**
	 * Shallow Render
	 *
	 * @param  {Any} _tree
	 * @return {Tree}
	 */
	function shallow (_tree) {
		var tree = shape(_tree, null);
	
		while (tree.tag === null) {
			tree = extract(tree);
		}
	
		return tree;
	}
	
	/**
	 * Patch Tree
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Number} group
	 * @param {Tree} _ancestor
	 */
	function patch (older, _newer, group, _ancestor) {
		var ancestor = _ancestor;
		var newer = _newer;
	
		if (group > 0) {
			if (older.type !== newer.type) {
				return exchange(older, newer, 1, ancestor);
			}
	
			if ((newer = shouldUpdate(older, newer, group, ancestor)) === void 0) {
				return;
			}
			// ancestor represents the last root component
			// we need to keep refererence of this to support
			// boundless events when creating new nodes
			if (group > 1) {
				ancestor = older;
			}
		}
	
		if (older.flag === 1) {
			return content(older.node, older.children = newer.children);
		}
	
		var newLength = newer.children.length;
		var oldLength = older.children.length;
	
		// fill children
		if (oldLength === 0) {
			if (newLength !== 0) {
				fill(older, newer, ancestor);
				older.children = newChildren;
			}
			return;
		}
		// empty children
		if (newLength === 0) {
			if (oldLength !== 0) {
				empty(older);
				older.children = newChildren;
				clear(older.node);
			}
			return;
		}
	
		if (older.keyed === true) {
			keyed(older, newer, ancestor, oldLength, newLength);
		} else {
			nonkeyed(older, newer, ancestor, oldLength, newLength);
		}
	
		attributes(older, newer, ancestor);
	}
	
	/**
	 * Reconcile Non-Keyed Children
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Tree} ancestor
	 * @param  {Number}
	 * @param  {Number}
	 */
	function nonkeyed (older, newer, ancestor, _oldLength, _newLength) {
		var owner = ancestor.owner;
		var parent = older.node;
		var oldChildren = older.children;
		var newChildren = newer.children;
		var newLength = _oldLength;
		var oldLength = _newLength;
		var length = newLength > oldLength ? newLength : oldLength;
	
		// patch non-keyed children
		for (var i = 0, newChild, oldChild; i < length; i++) {
			if (i >= newLength) {
				oldChild = oldChildren.pop();
				if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
					mountBoundary(oldChild.owner, 2);
				}
				remove(oldChild.node, parent);
				empty(oldChild);
				oldLength--;
			} else if (i >= oldLength) {
				create(newChild = oldChildren[i] = newChildren[i], null, owner, parent, null, 1);
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
					empty(oldChild);
				} else {
					patch(oldChild, newChild, oldChild.group, ancestor);
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
	 	var owner = ancestor.owner;
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
	
	 			patch(oldStartNode, newStartNode, oldStartNode.group, ancestor);
	
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
	
	 			patch(oldEndNode, newEndNode, oldEndNode.group, ancestor);
	
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
	
	 			move(oldEndNode.node, oldStartNode.node, oldStart, parent);
	 			patch(oldEndNode, newStartNode, oldEndNode.group, ancestor);
	
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
	 				move(oldStartNode, oldChildren[nextPos].node, nextPos, parent);
	 			} else {
	 				append(oldStartNode.node, parent);
	 			}
	 			patch(oldStartNode, newEndNode, oldStartNode.group, ancestor);
	
	 			oldStart++;
	 			newEnd--;
	
	 			oldStartNode = oldChildren[oldStart];
	 			newEndNode = newChildren[newEnd];
	 			continue;
	 		}
	
	 		break;
	 	}
	 	// step 2, remove or insert
	 	if (oldStart > oldEnd) {
	 		// old children is synced, insert the difference
	 		if (newStart <= newEnd) {
	 			nextPos = newEnd + 1;
	 			nextNode = nextPos < newLength ? newChildren[nextPos].node : null;
	
	 			do {
	 				create(newStartNode = newChildren[newStart++], null, owner, parent, nextNode, 2);
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
	 			empty(oldStartNode);
	 		} while (oldStart <= oldEnd);
	 	} else {
	 		// could not completely sync children, move on the the next phase
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
		var owner = ancestor.owner;
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
		var nextNode;
		var nextPos;
	
		// step 1, build a map of keys
		while (true) {
			if (oldIndex !== oldEnd) {
				oldChild = oldChildren[oldIndex];
				oldKeys[oldChild.key] = oldIndex++;
			}
			if (newIndex !== newEnd) {
				newChild = newChildren[newIndex];
				newKeys[newChild.key] = newIndex++;
			}
			if (oldIndex === oldEnd && newIndex === newEnd) {
				oldIndex = oldStart;
				newIndex = newStart;
				break;
			}
		}
	
		// step 2, insert
		while (newIndex < newEnd) {
			newChild = newChildren[newIndex];
			oldIndex = oldKeys[newChild.key];
	
			// new child doesn't exist in old children, insert
			if (oldIndex === void 0) {
				nextPos = newIndex - newOffset;
				nextNode = nextPos < oldLength ? oldChildren[nextPos].node : null;
				create(newChild, null, owner, parent, nextNode, 2);
				newOffset++;
			} else if (newIndex === oldIndex) {
				oldChild = oldChildren[oldIndex];
				patch(newChildren[newIndex] = oldChild, newChild, oldChild.group, ancestor);
			}
			newIndex++;
		}
	
		oldIndex = oldStart;
	
		// step 3, remove
		while (oldIndex < oldEnd) {
			oldChild = oldChildren[oldIndex];
			newIndex = newKeys[oldChild.key];
	
			// old child doesn't exist in new children, remove
			if (newIndex === void 0) {
				if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
					mountBoundary(oldChild.owner, 2);
				}
				remove(oldChild.node, parent);
				empty(oldChild);
				oldOffset++;
			}
			oldIndex++;
		}
	
		// new and old children are synced
		if (((oldEnd - oldStart) - oldOffset) + ((newEnd - newStart) - newOffset) === 2) {
			return;
		}
		newIndex = newStart;
	
		// step 4, move
		while (newIndex < newEnd) {
			newChild = newChildren[newIndex];
	
			if (newChild.node === null) {
				oldIndex = oldKeys[newChild.key];
	
				if (oldIndex !== void 0) {
					nextPos = newIndex + 1;
					oldChild = oldChildren[oldIndex];
	
					move(oldChild, null, nextPos, parent);
					patch(newChildren[newIndex] = oldChild, newChild, oldChild.group, ancestor);
				}
			}
			newIndex++;
		}
	}
	
	/**
	 * Document
	 *
	 * @type {Node?}
	 */
	var document = browser === true ? global.document : null;
	
	/**
	 * Mount
	 *
	 * @type {Node?}
	 */
	var mount = browser === true ? document.body : null;
	
	/**
	 * Create Element
	 *
	 * @return {Node}
	 */
	function createElement (tag) {
		return document.createElement(tag);
	}
	
	/**
	 * Create Element[Namespaced]
	 *
	 * @return {Node}
	 */
	function createElementNS (xmlns, tag) {
		return document.createElementNS(xmlns, tag);
	}
	
	/**
	 * Create Text Node
	 *
	 * @return {Node}
	 */
	function createTextNode (value) {
		return document.createTextNode(value);
	}
	
	/**
	 * Create Node
	 *
	 * @param  {Tree} newer
	 * @param  {String?} _xmlns
	 * @param  {Component?} _owner
	 * @param  {Node} parent
	 * @param  {Node} sibling
	 * @param  {Number} action
	 * @return {Node}
	 */
	function create (newer, _xmlns, _owner, parent, sibling, action) {
		var xmlns = _xmlns;
		var owner = _owner;
		var group = newer.group;
		var flag = newer.flag;
		var type = 0;
		var node;
		var children;
		var length;
		var tree;
	
		// preserve last namespace among children
		if (flag !== 1 && newer.xmlns !== null) {
			xmlns = newer.xmlns;
		}
	
		if (group > 0) {
			tree = extract(newer);
			flag = tree.flag;
	
			// every instance registers the last root component, children will use
			// this when attaching events, to support boundless events
			owner = newer.owner;
	
			if (owner.componentWillMount !== void 0) {
				mountBoundary(owner, 0);
			}
			if (tree.group === 0) {
				type = 2;
			} else {
				create(tree, xmlns, owner, parent, sibling, action);
				// components may return components recursively,
				// keep a record of these
				tree.parent = newer;
				newer.host = tree;
			}
			copy(newer, tree);
		} else {
			type = 2;
		}
	
		if (type === 2) {
			if (flag === 1) {
				node = createTextNode((type = 1, newer.children));
			} else {
				node = nodeBoundary(flag, newer, xmlns, owner);
	
				if (newer.flag === 3) {
					create(node, xmlns, owner, parent, sibling, action);
					clone(newer, node, type = 0);
				} else {
					children = newer.children;
					length = children.length;
	
					if (length > 0) {
						for (var i = 0, child; i < length; i++) {
							// hoisted tree
							if ((child = children[i]).node !== null) {
								clone(child = children[i] = new Tree(child.flag), child, false);
							}
							create(child, xmlns, owner, node, null, 1);
						}
					}
				}
			}
		}
	
		if (type !== 0) {
			newer.node = node;
			switch (action) {
				case 1: parent.appendChild(node); break;
				case 2: parent.insertBefore(node, sibling); break;
				case 3: parent.replaceChild(node, sibling); break;
			}
			if (type !== 1) {
				attribute(newer, owner, xmlns, node, false);
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
		create(newer, null, ancestor.owner, parent, older.node, 3);
	}
	
	/**
	 * Swap Node
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Tree} ancestor
	 */
	function swap (older, newer, ancestor) {
		create(newer, null, ancestor.owner, older.node.parentNode, older.node, 3);
	}
	
	/**
	 * Move Node
	 *
	 * @param {Node} node
	 * @param {Node} sibling
	 * @param {Number} index
	 * @param {Node} parent
	 */
	function move (node, sibling, index, parent) {
		parent.insertBefore(node, sibling !== null ? sibling : parent.childNodes[index]);
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
	 * @param {Node} node
	 */
	function assign (type, name, value, xmlns, node) {
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
			case 2: {
				if (typeof value === 'string') {
					node.style.cssText = value;
				} else {
					style(value, node.style);
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
				assign(5, 'innerHTML', value.__html, xmlns, node);
				break;
			}
			case 5: {
				if (name in node) {
					set(node, name, value);
				}
				break;
			}
			case 6: {
				node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value);
				break;
			}
		}
	}
	
	/**
	 * Set Property
	 *
	 * @param {Tree} node
	 * @param {String} name
	 * @param {Any} value
	 */
	function set (node, name, value) {
		try {
			node[name] = value;
		} catch (err) {
			if (node[name] !== value) {
				node.setProperty(name, value);
			}
		}
	}
	
	/**
	 * Assign Styles
	 *
	 * @param {Object} source
	 * @param {Object} target
	 */
	function style (source, target) {
		for (var name in source) {
			if (name in target) {
				target[name] = source[name];
			}
		}
	}
	
	/**
	 * Create Events
	 *
	 * @param {Node} node
	 * @param {String} name
	 * @param {Component} owner
	 * @param {Function} handler
	 */
	function event (node, name, owner, handler) {
		node[name.toLowerCase()] = typeof handler !== 'function' ? null : (
			owner !== null ? function proxy (e) {
				eventBoundary(owner, handler, e);
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
		var tree = this;
		var group = tree.group;
		var type = tree.type;
		var flag = tree.flag;
		var tag = tree.tag;
		var children = tree.children;
		var body = '';
		var length = 0;
		var props;
	
		if (flag === 1) {
			return sanitize(children);
		}
		if (tree.props !== object && tree.props.innerHTML !== void 0) {
			body = tree.props.innerHTML;
		} else if ((length = children.length) > 0) {
			for (var i = 0; i < length; i++) {
				body += children[i].toString();
			}
		}
		return '<'+tag+attrs(tree)+'>'+ (hollow[tag] !== 0 ? body+'</'+tag+'>' : '');
	}
	
	/**
	 * Stringify Attributes
	 *
	 * @param  {Tree} tree
	 * @return {String}
	 */
	function attrs (tree) {
		var props = tree.props;
		var body = '';
		var value;
		var val;
	
		if (props === object) {
			return body;
		}
	
		for (var name in props) {
			if (evt(name) === true) {
				continue;
			}
			value = props[name];
	
			switch (name) {
				case 'key': case 'children': case 'ref': case 'innerHTML': {
					continue;
				}
				case 'style': {
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
				case 'defaultValue': {
					value = props.value === void 0 ? ' value="'+sanitize(value)+'"' : '';
					break;
				}
				case 'class': case 'className': {
					value = ' class="'+sanitize(value)+'"';
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
