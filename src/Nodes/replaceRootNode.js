/**
 * replace root node
 * 
 * @param  {VNode}     newNode
 * @param  {VNode}     oldNode
 * @param  {number}
 * @param  {number}
 * @param  {Component} component
 */
function replaceRootNode (newNode, oldNode, newType, oldType, component) {
	var key = oldNode.props.key;
	var node = oldNode.parent;

	// replace node
	replaceNode(
		newType, 
		oldType, 
		newNode, 
		oldNode, 
		oldNode.DOMNode.parentNode, 
		createNode(newNode, component, null)
	);

	// stylesheet
	if (newType !== 3 && component.stylesheet !== void 0) {
		createScopedStylesheet(component, component.constructor, newNode.DOMNode);
	}

	// hydrate new node
	oldNode.Type = newType;
	oldNode.type = newNode.type;
	oldNode.props = newNode.props;
	oldNode.children = newNode.children;
	oldNode.DOMNode = newNode.DOMNode;
	oldNode.instance = newNode.instance = component;

	node.type = component.constructor;
	node.props = newNode.props;
	node.children = newNode.children;
	node.DOMNode = newNode.DOMNode;
	node.instance = component;

	if (key !== void 0) {
		node.props === objEmpty ? (node.props = {key: key}) : (node.props.key = key);
	}
}

