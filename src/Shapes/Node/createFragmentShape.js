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
		parent: null,
		key: null
	};
}

