/**
 * svg shape
 *
 * @public
 * 
 * @param  {string}               type
 * @param  {Object<string, any>=} props
 * @param  {VNode[]=}             children
 * @return {VNode}
 */
function createSvgShape (type, props, children) {
	return {
		Type: 1,
		type: type,
		props: (props == null ? (props = {xmlns: nsSvg}) : (props.xmlns = nsSvg, props)),
		children: (children == null ? [] : children),
		DOMNode: null,
		instance: null,
		index: 0,
		nodeName: null,
		key: props.key
	};
}

