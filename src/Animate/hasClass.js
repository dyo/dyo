/**
 * element has class
 * 
 * @param  {Node}    element
 * @param  {string}  className
 * @return {boolean}
 */
function hasClass (element, className) {
	return element.classList !== void 0 ? 
		element.classList.contains(className) : 
		element.className.indexOf(className) > -1;
}

