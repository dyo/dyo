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

	var newNode = extractRenderNode(this);
	var oldNode = this.vnode;

	var newType = newNode.Type;
	var oldType = oldNode.Type;

	// different root node
	if (
		// node type check
		newType !== oldType || 

		// portal type check
		(newType === 4 && oldType === 4 && newNode !== oldNode) ||
	
		// element type checke
		newNode.type !== oldNode.type
	) {
		// render returns a promise
		if (newType === void 0) {
			return;
		}

		replaceRootNode(newNode, oldNode, newType, oldType, this);
	} 
	// patch node
	else {
		// text root node
		if (oldType === 3) {
			if (newNode.children !== oldNode.children) {
				oldNode.DOMNode.nodeValue = oldNode.children = newNode.children;
			}
		} 
		// element root node
		else {
			reconcileNodes(newNode, oldNode, newType, oldType);
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

