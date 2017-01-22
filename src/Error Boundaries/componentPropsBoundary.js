/**
 * props error boundaries
 *
 * @param {Component} component
 * @param {Object}    props
 */
function componentPropsBoundary (component, props) {	
	try {
		component.componentWillReceiveProps(props);
	}
	catch (error) {
		componentErrorBoundary(error, component, 'componentWillReceiveProps');
	}
}

