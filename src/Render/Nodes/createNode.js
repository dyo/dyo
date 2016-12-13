/**
 * create element
 * 
 * @param  {VNode}      subject
 * @param  {?Component} component
 * @param  {?string}    namespace
 * @return {Node}
 */
function createNode (subject, component, namespace) {
	var nodeType = subject.nodeType;
	
	if (nodeType === 3) {
		// textNode
		return subject._node = document.createTextNode(subject.children);
	} else {
		// element
		var element;
		var props;

		if (subject._node) {
			// hoisted vnode
			props   = subject.props;
			element = subject._node;
		} else {
			// create
			var newNode  = nodeType === 2 ? extractComponent(subject) : subject;
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

			// vnode has component attachment
			if (subject._owner !== null) {
				(component = subject._owner)._vnode._node = element;
			}

			if (props !== objEmpty) {
				// diff and update/add/remove props
				assignProps(element, props, false, component || null);
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
							null,
							null
						);
					}

					// append child
					appendNode(newChild, element, createNode(newChild, component, namespace));
					
					// we pass component and namespace so that 
					// 1. if an element is svg we can namespace all its children in kind
					// 2. we can propagate nested refs to the parent component
				}
			}

			// cache element reference
			subject._node = element;
		}

		if (component !== null) {
			// refs
			if (props.ref !== void 0) {
				extractRefs(element, props.ref, component);
			}

			// stylesheets
			if (component.stylesheet) {
				if (component.stylesheet.styler !== true) {
					// create
					stylesheet(component, subject.type)(element);
				} else {
					// namespace
					component.stylesheet(element);
				}
			}

			// animations
			if (component.animation && component.animation.animator !== true) {
				component.animation = animation(component, subject.type);
			}
		}

		return element;
	}
}

