/**
 * empty shape
 * 
 * @return {VNode}
 */
function createEmptyShape () {
	return {
		nodeType: 1,
		type: 'noscript',
		props: objEmpty,
		children: [],
		DOMNode: null,
		instance: null,
		index: 0,
		parent: null,
		key: null
	};
}

