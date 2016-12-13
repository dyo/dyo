/**
 * remove element
 *
 * @param {VNode} oldNode
 * @param {Node}  parentNode
 */
function removeNode (oldNode, parentNode) {
	if (oldNode._owner !== null && oldNode._owner.componentWillUnmount) {
		oldNode._owner.componentWillUnmount(oldNode._node);
	}

	// remove node
	parentNode.removeChild(oldNode._node);

	// clear references
	oldNode._node = null;
}

