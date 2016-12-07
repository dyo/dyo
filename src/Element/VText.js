/**
 * virtual text node factory
 * 
 * @param  {string} text
 * @return {VNode}
 */
function VText (text) {
	return {
		nodeType: 3, 
		type: 'text', 
		props: objEmpty, 
		children: text, 
		_node: null,
		_owner: null
	};
}

