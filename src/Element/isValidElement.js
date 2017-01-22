/**
 * is valid element
 *
 * @public
 * 
 * @param  {any} subject
 * @return {boolean}
 */
function isValidElement (subject) {
	return subject != null && subject.nodeType != null && subject.nodeName === void 0;
}

