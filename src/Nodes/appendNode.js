/**
 * append node
 *
 * @param {number} newType
 * @param {VNode}  newNode
 * @param {Node}   parentNode
 * @param {Node}   nextNode
 */
function appendNode (newType, newNode, parentNode, nextNode) {
	if (newType === 2 && newNode.instance !== null && newNode.instance.componentWillMount) {
		componentMountBoundary(newNode.instance, 'componentWillMount', nextNode);
	}

	// append element
	parentNode.appendChild(nextNode);

	if (newType === 2 && newNode.instance !== null && newNode.instance.componentDidMount) {
		componentMountBoundary(newNode.instance, 'componentDidMount', nextNode);
	}
}

