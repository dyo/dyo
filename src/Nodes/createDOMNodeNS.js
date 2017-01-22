/**
 * create namespaced DOMNode
 *
 * @param {namespace} namespace
 * @param {number}    type
 * @param {Componnet} component
 */
function createDOMNodeNS (namespace, type, component) {
	try {
		return document.createElementNS(namespace, type);
	}
	catch (error) {
		return createDOMNodeError(
			componentRenderBoundary(component, 'element', type, error),
			component
		);
	}
}

