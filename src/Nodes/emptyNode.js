/**
 * empty node
 *
 * @param {VNode}  oldNode
 * @param {number} oldLength
 */
function emptyNode (oldNode, oldLength) {
	var children = oldNode.children;	
	var parentNode = oldNode.DOMNode;
	var oldChild;

	// umount children
	for (var i = 0; i < oldLength; i++) {
		oldChild = children[i];
		
		// lifecycle, componentWillUnmount
		if (oldChild.Type === 2 && oldChild.instance !== null && oldChild.instance.componentWillUnmount) {
			componentMountBoundary(oldChild.instance, 'componentWillUnmount', oldChild.DOMNode);
		}

		// clear references
		oldChild.DOMNode = null;
	}

	parentNode.textContent = '';
}

