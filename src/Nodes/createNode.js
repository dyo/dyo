/**
 * create node
 * 
 * @param  {VNode}      subject
 * @param  {Component?} component
 * @param  {string?}    namespace
 * @return {Node}
 */
function createNode (subject, component, namespace) {
	var nodeType = subject.Type;

	// create text node element	
	if (nodeType === 3) {
		return subject.DOMNode = document.createTextNode(subject.children);
	}

	var vnode;
	var element;

	var portal = false;

	// DOMNode exists
	if (subject.DOMNode !== null) {
		element = subject.DOMNode;

		// portal
		if (portal = (nodeType === 4 || nodeType === 5)) {
			element = (vnode = subject).DOMNode = (nodeType === 4 ? element.cloneNode(true) : element);
		}
		// hoisted
		else {
			return subject.DOMNode = element.cloneNode(true);
		}
	}
	// create DOMNode
	else {
		vnode = nodeType === 2 ? extractComponentNode(subject) : subject;
	}
	
	var vnodeType = vnode.Type;	
	var children = vnode.children;

	if (portal === false) {
		// text		
		if (vnodeType === 3) {
			return vnode.DOMNode = subject.DOMNode = document.createTextNode(children);
		}
		// portal
		else if (vnodeType === 4 || vnodeType === 5) {
			element = vnode.DOMNode;
			portal = true;
		}
	}

	var type = vnode.type;
	var props = vnode.props;
	var length = children.length;

	var instance = subject.instance !== null;
	var thrown = 0;

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

	if (portal === false) {
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
	}

	if (instance) {
		// avoid appending children if an error was thrown
		if (thrown !== 0 || thrown !== component.thrown) {
			return vnode.DOMNode = subject.DOMNode = element;
		}

		// hydrate
		if (component.vnode.DOMNode === null) {
			component.vnode.DOMNode = element;
		}

		// stylesheets
		if (nodeType === 2 && component.stylesheet !== void 0 && type !== 'noscript' && type !== '#text') {
			createScopedStylesheet(component, subject.type, element);
		}
	}

	// has children
	if (length !== 0) {
		// append children
		for (var i = 0; i < length; i++) {
			var newChild = children[i];

			// hoisted, clone
			if (newChild.DOMNode !== null) {
				newChild = children[i] = cloneNode(newChild);
			}

			// append child
			appendNode(newChild.Type, newChild, element, createNode(newChild, component, namespace));
		}
	}

	// has props
	if (props !== objEmpty) {		
		// refs
		if (props.ref !== void 0) {
			refs(props.ref, component, element);
		}

		// props and events
		assignProps(element, props, false, component);
	}

	// cache DOM reference
	return vnode.DOMNode = subject.DOMNode = element;
}

