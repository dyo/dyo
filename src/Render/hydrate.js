/**
 * hydrates a server-side rendered dom structure
 * 
 * @param  {Node}       parent
 * @param  {VNode}      subject
 * @param  {number}     index
 * @param  {VNode}      parentNode
 * @param  {?Component} component
 */
function hydrate (parent, subject, index, parentNode, component) {
	var newNode  = subject.nodeType === 2 ? extractComponent(subject) : subject;
	var nodeType = newNode.nodeType;

	var element = nodeType === 11 ? parent : parent.childNodes[index];

	// if the node is not a textNode and
	// has children hydrate each of its children
	if (nodeType === 1) {
		var props       = newNode.props;
		var newChildren = newNode.children;
		var newLength   = newChildren.length;

		// vnode has component attachment
		if (subject.instance !== null) {
			(component = subject.instance).VNode.DOMNode = parent;
		}

		// hydrate children
		for (var i = 0; i < newLength; i++) {
			hydrate(element, newChildren[i], i, newNode, component);
		}

		// not a fragment
		if (nodeType !== 11) {
			if (props !== objEmpty) {
				// refs
				props.ref && refs(props.ref, component, element);

				// assign events
				assignProps(element, props, true, component);
			}
		}

		// hydrate the dom element to the virtual element
		subject.DOMNode = element;
	}
	else if (nodeType === 3) {
		var children = parentNode.children;
		var length   = children.length;

		// when we reach a string child that is followed by a string child, 
		// it is assumed that the dom representing it is a single textNode,
		if (length > 1 && (children[index+1] || nodEmpty).nodeType === 3) {
			// case in point h('h1', 'Hello', 'World') output: <h1>HelloWorld</h1>
			// HelloWorld is one textNode in the DOM but two in the VNode
			var fragment = document.createDocumentFragment();
			
			// look ahead of this nodes siblings and add all textNodes to the the fragment.
			// exit when a non text node is encounted
			for (var i = index, len = length - index; i < len; i++) {
				var textNode = children[i];

				// exit early once we encounter a non text/string node
				if (textNode.nodeType !== 3) {
					break;
				}

				// create textnode, append to the fragment
				fragment.appendChild(textNode.DOMNode = document.createTextNode(textNode.children));
			}

			// replace the textNode with a set of textNodes
			parent.replaceChild(fragment, element);
		} else {
			newNode.DOMNode = element;
		}
	}
}

