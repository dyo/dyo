/**
 * refs
 *
 * @param {(string|function(Node))} ref
 * @param {Component}               component
 * @param {Node}                    element
 */
function refs (ref, component, element) {
	if (typeof ref === 'function') {
		ref.call(component, element);
	} else {
		(component.refs = component.refs || {})[ref] = element;
	}
}

