/**
 * create DOMNode
 *
 * @param {number}    type
 * @param {Component} component
 */
function createDOMNode (type, component) {
	try {
		return document.createElement(type);
	} 
	catch (error) {
		return createDOMNodeError(
			componentRenderBoundary(component, 'element', type, error),
			component
		);
	}
}

