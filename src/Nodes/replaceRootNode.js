/**
 * replace root node
 * 
 * @param  {VNode}     newNode
 * @param  {VNode}     oldNode
 * @param  {number}    newType
 * @param  {number}    oldType
 * @param  {Component} component
 */
function replaceRootNode (newNode, oldNode, newType, oldType, component) {
	var refDOMNode = oldNode.DOMNode;
	var newProps = newNode.props;

	// replace node
	refDOMNode.parentNode.replaceChild(createNode(newNode, component, null), refDOMNode);

	// hydrate new node
	oldNode.props = newProps;
	oldNode.nodeName = newNode.nodeName || newNode.type;
	oldNode.children = newNode.children;
	oldNode.DOMNode = newNode.DOMNode;

 	// // stylesheet
 	if (newType !== 3 && component.stylesheet !== void 0) {
 		createScopedStylesheet(component, component.constructor, newNode.DOMNode);
 	}
}	

