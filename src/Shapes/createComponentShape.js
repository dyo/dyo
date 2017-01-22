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
function createComponentShape (type, props, children) {
	return {
		nodeType: 2,
		type: type,
		props: props || objEmpty,
		children: children || arrEmpty,
		DOMNode: null,
		instance: null,
		index: 0,
		parent: null,
		key: null
	};
}

