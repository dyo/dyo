/**
 * remove element
 *
 * @param  {VNode} oldNode
 * @param  {Node}  parent
 */
function removeNode (oldNode, parent) {
	// remove node
	parent.removeChild(oldNode._node);

	// remove reference to avoid memory leaks with hoisted VNodes
	oldNode._node = null;

	if (oldNode._owner) {
		if (oldNode._owner.componentWillUnmount) {
			oldNode._owner.componentWillUnmount();
		}

		// remove reference...
		oldNode._owner = null;
	}
}

