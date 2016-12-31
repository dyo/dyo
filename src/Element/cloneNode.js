/**
 * clone virtual node
 * 
 * @param  {VNode} subject
 * @return {VNode}
 */
function cloneNode (subject) {
	return VNode(
		subject.nodeType,
		subject.type,
		subject.props,
		subject.children,
		subject.DOMNode,
		null,
		null
	);
}

