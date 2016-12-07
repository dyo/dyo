/**
 * force an update
 *
 * @return {void}
 */
function forceUpdate () {
	if (this._vnode !== null) {
		// componentWillUpdate lifecycle
		if (this.componentWillUpdate) {
			this.componentWillUpdate(this.props, this.state);
		}

		// patch update
		patch(retrieveRender(this), this._vnode);

		// componentDidUpdate lifecycle
		if (this.componentDidUpdate) {
			this.componentDidUpdate(this.props, this.state);
		}
	}
}

