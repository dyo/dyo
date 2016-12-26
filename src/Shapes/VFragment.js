/**
 * fragment shape
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
		DOMNode: null,
		instance: null,
		index: null
	};
}

