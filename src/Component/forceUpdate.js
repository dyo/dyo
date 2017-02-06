/**
 * force an update
 *
 * @public
 * 
 * @param  {function(this:Component)=} callback
 */
function forceUpdate (callback) {	
	if (this.componentWillUpdate !== void 0) {
		componentUpdateBoundary(this, 'componentWillUpdate', this.props, this.state);
	}

	var oldNode = this['--vnode'];
	var newNode = extractRenderNode(this);

	var newType = newNode.Type;
	var oldType = oldNode.Type;

	// different root node
	if (newNode.type !== oldNode.nodeName) {
		replaceRootNode(newNode, oldNode, newType, oldType, this);
	}
	// patch node
	else {
		// element root node
		if (oldType !== 3) {
			reconcileNodes(newNode, oldNode, newType, 1);
		} 
		// text root node
		else if (newNode.children !== oldNode.children) {
			oldNode.DOMNode.nodeValue = oldNode.children = newNode.children;
		}
	}

	if (this.componentDidUpdate !== void 0) {
		componentUpdateBoundary(this, 'componentDidUpdate', this.props, this.state);
	}

	// callback
	if (callback != null && typeof callback === 'function') {
		componentStateBoundary(this, callback, 1, null);
	}
}

