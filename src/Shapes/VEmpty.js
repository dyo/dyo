/**
 * empty shape
 * 
 * @return {VNode}
 */
function VEmpty () {
	return {
		nodeType: 1, 
		type: 'noscript', 
		props: objEmpty, 
		children: [], 
		DOMNode: null,
		instance: null,
		index: null
	};
}

