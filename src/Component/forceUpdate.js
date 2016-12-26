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
	var oldNode = this.VNode;

	// component returns a different root node
	if (newNode.type !== oldNode.type) {
		// replace node
		replaceNode(newNode, oldNode, oldNode.DOMNode.parentNode, createNode(newNode, null, null));

		// hydrate newNode
		oldNode.nodeType = newNode.nodeType;
		oldNode.type     = newNode.type;
		oldNode.props    = newNode.props;
		oldNode.children = newNode.children;
		oldNode.DOMNode  = newNode.DOMNode;
		oldNode.instance = newNode.instance;

		patch(newNode, oldNode);
	} else {
		// patch node
		patch(newNode, oldNode, newNode.nodeType, oldNode.nodeType);
	}

	if (this.componentDidUpdate) {
		this.componentDidUpdate(this.props, this.state);
	}

	// callback
	if (callback && typeof callback === 'function') {
		callback.call(this);
	}
}

