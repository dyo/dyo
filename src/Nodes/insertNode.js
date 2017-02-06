/**
 * insert node
 *
 * @param {number} newType
 * @param {VNode}  newNode
 * @param {Node}   prevNode
 * @param {Node}   parentNode
 * @param {Node}   nextNode
 */
function insertNode (newType, newNode, prevNode, parentNode, nextNode) {
	// lifecycle, componentWillMount
	if (newType === 2 && newNode.instance !== null && newNode.instance.componentWillMount) {
		componentMountBoundary(newNode.instance, 'componentWillMount', nextNode);
	}

	// insert element
	parentNode.insertBefore(nextNode, prevNode);

	// lifecycle, componentDidMount
	if (newType === 2 && newNode.instance !== null && newNode.instance.componentDidMount) {
		componentMountBoundary(newNode.instance, 'componentDidMount', nextNode);
	}
}

