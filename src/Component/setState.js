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

	this.forceUpdate();

	// callback, call
	if (callback !== void 0) {
		callback(this.state);
	}
}

