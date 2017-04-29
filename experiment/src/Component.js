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
	var older = owner.this;

	if (older === null || older.node === null || older.async !== 0 || owner.async !== 0) {
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
			dataBoundary(older, owner, 0, nextProps);
		}
		if (type.defaultProps !== void 0) {
			merge(type.defaultProps, nextProps);
		}
	}

	if (
		owner.shouldComponentUpdate !== void 0 &&
		updateBoundary(older, owner, 0, nextProps, nextState) === false
	) {
		return older.async = 0, false;
	}
	if (recievedProps === true) {
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
		errorBoundary(err, shared, owner, 2, validator);
	}
}
