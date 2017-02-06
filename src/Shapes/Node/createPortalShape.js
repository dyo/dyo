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
		props: (props = props != null ? props : objEmpty),
		children: (children == null ? [] : children),
		DOMNode: type,
		instance: null,
		index: 0,
		nodeName: null,
		key: props !== objEmpty ? props.key : void 0
	};
}

