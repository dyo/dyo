/**
 * create virtual child node
 * 
 * @param  {*}       child
 * @param  {VNode[]} children
 * @param  {number}  index
 * @return {number}  index
 */
function createChild (child, children, index) {
	if (child != null) {
		if (child.nodeType !== void 0) {
			// Element
			children[index++] = child;
		}
		else {
			var type = typeof child;

			if (type === 'function') {
				// Component
				children[index++] = createComponentShape(child, null, null);
			}
			else if (type === 'object') {
				// Array
				for (var i = 0, len = child.length; i < len; i++) {
					index = createChild(child[i], children, index);
				}
			}
			else {
				// Text
				children[index++] = createTextShape(type !== 'boolean' ? child : '');
			}
		}
	}

	return index;
}

