/**
 * set state
 *
 * @public
 * 
 * @param {Object}                    newState
 * @param {function(this:Component)=} callback
 */
function setState (newState, callback) {
	// exist early if shouldComponentUpdate exists and returns false
	if (
		this.shouldComponentUpdate !== void 0 && 
		componentUpdateBoundary(this, 'shouldComponentUpdate', this.props, newState) === false
	) {
		return;
	}

	// update state
	updateState(this.state, newState);

	// callback
	if (callback != null && typeof callback === 'function') {
		componentStateBoundary(this, callback, 0);
	}

	// update component
	this.forceUpdate(null);
}


/**
 * update state, hoisted to avoid `for in` deopts
 * 
 * @param {Object} oldState
 * @param {Object} newState
 */
function updateState (oldState, newState) {
	for (var name in newState) {
		oldState[name] = newState[name];
	}
}

