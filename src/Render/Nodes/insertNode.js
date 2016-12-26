/**
 * insert element
 *
 * @param {VNode} newNode
 * @param {Node}  oldNode
 * @param {Node}  parentNode
 * @param {Node}  nextNode
 */
function insertNode (newNode, oldNode, parentNode, nextNode) {
	if (newNode.instance !== null && newNode.instance.componentWillMount) {
		newNode.instance.componentWillMount(nextNode);
	}

	// insert node
	parentNode.insertBefore(nextNode, oldNode);

	if (newNode.instance !== null && newNode.instance.componentDidMount) {
		newNode.instance.componentDidMount(nextNode);
	}
}

