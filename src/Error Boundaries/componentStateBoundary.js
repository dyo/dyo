/**
 * state error boundaries
 *
 * @param {Component} component
 * @param {function}  func
 */
function componentStateBoundary (component, func, location) {	
	try {
		return func.call(component);
	}
	catch (error) {
		componentErrorBoundary(error, component, location === 0 ? 'setState' : 'forceUpdate');
	}
}

