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
function VElement (type, props, children) {
	return {
		nodeType: 1, 
		type: type, 
		props: (props || objEmpty), 
		children: (children || []), 
		DOMNode: null,
		instance: null,
		index: null
	};
}

