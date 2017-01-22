/**
 * render error boundaries
 *
 * @param {Component} component
 * @param {string}    type
 * @param {string}    name
 * @param {Error}     error
 */
function componentRenderBoundary (component, type, name, error) {
	return componentErrorBoundary(
		'Encountered an unsupported ' + type + ' type `'+ name + '`.\n\n' + error,
		component, 
		type
	);
}

