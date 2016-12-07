/**
 * create virtual child
 * 
 * @param  {*} child
 */
function createChild (child) {
	if (child != null && child.nodeType !== void 0) {
		// default element
		return child;
	} else if (typeof child === 'function') {
		// component
		return VComponent(child);
	} else {
		// primitives, string, bool, number
		return VText(child);
	}
}

