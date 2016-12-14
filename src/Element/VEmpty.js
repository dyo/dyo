/**
 * virtual empty node factory
 * 
 * @return {VNode}
 */
function VEmpty () {
	return {
		nodeType: 1, 
		type: 'noscript', 
		props: objEmpty, 
		children: [], 
		_node: null,
		_owner: null,
		_index: null
	};
}

