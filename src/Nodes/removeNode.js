/**
 * remove node
 *
 * @param {number} oldType
 * @param {VNode}  oldNode
 * @param {Node}   parentNode
 */
function removeNode (oldType, oldNode, parentNode) {
	// lifecycle, componentWillUnmount
	if (oldType === 2 && oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
		componentMountBoundary(oldNode.instance, 'componentWillUnmount', oldNode.DOMNode);
	}

	// remove element
	parentNode.removeChild(oldNode.DOMNode);

	// clear references
	oldNode.DOMNode = null;
}

