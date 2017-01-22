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
		nodeType: 1,
		type: type,
		props: props || objEmpty,
		children: children || [],
		DOMNode: null,
		instance: null,
		index: 0,
		parent: null,
		key: null
	};
}

