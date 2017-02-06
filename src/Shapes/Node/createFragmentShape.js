/**
 * fragment shape
 *
 * @public
 * 
 * @param  {VNode[]} children
 * @return {VNode}
 */
function createFragmentShape (children) {
	return {
		Type: 1,
		type: 'fragment',
		props: fragProps,
		children: children,
		DOMNode: null,
		instance: null,
		index: 0,
		nodeName: null,
		key: void 0
	};
}

