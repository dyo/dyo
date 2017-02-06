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
		Type: 2,
		type: type,
		props: (props = props != null ? props : objEmpty),
		children: (children == null ? arrEmpty : children),
		DOMNode: null,
		instance: null,
		index: 0,
		nodeName: null,
		key: props !== objEmpty ? props.key : void 0
	};
}

