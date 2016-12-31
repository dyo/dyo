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
	if (this.shouldComponentUpdate !== void 0 && this.shouldComponentUpdate(this.props, newState) === false) {
		return;
	}

	// update state
	updateState(this.state, newState);

	// update component
	this.forceUpdate(callback || null);
}


/**
 * update state, hoisted to avoid `for in` deopts
 * 
 * @param  {Object} state
 * @param  {Object} newState
 */
function updateState (state, newState) {
	for (var name in newState) {
		state[name] = newState[name];
	}
}

