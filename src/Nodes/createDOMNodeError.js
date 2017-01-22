/**
 * create error state DOMNode
 * 
 * @param  {VNode}      vnode
 * @param  {Component?} component
 * @return {Node}
 */
function createDOMNodeError (vnode, component) {
	// empty, null/undefined
	if (vnode == null) {
		return createNode(createEmptyShape(), null, null);
	}
	// string, number, element, array
	else {
		return createNode(createElement('@', null, vnode), component, null);
	}
}

