/**
 * virtual element node factory
 * 
 * @param  {string} type
 * @param  {Object=} props
 * @param  {any[]=}  children
 * @return {VNode}
 */
function VElement (type, props, children) {
	return {
		nodeType: 1, 
		type: type, 
		props: (props || objEmpty), 
		children: (children || []), 
		_node: null,
		_owner: null
	};
}

