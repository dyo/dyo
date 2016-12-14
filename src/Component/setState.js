/**
 * set state
 * 
 * @param {Object}    newState
 * @param {function=} callback
 */
function setState (newState, callback) {
	if (this.shouldComponentUpdate && this.shouldComponentUpdate(this.props, newState) === false) {
		return;
	}

	updateState(this.state, newState);

	callback ? this.forceUpdate(callback) : this.forceUpdate();
}


/**
 * update state, hoisted to avoid deopts
 * 
 * @param  {Object} state
 * @param  {Object} newState
 */
function updateState (state, newState) {
	for (var name in newState) {
		state[name] = newState[name];
	}
}

