/**
 * insert element
 *
 * @param  {VNode}  newNode
 * @param  {VNode}  newNode
 * @param  {Node}   parentNode
 * @param  {Node}   nextNode
 */
function insertNode (newNode, oldNode, parentNode, nextNode) {
	if (newNode._owner && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount();
	}

	// insert node
	parentNode.insertBefore(nextNode, oldNode._node);

	if (newNode._owner && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount();
	}
}

