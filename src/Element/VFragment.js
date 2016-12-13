/**
 * virtual fragment node factory
 * 
 * @param  {VNode[]} children
 * @return {VNode}
 */
function VFragment (children) {
	return {
		nodeType: 11, 
		type: '@', 
		props: objEmpty, 
		children: children,
		_node: null,
		_owner: null,
		_index: null
	};
}

