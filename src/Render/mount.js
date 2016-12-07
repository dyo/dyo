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


/**
 * retrieve mount element
 * 
 * @param  {*} subject
 * @return {Node}
 */
function retrieveMount (subject) {
	// document not available
	if (subject != null && subject.nodeType != null) {
		return subject;
	}

	var target = document.querySelector(subject);

	// default to document.body if no match/document
	return (target === null || target === document) ? document.body : target;
}

