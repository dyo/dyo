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
		return subject.DOMNode = document.createTextNode(subject.children);
	} else {
		if (subject.DOMNode !== null) {
			// clone
			return subject.DOMNode = subject.DOMNode.cloneNode(true);
		} else {
			// create
			var newNode  = nodeType === 2 ? extractComponent(subject) : subject;
			var type     = newNode.type;
			var children = newNode.children;
			var props    = newNode.props;
			var length   = children.length;
			var element;

			// update nodeType
			nodeType = newNode.nodeType;

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
				if (nodeType !== 11) {
					element = document.createElement(type);					
				} else {
					element = document.createDocumentFragment();
				}
			}

			// vnode has component attachment
			if (subject.instance !== null) {
				(component = subject.instance).VNode.DOMNode = element;

				// stylesheets
				if (component.stylesheet && nodeType !== 11) {
					if (component.stylesheet.styler === void 0) {
						// create
						stylesheet(component, subject.type)(element);
					} else {
						// namespace
						component.stylesheet(element);
					}
				}
			}

			if (length !== 0) {
				// create children
				for (var i = 0; i < length; i++) {
					var newChild = children[i];

					// clone VNode
					if (newChild.DOMNode !== null) {
						newChild = children[i] = VNode(
							newChild.nodeType,
							newChild.type,
							newChild.props,
							newChild.children,
							newChild.DOMNode,
							null,
							null
						);
					}

					// append child
					appendNode(newChild, element, createNode(newChild, component, namespace));					
				}
			}

			if (props !== objEmpty) {
				// refs
				props.ref && refs(props.ref, component, element);

				// initialize props
				assignProps(element, props, false, component);
			}

			// cache element reference
			return subject.DOMNode = element;
		}
	}
}

