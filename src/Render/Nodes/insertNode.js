/**
 * insert element
 *
 * @param {VNode} newNode
 * @param {Node}  oldNode
 * @param {Node}  parentNode
 * @param {Node}  nextNode
 */
function insertNode (newNode, oldNode, parentNode, nextNode) {
	if (newNode._owner !== null && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount(nextNode);
	}

	// insert node
	parentNode.insertBefore(nextNode, oldNode);

	if (newNode._owner !== null && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount(nextNode);
	}
}

