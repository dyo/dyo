/**
 * replace node
 *
 * @param {VNode} newType
 * @param {VNode} oldType
 * @param {VNode} newNode
 * @param {VNode} oldNode
 * @param {Node}  parentNode 
 * @param {Node}  nextNode
 */
function replaceNode (newType, oldType, newNode, oldNode, parentNode, nextNode) {
	// lifecycle, componentWillUnmount
	if (oldType === 2 && oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
		componentMountBoundary(oldNode.instance, 'componentWillUnmount', oldNode.DOMNode);
	}

	// lifecycle, componentWillMount
	if (newType === 2 && newNode.instance !== null && newNode.instance.componentWillMount) {
		componentMountBoundary(newNode.instance, 'componentWillMount', nextNode);
	}

	// replace element
	parentNode.replaceChild(nextNode, oldNode.DOMNode);
		
	// lifecycle, componentDidmount
	if (newType === 2 && newNode.instance !== null && newNode.instance.componentDidMount) {
		componentMountBoundary(newNode.instance, 'componentDidMount', nextNode);
	}

	// clear references
	oldNode.DOMNode = null;
}

