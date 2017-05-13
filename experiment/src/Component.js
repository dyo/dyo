/**
 * Component
 *
 * @param {Object?} props
 */
function Component (props) {
	var state = this.state;

	this.refs = null;
	this.this = null;

	// props
	if (this.props === void 0) {
		this.props = (props === PROPS || props === void 0 || props === null) ? {} : props;
	}

	// state
	if (state === void 0) {
		state = this.state = {};
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
	var newState = state !== void 0 && state !== null ? state : {};
	var oldState = owner.state;
	var constructor = newState.constructor;
	var older = null;

	if (constructor === Function) {
		newState = callbackBoundary(SHARED, owner, newState, oldState, 0);

		if (newState === void 0 || newState === null) {
			return;
		}

		constructor = newState.constructor;
	}

	switch (constructor) {
		case Promise: {
			newState.then(function (value) {
				owner.setState(value, callback);
			});
			break;
		}
		case Object: {
			var older = owner.this;

			if (older === null) {
				return;
			}

			if (older.async !== READY) {
				return updateState(owner._state, newState);
			}

			owner._state = newState;
			this.forceUpdate(callback);
		}
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

	if (older === null || older.node === null || older.async !== READY) {
		// processed
		if (older.async === PROCESSED) {
			// process this update in the next frame
			requestAnimationFrame(function () {
				owner.forceUpdate(callback);
			});
		}

		return;
	}

	patch(older, older, 3);

	if (callback !== void 0 && callback !== null && callback.constructor === Function) {
		callbackBoundary(older, owner, callback, owner.state, 1);
	}
}

/**
 * Update State
 *
 * @param {Object} oldState
 * @param {Object} newState
 */
function updateState (oldState, newState) {
	for (var name in newState) {
		oldState[name] = newState[name];
	}
}

/**
 * Get Initial State
 *
 * @param  {Tree} older
 * @param  {Object} state
 * @return {Object}
 */
function getInitialState (older, state) {
	if (state !== void 0 && state !== null) {
		switch (state.constructor) {
			case Promise: {
				var fn = function (value) {
					older.owner.setState(value);
				};
				state.then(fn).catch(fn);
				break;
			}
			case Object: {
				older.owner.state = state;
				break;
			}
		}
	}
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
	if (typeof fn !== 'function') {
		return fn;
	}

	var value = callbackBoundary(SHARED, owner, fn, props, 0);

	if (value !== void 0 && value !== null) {
		return Object.defineProperty(owner, type, {value: value});
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
		errorBoundary(err, SHARED, owner, 2, valid);
	}
}
