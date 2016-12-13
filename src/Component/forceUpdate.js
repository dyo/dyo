/**
 * force an update
 *
 * @param  {function=}
 * @return {void}
 */
function forceUpdate (callback) {
	if (this.componentWillUpdate) {
		this.componentWillUpdate(this.props, this.state);
	}

	// patch update
	patch(extractRender(this), this._vnode);

	if (this.componentDidUpdate) {
		this.componentDidUpdate(this.props, this.state);
	}

	// callback
	if (callback) {
		callback(this.state);
	}
}

