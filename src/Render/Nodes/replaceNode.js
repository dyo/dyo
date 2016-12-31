/**
 * replace node
 *
 * @param {VNode} newNode
 * @param {VNode} oldNode
 * @param {Node}  parentNode 
 * @param {Node}  nextNode
 */
function replaceNode (newNode, oldNode, parentNode, nextNode) {
	if (oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
		oldNode.instance.componentWillUnmount(oldNode.DOMNode);
	}

	if (newNode.instance !== null && newNode.instance.componentWillMount) {
		newNode.instance.componentWillMount(nextNode);
	}

	// replace DOMNode
	parentNode.replaceChild(nextNode, oldNode.DOMNode);
	
	if (newNode.instance !== null && newNode.instance.componentDidMount) {
		newNode.instance.componentDidMount(nextNode);
	}

	// clear references
	oldNode.DOMNode = null;
}

