/**
 * replace element
 *
 * @param {VNode} newNode
 * @param {VNode} oldNode
 * @param {Node}  parentNode 
 * @param {Node}  nextNode
 */
function replaceNode (newNode, oldNode, parentNode, nextNode) {
	if (oldNode._owner !== null && oldNode._owner.componentWillUnmount) {
		oldNode._owner.componentWillUnmount(oldNode._node);
	}

	if (newNode._owner !== null && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount(nextNode);
	}

	// replace node
	parentNode.replaceChild(nextNode, oldNode._node);
	
	if (newNode._owner !== null && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount(nextNode);
	}

	// clear references
	oldNode._node = null;
}

