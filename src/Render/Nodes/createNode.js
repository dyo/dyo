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
	
	// textNode	
	if (nodeType === 3) {
		return subject.DOMNode = document.createTextNode(subject.children);
	}

	// hoisted, clone DOMNode, second check ensures fragments are not cloned
	if (subject.DOMNode !== null && subject.DOMNode.isFragment !== true) {
		return subject.DOMNode = subject.DOMNode.cloneNode(true);
	}

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

			// accessing any dom property i.e nodeType to check if a node is a fragment
			// is slower ~(50mil vs 800mil) than accessing a non-existent or added property
			element.isFragment = true;
		}
	}

	// has a component instance
	if (subject.instance !== null) {
		// hydrate component instance, 
		// this travels through the tree until we find another component to hydrate
		// which allows use to call ref functions under the context of the component they are within
		// and assign string refs to their parent components
		(component = subject.instance).VNode.DOMNode = element;

		// stylesheets
		if (component.stylesheet !== void 0 && nodeType !== 11) {
			if (component.stylesheet.CSSNamespace === void 0) {
				// create
				stylesheet(component, subject.type.COMPCache || subject.type, true)(element);
			} else {
				// namespace
				component.stylesheet(element);
			}
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
			appendNode(newChild, element, createNode(newChild, component, namespace));					
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
	return subject.DOMNode = element;
}

