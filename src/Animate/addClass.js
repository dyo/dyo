/**
 * element add class
 * 
 * @param {Node}   element
 * @param {string} className
 */
function addClass (element, className) {
	if (element.classList !== void 0) {
		element.classList.add(className);
	} else if (hasClass(element, className) === true) {
		var classes = element.className.split(' ');
		// add new class, join array, assign
		classes[classes.length] = className; 
		element.className = classes.join(' ');			
	}
}

