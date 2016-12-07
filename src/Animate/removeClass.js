/**
 * element remove class
 * 
 * @param {Node}
 * @param {string}
 */
function removeClass (element, className) {
	if (element.classList !== void 0) {
		element.classList.remove(className);
	} else {
		var classes = element.className.split(' ');
		// remove className on index, join array, assign
		classes.splice(classes.indexOf(className), 1);
		element.className = classes.join(' ');
	}
}

