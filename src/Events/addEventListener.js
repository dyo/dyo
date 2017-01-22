/**
 * add event listener
 *
 * @param {Node}            element
 * @param {string}          name
 * @param {function|Object} listener
 * @param {Component}       component
 */
function addEventListener (element, name, listener, component) {
	// default listener
	if (typeof listener === 'function') {
		element.addEventListener(name, listener, false);
	}
	// non-default listener
	else {
		element.addEventListener(name, bindEvent(name, listener, component), listener.options || false);
	}
}

