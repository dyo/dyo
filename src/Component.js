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
		this.props = (props !== void 0 && props !== null) ? props : PROPS;
	}

	// state
	if (state === void 0) {
		state = this.state = {};
	}

	this._state = state;
}

/**
 * Prototype
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
 * Extend
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
				updateState(owner._state, newState);
				return
			} else {
				owner._state = newState;
			}

			commitUpdate(callback, this, NOOP)
		}
	}
}

/**
 * forceUpdate
 *
 * @param {Function?} callback
 */
function forceUpdate (callback) {
	commitUpdate(callback, this, FORCE);
}

/**
 * commitUpdate
 * 
 * @param {Function?} callback
 * @param {Component} owner
 * @param {Number} group
 */
function commitUpdate (callback, owner, group) {
	var older = owner.this;

	if (older === null || older.node === null) {
		return;
	} else if (older.async !== READY) {
		// process this update in the next frame
		return void requestAnimationFrame(function () {
			owner.forceUpdate(callback);
		});
	} else {
		patch(older, older, group);
	}

	if (callback !== void 0 && callback !== null && callback.constructor === Function) {
		if (older.async === READY) {
			callbackBoundary(older, owner, callback, owner.state, 1);
		} else {
			requestAnimationFrame(function () {
				callbackBoundary(older, owner, callback, owner.state, 1);
			});
		}
	}
}

/**
 * updateState
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
 * initialState
 *
 * @param {Tree} older
 * @param {Object} state
 */
function getInitialState (older, state) {
	if (state !== void 0 && state !== null) {
		switch (state.constructor) {
			case Promise: {
				older.async = PENDING;

				if (browser === true) {
					state.then(function (value) {
						older.async = READY;
						older.owner.setState(value);
					});
					break;
				}
			}
			case Object: {
				older.owner.state = state;
				break;
			}
		}
	}
}

/**
 * initialStatic
 *
 * @param  {Function} owner
 * @param  {Function} func
 * @param  {String} type
 * @param  {Object} props
 * @return {Object?}
 */
function getInitialStatic (owner, func, type, props) {
	if (typeof func !== 'function') {
		return func;
	}

	var value = callbackBoundary(SHARED, owner, func, props, 0);

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
