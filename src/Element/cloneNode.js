/**
 * clone virtual node
 * 
 * @param  {VNode} subject
 * @return {VNode}
 */
function cloneNode (subject) {
	return createNodeShape(
		subject.Type,
		subject.type,
		subject.props,
		subject.children,
		subject.DOMNode,
		null,
		0,
		null,
		null
	);
}

