/**
 * update error boundaries
 *
 * @param  {Component} component
 * @param  {string}    method
 * @param  {Object}    newProps
 * @param  {Object}    newState
 * @return {boolean?}
 */
function componentUpdateBoundary (component, method, newProps, newState) {
	try {
		return component[method](newProps, newState);
	}
	catch (error) {
		componentErrorBoundary(error, component, method);
	}
}

