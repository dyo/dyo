/**
 * clone and return an element having the original element's props
 * with new props merged in shallowly and new children replacing existing ones.
 * 
 * @param  {VNode}   subject
 * @param  {Object=} newProps
 * @param  {any[]=}  newChildren
 * @return {VNode}
 */
function cloneElement (subject, newProps, newChildren) {
	var type     = subject.type;
	var props    = newProps || {};
	var children = newChildren || subject.children;

	// copy old props
	each(subject.props, function (value, name) {
		if (props[name] === void 0) {
			props[name] = value;
		}
	});

	// replace children
	if (newChildren !== void 0) {
		var length = newChildren.length;

		// if not empty, copy
		if (length > 0) {
			children = [];

			// copy old children
			for (var i = 0; i < length; i++) {
				children[i] = createChild(newChildren[i]);
			}
		}
	}

	return createElement(type, props, children);
}

