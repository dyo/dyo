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
	var document = window.document;
	var mount = browser === true ? document.body : null;
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
	 * 11: fragment
	 *
	 * ## Element Type Casts
	 *
	 * 0: Element
	 * 1: Component
	 * 2: Function
	 */
	
	/**
	 * ## Element Shapes
	 *
	 * name:     node tag             {String}
	 * type:     node type            {Function|Class|String}
	 * props:    node properties      {Object?}
	 * attrs:    node attributes      {Object?}
	 * children: node children        {Array<Tree>}
	 * key:      node key             {Any}
	 * flag:     node flag            {Number}
	 * xmlns:    node xmlns namespace {String?}
	 * owner:    node component       {Component?}
	 * node:     node DOM reference   {Node?}
	 * cast:     node type case       {Number}
	 */
	
	 /**
	  * ## Component Shape
	  *
	  * _block:      block          {Number}
	  * _tree:       current tree   {Tree?}
	  * _state:      previous state {Object}
	  *
	  * props:       current props  {Object}
	  * state:       current state  {Object}
	  * refs:        refs           {Object?}
	  * setState:    method         {Function}
	  * forceUpdate: method         {Function}
	  */
	
	/**
	 * ## Component Flags
	 *
	 * 0: not pending/blocked(ready) `non of the below`
	 * 1: blocked/pending `instance creation | prior merging new state`
	 * 2: async/pending `resolving async render`
	 */
	
	/**
	 * ## Notes
	 *
	 * `_name` prefix is used to identify function arguments
	 * when the value is expected to change within the function
	 * and private component properties
	 */
	
	/**
	 * Component
	 *
	 * @param {Object?} _props
	 */
	function Component (_props) {
		var props = _props;
		var state = this.state;
		// props
		if (this.props === void 0) {
			this.props = props !== null && props !== void 0 ? props : (props = {});
		}
		// state
		if (state === void 0) {
			state = this.state = {};
		}
		this.refs = null;
		this._tree = null;
		this._block = 1;
		this._state = state;
	}
	
	/**
	 * Component Prototype
	 *
	 * @type {Object}
	 */
	var prototype = {
		setState: {value: setState},
		forceUpdate: {value: forceUpdate},
		UUID: {value: 7}
	};
	Component.prototype = Object.create(null, prototype);
	prototype.UUID.value = 0;
	
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
		Object.defineProperties(proto, prototype);
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
	
		if (state === void 0) {
			return;
		}
	
		nextState = state;
		prevState = this._state = this.state;
	
		if (typeof nextState === 'function') {
			if ((nextState = callbackBoundary(this, nextState, prevState, 0)) === void 0) {
				return;
			}
		}
	
		if (state !== null && state.constructor === Promise) {
			owner = this;
			state.then(function (value) {
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
		var tree = this._tree;
	
		if (this._block !== 0 || tree.node === null) {
			return;
		}
	
		patch(tree, tree, 1, tree);
	
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
	 * @param  {Tree} newer
	 * @param  {Number} cast
	 * @return {Tree?}
	 */
	function shouldUpdate (older, newer, cast) {
		var type = older.type;
		var owner = older.owner;
		var nextProps = newer.props;
		var prevProps = older.props;
	
		var recievedProps;
		var defaultProps;
		var prevState;
		var nextState;
		var nextProps;
		var prevProps;
		var branch;
		var tree;
		var tag;
	
		if (owner === null) {
			return null;
		}
	
		if (cast === 1) {
			if (owner._block !== 0) {
				return null;
			}
			nextState = owner.state;
			prevState = owner._state;
			owner._block = 1;
		} else {
			nextState = nextProps === null ? object : nextProps;
			prevState = prevProps === null ? object : prevProps;
		}
	
		if ((recievedProps = nextProps !== null) === true) {
			if (type.propTypes !== void 0) {
				propTypes(type, nextProps);
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
			return (owner._block = 0, null);
		}
	
		if (recievedProps === true) {
			(cast === 1 ? owner : older).props = nextProps;
		}
	
		if (owner.componentWillUpdate !== void 0) {
			updateBoundary(owner, 1, nextProps, nextState);
		}
	
		tree = shape(renderBoundary(cast === 1 ? owner : older, cast), owner);
		tag = tree.tag;
	
		if (tag !== older.tag) {
			if (tag === null) {
				if ((branch = older.branch) !== null && branch instanceof tree.type) {
					patch(branch._tree, tree, tree.cast);
				} else {
					swap(older, tree, 2, older);
					refresh(older);
				}
			} else {
				swap(older, tree, 2, older);
			}
			tree = null;
		}
	
		if (owner.componentDidUpdate !== void 0) {
			updateBoundary(owner, 2, prevProps, prevState);
		}
	
		if (cast === 1) {
			if (owner._block === 2) {
				tree = null;
			} else {
				owner._block = 0;
			}
		}
	
		return tree;
	}
	
	/**
	 * PropTypes
	 *
	 * @param {Function|Class} type
	 * @param {Object} props
	 */
	function propTypes (type, props) {
		var validators = type.propTypes;
		var display = type.name;
		var result;
	
		for (var name in validators) {
			if (result = validators[name](props, name, display)) {
				console.error(result);
			}
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
			if (props.cast !== void 0 || props.constructor !== Object) {
				props = null;
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
				tree.tag = type, tree.attrs = props;
				break;
			}
			case 'function': {
				tree.cast = (proto = type.prototype) !== void 0 && proto.render !== void 0 ? 1 : 2;
				break;
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
		} else if (child.cast !== void 0) {
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
				case 'function': {
					children[i] = element(child, null);
					break;
				}
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
	 * @param  {Tree[]|Tree|Function} children
	 * @return {Tree}
	 */
	function fragment (children) {
		return element('section', null, children);
	}
	
	/**
	 * Copy Properties
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 */
	function copy (older, newer) {
		older.flag = newer.flag;
		older.tag = newer.tag;
		older.attrs = newer.attrs;
		older.children = newer.children;
		older.keyed = newer.keyed;
		older.xmlns = newer.xmlns;
		older.node = newer.node;
	}
	
	/**
	 * Copy Tree
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Boolean} type
	 */
	function clone (older, newer, type) {
		older.flag = newer.flag;
		older.tag = newer.tag;
		older.attrs = newer.attrs;
		older.children = newer.children;
		older.xmlns = newer.xmlns;
		older.node = newer.node;
		older.keyed = newer.keyed;
		older.parent = older.parent;
	
		switch (type) {
			case 1: {
				older.cast = older.cast;
				older.type = newer.type;
				older.props = newer.props;
				older.owner = newer.owner;
				older.branch = newer.branch;
				older.key = newer.key;
				break;
			}
			case 2: {
				older.branch = newer.owner;
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
		this.type = null;
		this.props = null;
		this.attrs = null;
		this.children = null;
		this.xmlns = null;
		this.owner = null;
		this.branch = null;
		this.parent = null;
		this.node = null;
		this.key = null;
		this.keyed = false;
		this.cast = 0;
	}
	
	/**
	 * Tree Prototype
	 *
	 * @type {Object}
	 */
	Tree.prototype = element.prototype = Object.create(null);
	
	/**
	 * Shape Tree
	 *
	 * @param  {Tree} _tree
	 * @param  {Component} owner
	 * @return {Tree}
	 */
	function shape (_tree, owner) {
		var tree = (_tree !== null && _tree !== void 0) ? _tree : text('');
	
		if (tree.cast === void 0) {
			switch (typeof tree) {
				case 'function': {
					tree = element(tree, owner === null ? null : owner.props);
					break;
				}
				case 'string':
				case 'number':
				case 'boolean': {
					tree = text(tree);
					break;
				}
				case 'object': {
					switch (tree.constructor) {
						case Promise: return resolve(tree, owner);
						case Array: tree = fragment(tree); break;
						case Date: tree = text(tree+''); break;
						case Object: tree = text(''); break;
						default: tree = text('');
					} break;
				}
			}
		}
	
		return tree;
	}
	
	/**
	 * Extract Component
	 *
	 * @param  {Tree} tree
	 * @return {Tree}
	 */
	function extract (tree) {
		var type = tree.type;
		var props = tree.props;
		var children = tree.children;
		var length = children.length;
		var cast = tree.cast;
	
		var result;
		var owner;
		var proto;
	
		if (props === null) {
			props = {};
		}
		if (type.defaultProps !== void 0) {
			props = merge(type.defaultProps, props);
		}
		if (length !== 0) {
			if (props === null) {
				props = {children: children};
			} else {
				props.children = children;
			}
		}
		if (cast === 1) {
			proto = type.prototype;
	
			if (proto.UUID === 7) {
				owner = new type(props);
			} else {
				if (proto.setState === void 0) {
					extendClass(type, proto);
				}
				owner = new type(props);
				Component.call(owner, props);
			}
	
			result = renderBoundary(owner, cast);
			owner._block = 0;
			result = shape(result, owner);
	
			owner._tree = tree;
			tree.owner = owner;
		} else {
			tree.cast = cast;
			tree.owner = type;
	
			result = shape(renderBoundary(tree, cast), null);
		}
	
		return result;
	}
	
	/**
	 * Resolve
	 *
	 * @param {Promise} pending
	 * @param {Component} owner
	 */
	function resolve (pending, owner) {
		var tree;
	
		if (owner === null) {
			return;
		}
	
		tree = owner._tree;
	
		if (tree === null) {
			tree = text('');
		}
	
		owner._block = 2;
	
		pending.then(function (value) {
			var older;
			var newer;
	
			owner._block = 0;
	
			if ((older = owner._tree) === null) {
				return;
			}
			// node removed
			if (older.node === null) {
				return;
			}
	
			newer = shape(value, owner);
	
			if (older.tag !== newer.tag) {
				swap(older, newer, 0, older);
			} else {
				patch(older, newer, 0, older);
			}
		});
	
		return tree;
	}
	
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
				case 1: return owner.render(owner.props, owner.state);
				case 2: return owner.type(owner.props || object);
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
				return document.createElement(newer.tag);
			} else {
				return document.createElementNS(newer.xmlns === xmlns, newer.tag);
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
		if (owner !== null && state !== void 0 && state !== null) {
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
			message = err, location = 'componentDidThrow';
		}
	
		errorMessage(component, location, message instanceof Error ? message.stack : message);
	
		if (type === 3 || type === 5) {
			return shape(tree, owner);
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
				} break;
			}
			case 1: {
				switch (from) {
					case 0: return 'shouldComponentUpdate';
					case 1: return 'componentWillUpdate';
					case 2: return 'componentDidUpdate';
				} break;
			}
			case 3: {
				switch (from) {
					case 1: return 'render';
					case 2: return 'function';
				} break;
			}
			case 4: {
				switch (from) {
					case 0: return 'componentWillMount';
					case 1: return 'componentDidMount';
					case 2: return 'componentWillUnmount';
				} break;
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
		var attrs = newer.attrs;
	
		for (var name in attrs) {
			if (name !== 'key' && name !== 'children') {
				if (name !== 'ref') {
					if (evt(name) === true) {
						event(name, attrs[name], owner, node, newer);
					} else if (hydrate === false) {
						assign(attr(name), name, attrs[name], xmlns, node, newer);
					}
				} else {
					refs(attrs[name], owner, node, 0);
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
	
		var oldValue;
		var newValue;
	
		for (var name in newAttrs) {
			if (name !== 'key' && name !== 'children') {
				newValue = newAttrs[name];
	
				if (name !== 'ref') {
					oldValue = oldAttrs !== null ? oldAttrs[name] : null;
					if (newValue !== oldValue && newValue !== null && newValue !== void 0) {
						assign(attr(name), name, newValue, xmlns, node, ancestor);
					}
				} else {
					refs(newValue, ancestor.owner, node, 2);
				}
			}
		}
	
		for (var name in oldAttrs) {
			if (name !== 'key' && name !== 'children' && name !== 'ref') {
				newValue = newAttrs !== null ? newAttrs[name] : null;
	
				if (newValue === null || newValue === void 0) {
					assign(attr(name), name, newValue, xmlns, node, ancestor);
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
	 * Assign Attributes
	 *
	 * @param {Number} type
	 * @param {String} name
	 * @param {Any} value
	 * @param {String?} xmlns
	 * @param {Node} node
	 * @param {Tree} tree
	 * @param {Tree} ancestor
	 */
	function assign (type, name, value, xmlns, node, ancestor) {
		switch (type) {
			case 1: {
				if (xmlns === null) {
					node.className = value;
				} else {
					assign(6, 'class', value, xmlns, node);
				}
				break;
			}
			case 2: {
				node.id = value;
				break;
			}
			case 3: {
				if (typeof value === 'string') {
					node.style.cssText = value;
				} else {
					style(value, node.style);
				}
				break;
			}
			case 4: {
				node.innerHTML = value;
				break;
			}
			case 5: {
				if (node[name] === void 0) {
					node.style.setProperty(name, value);
				} else if (isNaN(Number(value)) === true) {
					assign(6, name, value, xmlns, node);
				} else {
					set(node, name, value);
				}
				break;
			}
			case 6: {
				if (name === 'xlink:href') {
					node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value);
				} else if (value !== null && value !== void 0 && value !== false) {
					node.setAttribute(name, (value === true ? '' : value));
				} else {
					node.removeAttribute(name);
				}
				break;
			}
			case 7: {
				event(name, value, ancestor.owner, node);
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
			case 'class': case 'className': return 1;
			case 'id': return 2;
			case 'style': return 3;
			case 'innerHTML': return 4;
			case 'width': case 'height': return 5;
			default: return evt(name) === false ? 6 : 7;
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
	 * Event Station
	 *
	 * @param {String} type
	 * @param {Function} listener
	 * @param {Component} owner
	 * @param {Node} node
	 */
	function event (type, listener, owner, node) {
		node[type.toLowerCase()] = typeof listener !== 'function' ? null : function (e) {
			eventBoundary(owner, listener, e);
		}
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
		var cast = newer.cast;
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
	
		if (cast > 0) {
			tree = extract(newer);
			flag = tree.flag;
	
			// every instance registers the last root component, children will use
			// this when attaching events, to support boundless events
			owner = newer.owner;
	
			if (owner.componentWillMount !== void 0) {
				mountBoundary(owner, 0);
			}
			if (tree.cast === 0) {
				type = 2;
			} else {
				create(tree, xmlns, owner, parent, sibling, action);
				// components may return components recursively,
				// keep a record of these
				tree.parent = newer;
				newer.branch = tree.owner;
			}
			copy(newer, tree);
		} else {
			type = 2;
		}
	
		if (type === 2) {
			if (flag === 1) {
				// .createTextNode is less prone to emit errors
				node = document.createTextNode((type = 1, newer.children));
			} else {
				node = nodeBoundary(flag, newer, xmlns, owner);
	
				if (newer.flag === 3) {
					type = (create(node, xmlns, owner, parent, sibling, action), 0);
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
	
		if (cast > 0 && owner.componentDidMount !== void 0) {
			mountBoundary(owner, 1);
		}
	}
	
	/**
	 * Remove Node
	 *
	 * @param {Tree} older
	 * @param {Node} parent
	 * @param {Node} node
	 */
	function remove (older, parent, node) {
		if (older.cast > 0 && older.owner.componentWillUnmount !== void 0) {
			mountBoundary(older.owner, 2);
		}
		empty(older, older, false);
		parent.removeChild(node);
		release(older);
	}
	
	/**
	 * Node Replacer
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 * @param {Node} parent
	 * @param {Tree} ancestor
	 * @param {Node} node
	 */
	function replace (older, newer, parent, ancestor, node) {
		if (older.cast > 0 && older.owner.componentWillUnmount !== void 0) {
			mountBoundary(older.owner, 2);
		}
		empty(older, older, false);
		create(newer, null, ancestor.owner, parent, node, 3);
		release(older);
	}
	
	/**
	 * Move Node
	 *
	 * @param {Node} node
	 * @param {Node} next
	 * @param {Node} sibling
	 */
	function move (node, older, sibling) {
		node.insertBefore(older.node, sibling);
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
		var branch = older.branch;
		var owner = older.owner;
	
		if (owner !== null && owner.componentWillUnmount !== void 0) {
			mountBoundary(owner, 2);
		}
	
		if (branch !== null) {
			unmount(branch._tree);
		}
	}
	
	/**
	 * Swap Node
	 *
	 * @param {Tree} newer
	 * @param {Tree} older
	 * @param {Number} type
	 * @param {Tree} ancestor
	 */
	function swap (older, newer, type, ancestor) {
		create(newer, null, ancestor.owner, older.node.parentNode, older.node, 3);
	
		switch (type) {
			case 1: {
				unmount(older);
				break;
			}
			case 2: {
				if (older.branch !== null) {
					unmount(older.branch._tree);
				}
				break;
			}
			default: {
				if (older.flag !== 1 && older.children.length > 0) {
					empty(older, newer, false);
				}
			}
		}
		clone(older, newer, type);
	}
	
	/**
	 * Release References
	 *
	 * @param  {Tree} tree
	 */
	function release (tree) {
		tree.parent = null;
		tree.branch = null;
		tree.owner = null;
		tree.node = null;
	}
	
	/**
	 * Empty Children
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Boolean} clear
	 */
	function empty (older, newer, clear) {
		var children = older.children;
		var length = children.length;
	
		if (clear === false && (older.flag === 1 || length === 0)) {
			return;
		}
	
		for (var i = 0, child; i < length; i++) {
			child = children[i];
	
			if (child.cast > 0 && child.owner.componentWillUnmount !== void 0) {
				mountBoundary(child.owner, 2);
			}
	
			empty(child, newer, false);
			release(child);
		}
	
		if (clear === true) {
			older.children = newer.children;
			older.node.textContent = null;
		}
	}
	
	/**
	 * Populate Children
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Tree} ancestor
	 */
	function populate (older, newer, ancestor) {
		var parent = older.node;
		var children = newer.children;
		var length = children.length;
		var owner = ancestor.owner;
	
		for (var i = 0, child; i < length; i++) {
			create(child = children[i], null, owner, parent, null, 1);
		}
		older.children = children;
	}
	
	/**
	 * Update Text Content
	 *
	 * @param {Tree} older
	 * @param {Tree} newer
	 */
	function content (older, newer) {
		if (older.children !== newer.children) {
			older.node.nodeValue = older.children = newer.children;
		}
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
	
	
		if (target === null || target === void 0 || target === document) {
			// mount points to document.body, if it's null dio was loaded before
			// the body node, try to use <body> if it exists at this point
			// else default to the root <html> node
			if (mount === null) {
				mount = document.body || document.documentElement;
			}
	
			target = mount;
		}
	
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
	
		var older = target._older;
	
		if (older !== void 0) {
			if (older.key === newer.key) {
				patch(older, newer, older.cast, older);
			} else {
				swap(older, newer, 1, newer);
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
	 * @param {Number} cast
	 * @param {Tree} _ancestor
	 */
	function patch (older, _newer, cast, _ancestor) {
		var ancestor = _ancestor;
		var newer = _newer;
	
		if (older.type !== newer.type) {
			return swap(older, newer, 1, ancestor);
		}
	
		if (cast > 0) {
			if ((newer = shouldUpdate(older, newer, cast)) === null) {
				return;
			}
			// ancestor represents the last root component
			// we need to keep refererence of this to support
			// boundless events when creating new nodes
			if (cast === 1) {
				ancestor = older;
			}
		}
	
		if (older.flag === 1) {
			return content(older, newer);
		}
	
		var newLength = newer.children.length;
		var oldLength = older.children.length;
	
		// populate children
		if (oldLength === 0) {
			return void newLength !== 0 ? populate(older, newer, ancestor) : 0;
		}
		// empty children
		if (newLength === 0) {
			return void oldLength !== 0 ? empty(older, newer, true) : 0;
		}
	
		if (older.keyed === true) {
			keyed(older, newer, ancestor);
		} else {
			nonkeyed(older, newer, ancestor);
		}
		attributes(older, newer, ancestor);
	}
	
	/**
	 * Reconcile Non-Keyed Children
	 *
	 * @param  {Tree} older
	 * @param  {Tree} newer
	 * @param  {Tree} ancestor
	 */
	function nonkeyed (older, newer, ancestor) {
		var parent = older.node;
		var oldChildren = older.children;
		var newChildren = newer.children;
		var newLength = newChildren.length;
		var oldLength = oldChildren.length;
		var length = newLength > oldLength ? newLength : oldLength;
		var owner = ancestor.owner;
	
		// patch non-keyed children
		for (var i = 0, newChild, oldChild; i < length; i++) {
			if (i >= newLength) {
				remove(oldChild = oldChildren.pop(), parent, oldChild.node);
				oldLength--;
			} else if (i >= oldLength) {
				create(newChild = oldChildren[i] = newChildren[i], null, owner, parent, null, 1);
				oldLength++;
			} else {
				newChild = newChildren[i];
				oldChild = oldChildren[i];
	
				if (newChild.flag === 1 && oldChild.flag === 1) {
					content(oldChild, newChild);
				} else if (newChild.type !== oldChild.type) {
					replace(oldChild, oldChildren[i] = newChild, parent, ancestor, oldChild.node);
				} else {
					patch(oldChild, newChild, oldChild.cast, ancestor);
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
	 */
	function keyed (older, newer, ancestor) {
	 	var parent = older.node;
	 	var oldChildren = older.children;
	 	var newChildren = newer.children;
	 	var oldLength = oldChildren.length;
	 	var newLength = newChildren.length;
	 	var owner = ancestor.owner;
	
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
	
	 			patch(oldStartNode, newStartNode, oldStartNode.cast, ancestor);
	
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
	
	 			patch(oldEndNode, newEndNode, oldEndNode.cast, ancestor);
	
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
	
	 			patch(oldEndNode, newStartNode, oldEndNode.cast, ancestor);
	 			move(parent, oldEndNode, oldStartNode.node);
	
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
	 			nextNode = nextPos < newLength ? oldChildren[nextPos].node : null;
	
	 			patch(oldStartNode, newEndNode, oldStartNode.cast, ancestor);
	 			move(parent, oldStartNode, nextNode);
	
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
	 		// all nodes from old children are synced, insert the difference
	 		if (newStart <= newEnd) {
	 			nextPos = newEnd + 1;
	 			nextNode = nextPos < newLength ? newChildren[nextPos].node : null;
	
	 			do {
	 				create(newStartNode = newChildren[newStart++], null, owner, parent, nextNode, 2);
	 			} while (newStart <= newEnd);
	 		}
	 	} else if (newStart > newEnd) {
	 		// all nodes from new children are synced, remove the difference
	 		do {
	 			remove(oldStartNode = oldChildren[oldStart++], parent, oldStartNode.node);
	 		} while (oldStart <= oldEnd);
	 	} else {
	 		// could not completely sync children, move on the the next phase
	 		complex(older, newer, ancestor, oldStart, newStart, oldEnd, newEnd);
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
	 */
	function complex (older, newer, ancestor, oldStart, newStart, oldEnd, newEnd) {
		var parent = older.node;
		var oldChildren = older.children;
		var newChildren = newer.children;
		var owner = ancestor.owner;
	
		var oldLength = oldEnd + 1;
		var newLength = newEnd + 1;
		var oldOffset = oldLength - oldStart;
		var newOffset = newLength - newStart;
		var oldIndex = oldStart;
		var newIndex = newStart;
	
		var oldKeys = {};
		var newKeys = {};
		var childNodes = parent.childNodes;
	
		var oldChild;
		var newChild;
	
		// step 1, build a map of keys
		while (true) {
			if (oldIndex !== oldLength) {
				oldChild = oldChildren[oldIndex++];
				oldKeys[oldChild.key] = oldChild;
			}
	
			if (newIndex !== newLength) {
				newChild = newChildren[newIndex++];
				newKeys[newChild.key] = newChild;
			}
	
			if (oldIndex === oldLength && newIndex === newLength) {
				break;
			}
		}
	
		// step 2, insert and remove
		while (true) {
			// insert new children
			if (newIndex !== newStart) {
				newChild = newChildren[--newIndex];
				oldChild = oldKeys[newChild.key];
	
				// new child doesn't exist in old children, insert
				if (oldChild === void 0) {
					create(newChild, null, owner, parent, childNodes[newIndex], 2);
					newOffset--;
				} else {
					patch(oldChild, newChild, oldChild.cast, ancestor);
					newChildren[newIndex] = oldChild;
				}
			}
	
			// remove old children
			if (oldIndex !== oldStart) {
				oldChild = oldChildren[--oldIndex];
				newChild = newKeys[oldChild.key];
	
				// old child doesn't exist in new children, remove
				if (newChild === void 0) {
					remove(oldChild, parent, oldChild.node);
					oldOffset--;
				}
			}
	
			if (oldIndex === oldStart && newIndex === newStart) {
				break;
			}
		}
	
		// step 5, move remaining when insert/remove is not enough to sync indexes
		if ((oldOffset + newOffset) - 2 > 0) {
			for (var i = newStart; i < newLength; i++) {
				newChild = newChildren[i];
				oldChild = oldKeys[newChild.key];
	
				if (oldChild !== void 0) {
					move(parent, oldChild, childNodes[i+1]);
				}
			}
		}
	}
	
	
	if (global.window !== void 0) {
		global.h = element;
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
