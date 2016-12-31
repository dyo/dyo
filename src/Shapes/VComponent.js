/**
 * component shape
 *
 * @public
 * 
 * @param  {(function|Component)} type
 * @param  {Object<string, any>=} props
 * @param  {any[]=}               children
 * @return {VNode}
 */
function VComponent (type, props, children) {
	return {
		nodeType: 2, 
		type: type, 
		props: (props || objEmpty), 
		children: (children || arrEmpty),
		DOMNode: null,
		instance: null,
		index: null
	};
}

