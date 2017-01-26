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
		props: (props = props || {}, props.xmlns = nsSvg, props),
		children: children || [],
		DOMNode: null,
		instance: null,
		index: 0,
		parent: null,
		key: null
	};
}

