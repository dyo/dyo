/**
 * mount error boundaries
 *
 * @param {Component} component
 * @param {string}    method
 * @param {Node}      DOMNode
 */
function componentMountBoundary (component, method, DOMNode) {	
	try {
		component[method](DOMNode);
	}
	catch (error) {
		componentErrorBoundary(error, component, method);
	}
}

