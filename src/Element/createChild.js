/**
 * create virtual child node
 * 
 * @param {any} child
 */
function createChild (child) {
	if (child != null) {
		if (child.nodeType !== void 0) {
			// Element
			return child;
		} else if (typeof child === 'function') {
			// Component
			return VComponent(child);
		} else {
			// Text
			return VText(child);
		}
	} else {
		// Empty
		return nodeEmpty;
	}
}

