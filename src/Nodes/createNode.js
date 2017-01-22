/**
 * create node
 * 
 * @param  {VNode}      subject
 * @param  {?Component} component
 * @param  {?string}    namespace
 * @return {Node}
 */
function createNode (subject, component, namespace) {
	var nodeType = subject.nodeType;
	
	// create text node element	
	if (nodeType === 3) {
		return subject.DOMNode = document.createTextNode(subject.children);
	}

	// hoisted, clone DOMNode, ensure fragments are not cloned
	if (subject.DOMNode !== null) {
		return subject.DOMNode = subject.DOMNode.cloneNode(true);
	}

	// create
	var vnode = nodeType === 2 ? extractComponentNode(subject) : subject;
	var type = vnode.type;
	var children = vnode.children;
	var props = vnode.props;
	var length = children.length;
	var element;

	var thrown = 0;
	var vnodeType = vnode.nodeType;

	// text
	if (vnodeType === 3) {
		return vnode.DOMNode = subject.DOMNode = document.createTextNode(children);
	}

	var instance = subject.instance !== null;

	// assign namespace
	if (props.xmlns !== void 0) { 
		namespace = props.xmlns; 
	}

	// has a component instance
	if (instance) {
		// hydrate component instance
		component = subject.instance;
		thrown = component.thrown;
	}

	// create namespaced element
	if (namespace !== null) {
		// if undefined, assign svg namespace
		if (props.xmlns === void 0) {
			props === objEmpty ? (props = {xmlns: namespace}) : (props.xmlns = namespace);
		}

		element = createDOMNodeNS(namespace, type, component);
	}
	// create html element
	else {
		element = createDOMNode(type, component);
	}

	// stylesheets
	if (instance) {
		// avoid appending children if an error was thrown
		if (thrown !== 0 || thrown !== component.thrown) {
			return vnode.DOMNode = subject.DOMNode = element;
		}

		if (component.vnode.DOMNode === null) {
			component.vnode.DOMNode = element;
		}

		if (nodeType === 2 && component.stylesheet !== void 0 && type !== 'noscript') {
			createScopedStylesheet(component, subject.type, element);
		}
	}

	// has children
	if (length !== 0) {
		// append children
		for (var i = 0; i < length; i++) {
			var newChild = children[i];

			// hoisted, clone VNode
			if (newChild.DOMNode !== null) {
				newChild = children[i] = cloneNode(newChild);
			}

			// append child
			appendNode(newChild.nodeType, newChild, element, createNode(newChild, component, namespace));					
		}
	}

	// props is not an empty object
	if (props !== objEmpty) {
		// refs
		if (props.ref !== void 0) {
			refs(props.ref, component, element);
		}

		// props and events
		assignProps(element, props, false, component);
	}

	// cache element reference
	return vnode.DOMNode = subject.DOMNode = element;
}

