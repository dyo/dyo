/**
 * remove element
 *
 * @param {VNode} oldNode
 * @param {Node}  parentNode
 */
function removeNode (oldNode, parentNode) {
	if (oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
		oldNode.instance.componentWillUnmount(oldNode.DOMNode);
	}

	// remove node
	parentNode.removeChild(oldNode.DOMNode);

	// clear references
	oldNode.DOMNode = null;
}

