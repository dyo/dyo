/**
 * move element
 * 
 * @param  {VNode} oldNode
 * @param  {Node}  parentNode
 * @param  {Node}  newNode
 */
function moveNode (oldNode, parentNode, newNode) {
	parentNode.insertBefore(newNode._node, oldNode._node);
}

