/**
 * mount render
 * 
 * @param  {Node}   element
 * @param  {Object} newNode
 * @return {number}
 */
function mount (element, newNode) {
	// clear element
	element.textContent = '';
	// create element
	appendNode(newNode, element, createNode(newNode, null, null));
}

