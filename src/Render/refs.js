/**
 * assign refs
 * 
 * @param {Node}      element
 * @param {Object}    refs
 * @param {Component} component
 */
function assignRefs (element, ref, component) {
	// hoist typeof info
	var type = typeof ref;
	var refs = (component.refs === null ? component.refs = {} : component.refs);

	if (type === 'string') {
		// string ref, assign
		refs[ref] = element;
	} else if (type === 'function') {
		// function ref, call with element as arg
		ref(element);
	}
}

