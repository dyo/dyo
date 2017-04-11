/**
 * Component
 *
 * @param {Object?} _props
 */
function Component (_props) {
	var props = _props;
	var state = this.state;

	this.refs = null;
	this._tree = null;
	this._block = 1;

	// props
	if (this.props === void 0) {
		this.props = props !== null && props !== void 0 ? props : (props = {});
	}

	// state
	if (state === void 0) {
		this.state = state = this.getInitialState === void 0 ? {} : dataBoundary(this, 1, props);
	}

	this._state = state;
}

/**
 * setState
 *
 * @param {Object} state
 * @param {Function=} callback
 */
function setState (state, callback) {
	if (state === void 0) {
		return;
	}

	var nextState = state;
	var prevState = this._state = this.state;

	if (typeof nextState === 'function') {
		if ((nextState = callbackBoundary(this, nextState, prevState)) === void 0) {
			return;
		}
	}

	this.state = updateState({}, prevState, nextState);

	this.forceUpdate(callback);
}

/**
 * forceUpdate
 *
 * @param {Function=} callback
 */
function forceUpdate (callback) {
	if (this._block !== 0) {
		return;
	}

	var tree = this._tree;

	patch(tree, tree, 1);

	if (callback !== void 0 && typeof callback === 'function') {
		callbackBoundary(this, callback, this.state);
	}
}

/**
 * Component Prototype
 *
 * @type {Object}
 */
Component.prototype = Object.create(null, {
	setState: {value: setState},
	forceUpdate: {value: forceUpdate},
	_: {value: 7}
});

/**
 * Extend Class
 *
 * @param  {Class} type
 * @param  {Object} proto
 */
function extendClass (type, proto) {
	if (proto.constructor !== type) {
		Object.defineProperty(proto, 'constructor', {
			value: type
		});
	}

	Object.defineProperties(proto, {
		setState: {value: setState},
		forceUpdate: {value: forceUpdate}
	});
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
 * @return {Boolean}
 */
function shouldUpdate (older, newer, cast) {
	var owner = older.owner;
	var nextProps = newer.props;
	var prevProps = older.props;

	var recievedProps;
	var defaultProps;
	var prevState;
	var nextState;
	var nextProps;
	var prevProps;
	var result;

	if (cast === 1) {
		if (owner._block !== 0) {
			return null;
		}

		nextState = owner.state;
		prevState = owner._state;

		owner._block = 1;
	} else {
		nextState = nextProps || object;
		prevState = prevProps || object;
	}

	if ((recievedProps = nextProps !== null) === true) {
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

	result = renderBoundary(cast === 1 ? owner : older, cast);

	if (owner.componentDidUpdate !== void 0) {
		updateBoundary(owner, 2, prevProps, prevState);
	}

	if (cast === 1) {
		owner._block = 0;
	}

	return shape(result, owner, false);
}
