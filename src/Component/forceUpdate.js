/**
 * force an update
 *
 * @public
 * 
 * @param  {function(this:Component)=} callback
 */
function forceUpdate (callback) {
	if (this.componentWillUpdate !== void 0) {
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
		newNode.instance = oldNode.instance;
	} else {
		// patch node
		patchNodes(newNode, oldNode, newNode.nodeType, oldNode.nodeType);
	}

	if (this.componentDidUpdate !== void 0) {
		this.componentDidUpdate(this.props, this.state);
	}

	// if callback function call with the component as `this` context
	if (callback != null && typeof callback === 'function') {
		callback.call(this);
	}
}

