/**
 * create virtual child node
 * 
 * @param {any} child
 */
function createChild (child, children) {
	if (child != null) {
		if (child.nodeType !== void 0) {
			// Element
			children[children.length] = child;
		} else {
			var type = typeof child;

			if (type === 'function') {
				// Component
				children[children.length] = VComponent(child);
			} else if (type !== 'object') {
				// Text
				children[children.length] = VText(child);
			} else {
				// Array
				for (var i = 0, len = child.length; i < len; i++) {
					createChild(child[i], children);
				}
			}
		}
	} else {
		// Empty
		children[children.length] = nodEmpty;
	}
}

