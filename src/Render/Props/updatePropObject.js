/**
 * update prop objects, i.e .style
 *
 * @param {string} parent
 * @param {Object} prop
 * @param {Object} target
 */
function updatePropObject (parent, prop, target) {
	for (var name in prop) {
		var value = prop[name] || null;

		// assign if target object has property
		if (name in target) {
			target[name] = value;
		}
		// style properties that don't exist on CSSStyleDeclaration
		else if (parent === 'style') {
			// assign/remove
			value ? target.setProperty(name, value, null) : target.removeProperty(name);
		}
	}
}

