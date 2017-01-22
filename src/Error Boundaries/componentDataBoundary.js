/**
 * data error boundaries
 *
 * @param {Component} component
 * @param {string}    method
 * @param {Object}    props
 */
function componentDataBoundary (component, method, data) {	
	try {
		return component[method](data);
	}
	catch (error) {
		componentErrorBoundary(error, component, method);
	}
}

