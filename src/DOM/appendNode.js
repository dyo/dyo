/**
 * append element
 *
 * @param  {VNode} newNode
 * @param  {Node}  parentNode
 * @param  {Node}  nextNode
 */
function appendNode (newNode, parentNode, nextNode) {
	if (newNode._owner && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount();
	}

	// append node
	parentNode.appendChild(nextNode);
	
	if (newNode._owner && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount();
	}
}

