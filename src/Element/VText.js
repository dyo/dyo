/**
 * virtual text node factory
 * 
 * @param  {(string|boolean|number)} text
 * @return {VNode}
 */
function VText (text) {
	return {
		nodeType: 3, 
		type: 'text', 
		props: objEmpty, 
		children: text === false ? '' : text, 
		_node: null,
		_owner: null,
		_index: null
	};
}

