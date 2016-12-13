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

	// update state
	for (var name in newState) {
		this.state[name] = newState[name];
	}

	callback ? this.forceUpdate(callback) : this.forceUpdate();
}

