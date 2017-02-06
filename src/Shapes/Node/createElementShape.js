/**
 * element shape
 *
 * @public
 * 
 * @param  {string}               type
 * @param  {Object<string, any>=} props
 * @param  {VNode[]=}             children
 * @return {VNode}
 */
function createElementShape (type, props, children) {
	return {
		Type: 1,
		type: type,
		props: (props = props != null ? props : objEmpty),
		children: (children == null ? [] : children),
		DOMNode: null,
		instance: null,
		index: 0,
		nodeName: null,
		key: props !== objEmpty ? props.key : void 0
	};
}

