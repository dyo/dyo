/**
 * add event listener
 *
 * @param {Node}      element
 * @param {string}    name
 * @param {function}  listener
 * @param {Component} component
 */
function addEventListener (element, name, listener, component) {
	if (typeof listener !== 'function') {
		element.addEventListener(name, bindEvent(name, listener, component));
	} else {
		element.addEventListener(name, listener);
	}
}

