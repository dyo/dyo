/**
 * create virtual child node
 * 
 * @param {any} child
 */
function createChild (child, children, index) {
	if (child != null) {
		if (child.nodeType !== void 0) {
			// Element
			children[index++] = child;
		} else {
			var type = typeof child;

			if (type === 'function') {
				// Component
				children[index++] = VComponent(child, null, null);
			} else if (type === 'object') {
				// Array
				for (var i = 0, len = child.length; i < len; i++) {
					index = createChild(child[i], children, index);
				}
			} else {
				// Text
				children[index++] = VText(type !== 'boolean' ? child : '');
			}
		}
	} else {
		// Empty
		children[index++] = nodEmpty;
	}

	return index;
}

