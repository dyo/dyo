/**
 * component shape
 * 
 * @param  {(function|Component)} type
 * @param  {Object=}              props
 * @param  {any[]=}               children
 * @return {VNode}
 */
function VComponent (type, props, children) {
	return {
		nodeType: 2, 
		type: type, 
		props: (props || type.defaultProps || objEmpty), 
		children: (children || arrEmpty),
		DOMNode: null,
		instance: null,
		index: null
	};
}

