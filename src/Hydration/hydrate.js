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

	// newNode is not a textNode, hydrate its children
	if (nodeType !== 3) {
		var props    = newNode.props;
		var children = newNode.children;
		var length   = children.length;

		// vnode has component attachment
		if (subject.instance !== null) {
			(component = subject.instance).VNode.DOMNode = parent;
		}

		// hydrate children
		for (var i = 0; i < length; i++) {
			var newChild = children[i];

			// hoisted, clone VNode
			if (newChild.DOMNode !== null) {
				newChild = children[i] = cloneNode(newChild);
			}

			hydrate(element, newChild, i, newNode, component);
		}


		// not a fragment, fragments do not use props
		if (nodeType !== 11) {
			// not an emtpy object
			if (props !== objEmpty) {
				// refs
				if (props.ref !== void 0) {
					refs(props.ref, component, element);
				}

				// events
				assignProps(element, props, true, component);
			}
		}

		// hydrate the dom element to the virtual node
		subject.DOMNode = element;
	}
	// textNode
	else if (nodeType === 3) {
		var children = parentNode.children;
		var length   = children.length;

		// when we reach a string child that is followed by a string child, 
		// it is assumed that the dom representing it is a single textNode
		// case in point h('h1', 'Hello', 'World') output: <h1>HelloWorld</h1>
		// HelloWorld is one textNode in the DOM but two in the VNode
		if (length > 1 && (children[index+1] || nodEmpty).nodeType === 3) {			
			var fragment = document.createDocumentFragment();
			
			// look ahead of this nodes siblings and add all textNodes to the fragment
			// and exit when a non-textNode is encounted
			for (var i = index, len = length - index; i < len; i++) {
				var textNode = children[i];

				// exit early once we encounter a non textNode
				if (textNode.nodeType !== 3) {
					break;
				}

				// create textNode, hydrate and append to fragment
				fragment.appendChild(textNode.DOMNode = document.createTextNode(textNode.children));
			}

			// replace the textNode with a set of textNodes
			parent.replaceChild(fragment, element);
		}
		else {
			// hydrate single textNode
			newNode.DOMNode = element;
		}
	}
}

