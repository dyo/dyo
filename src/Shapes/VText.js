/**
 * text shape
 *
 * @public
 * 
 * @param  {(string|boolean|number)} text
 * @return {VNode}
 */
function VText (text) {
	return {
		nodeType: 3, 
		type: 'text', 
		props: objEmpty, 
		children: text, 
		DOMNode: null,
		instance: null,
		index: null
	};
}

