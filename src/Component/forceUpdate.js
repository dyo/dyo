/**
 * force an update
 *
 * @param  {function=}
 */
function forceUpdate (callback) {
	if (this.componentWillUpdate) {
		this.componentWillUpdate(this.props, this.state);
	}

	var newNode = extractRender(this);
	var oldNode = this._vnode;

	// component returns a different root node
	if (newNode.type !== oldNode.type) {		
		// replace node
		replaceNode(newNode, oldNode, oldNode._node.parentNode, createNode(newNode, null, null));

		// hydrate newNode
		oldNode.nodeType = newNode.nodeType;
		oldNode.type     = newNode.type;
		oldNode.props    = newNode.props;
		oldNode.children = newNode.children;
		oldNode._node    = newNode._node;
		oldNode._owner   = newNode._owner;
	} else {
		// patch node
		patch(newNode, oldNode);
	}

	if (this.componentDidUpdate) {
		this.componentDidUpdate(this.props, this.state);
	}

	// callback
	if (callback) {
		callback(this.state);
	}
}

