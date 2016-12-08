/**
 * replace element
 *
 * @param  {VNode}  newNode
 * @param  {VNode}  oldNode
 * @param  {Node}   parentNode 
 * @param  {Node}   nextNode
 */
function replaceNode (newNode, oldNode, parentNode, nextNode) {
	// replace node
	parentNode.replaceChild(nextNode, oldNode._node);

	// remove reference to avoid memory leaks with hoisted VNodes
	oldNode._node = null;

	// replace node is also a form of removing the node
	if (oldNode._owner) {
		if (oldNode._owner.componentWillUnmount) {
			oldNode._owner.componentWillUnmount();
		}

		// remove reference...
		oldNode._owner = null;
	}
}

