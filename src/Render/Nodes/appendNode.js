/**
 * append node
 *
 * @param {VNode} newNode
 * @param {Node}  parentNode
 * @param {Node}  nextNode
 */
function appendNode (newNode, parentNode, nextNode) {
	if (newNode.instance !== null && newNode.instance.componentWillMount) {
		newNode.instance.componentWillMount(nextNode);
	}

	// append DOMNode
	parentNode.appendChild(nextNode);

	if (newNode.instance !== null && newNode.instance.componentDidMount) {
		newNode.instance.componentDidMount(nextNode);
	}
}

