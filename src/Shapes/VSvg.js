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
function VSvg (type, props, children) {
	return {
		nodeType: 1, 
		type: type, 
		props: (props = props || {}, props.xmlns = nsSvg, props), 
		children: (children || []),
		DOMNode: null,
		instance: null,
		index: null
	};
}

