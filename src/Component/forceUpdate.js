/**
 * force an update
 *
 * @return {void}
 */
function forceUpdate () {
	// patch update
	this._vnode !== null && patch(extractRender(this), this._vnode);
}

