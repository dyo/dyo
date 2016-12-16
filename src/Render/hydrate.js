/**
 * hydrates a server-side rendered dom structure
 * 
 * @param  {Node}       parent
 * @param  {VNode}      subject
 * @param  {number}     index
 * @param  {VNode}      parentNode
 * @param  {?Component}
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
		if (subject._owner !== null) {
			(component = subject._owner)._vnode._node = parent;
		}

		// async hydration
		for (var i = 0; i < newLength; i++) {
			setTimeout(hydrate, 0, element, newChildren[i], i, newNode, component);
		}

		// not a fragment
		if (nodeType !== 11) {
			if (props !== objEmpty) {
				// refs
				if (props.ref) {
					props.ref.call(component, element);
				}

				// assign events
				assignProps(element, props, true, newNode._owner || null);
			}
		}

		// hydrate the dom element to the virtual element
		subject._node = element;
	}
	else if (nodeType === 3) {
		var children = parentNode.children;
		var length   = children.length;
		var next     = children[index+1] || nodEmpty;

		/*
			when we reach a string child that is followed by a string child, 
			it is assumed that the dom representing it is a single textNode,
			we do a look ahead of the child, create & append each textNode child to documentFragment 
			starting from current child till we reach a non textNode such that on h('p', 'foo', 'bar') 
			foo and bar are two different textNodes in the fragment, we then replace the 
			single dom's textNode with the fragment converting the dom's single textNode to multiple
		 */
		if (length > 1 && next.nodeType === 3) {
			// fragment to use to replace a single textNode with multiple text nodes
			// case in point h('h1', 'Hello', 'World') output: <h1>HelloWorld</h1>
			// but HelloWorld is one text node in the dom while two in the vnode
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
				fragment.appendChild(textNode._node = document.createTextNode(textNode.children));
			}

			// replace the textNode with a set of textNodes
			parent.replaceChild(fragment, element);
		} else {
			newNode._node = element;
		}
	}
}

