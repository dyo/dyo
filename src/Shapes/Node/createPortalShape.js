/**
 * portal shape
 *
 * @public
 * 
 * @param  {Node} DOMNode
 * @return {VNode}
 */
function createPortalShape (type, props, children) {
	return {
		Type: 4,
		type: type.nodeName.toLowerCase(),
		props: props,
		children: children,
		DOMNode: type,
		instance: null,
		index: 0,
		parent: null,
		key: null
	};
}

