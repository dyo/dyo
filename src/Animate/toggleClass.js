/**
 * element toggle class
 * 
 * @param {Node}   element   - target element
 * @param {string} className - classname to toggle
 */
function toggleClass (element, className) {
	if (element.classList !== void 0) {
		element.classList.toggle(className);
	} else {
		hasClass(element, className) === true ? 
					removeClass(element, className) : 
					addClass(element, className);
	}
}

