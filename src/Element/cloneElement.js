/**
 * clone and return an element having the original element's props
 * with new props merged in shallowly and new children replacing existing ones.
 *
 * @public
 * 
 * @param  {VNode}                subject
 * @param  {Object<string, any>=} newProps
 * @param  {any[]=}               newChildren
 * @return {VNode}
 */
function cloneElement (subject, newProps, newChildren) {
	var type = subject.type;
	var props = subject.props;
	var children = newChildren || subject.children;

	newProps = newProps || {};

	// copy old props
	for (var name in subject.props) {
		if (newProps[name] === void 0) {
			newProps[name] = props[name];
		}
	}

	// replace children
	if (newChildren !== void 0) {
		var length = newChildren.length;

		// if not empty, copy
		if (length > 0) {
			var index = 0;
			
			children = [];

			// copy old children
			for (var i = 0; i < length; i++) {
				index = createChild(newChildren[i], children, index);
			}
		}
	}

	return createElement(type, newProps, children);
}

