/**
 * create element
 * 
 * @param  {Object}  subject
 * @param  {Object=} component
 * @param  {string=} namespace
 * @return {Node}
 */
function createNode (subject, component, namespace) {
	var nodeType = subject.nodeType;
	
	if (nodeType === 3) {
		// textNode
		return subject._node = document.createTextNode(subject.children || '');
	} else {
		// element
		var element;
		var props;

		if (subject._node) {
			// clone, blueprint node/hoisted vnode
			props = subject.props;
			element = subject._node;
		} else {
			// create
			var newNode  = nodeType === 2 ? extractVNode(subject) : subject;
			var type     = newNode.type;
			var children = newNode.children;
			var length   = children.length;

			props = newNode.props;

			// assign namespace
			if (props.xmlns !== void 0) { 
				namespace = props.xmlns; 
			}

			// if namespaced, create namespaced element
			if (namespace !== null) {
				// if undefined, assign svg namespace
				if (props.xmlns === void 0) {
					props.xmlns = namespace;
				}

				element = document.createElementNS(namespace, type);
			} else {
				if (newNode.nodeType === 11) {
					element = document.createDocumentFragment();
				} else {
					element = document.createElement(type);
				}
			}

			if (props !== objEmpty) {
				// diff and update/add/remove props
				assignProps(element, props, false);
			}

			// vnode has component attachment
			if (subject._owner != null) {
				(component = subject._owner)._vnode._node = element;
			}

			if (length !== 0) {
				// create children
				for (var i = 0; i < length; i++) {
					var newChild = children[i];

					// clone vnode of hoisted/pre-rendered node
					if (newChild._node) {
						newChild = children[i] = VNode(
							newChild.nodeType,
							newChild.type,
							newChild.props,
							newChild.children,
							newChild._node.cloneNode(true),
							null
						);
					}

					// append child
					appendNode(newChild, element, createNode(newChild, component || null, namespace || null));
					
					// we pass namespace and component so that 
					// 1. if element is svg element we can namespace all its children
					// 2. if nested refs we can propagate them to a parent component
				}
			}

			subject._node = element;
		}

		// refs
		if (props.ref !== void 0 && component !== null) {
			assignRefs(element, props.ref, component);
		}

		// check if a stylesheet is attached
		if (subject.type.stylesheet != null) {
			if (subject.type.stylesheet === 0) {
				element.setAttribute(nsStyle, subject.type.id);
			} else {
				// note: since we mutate the .stylesheet property to 0 in stylesheet
				// this will execute exactly once for any component constructor
				stylesheet(element, subject.type);
			}
		}

		// cache element reference
		return element;
	}
}

