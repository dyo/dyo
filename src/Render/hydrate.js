/**
 * hydrates a server-side rendered dom structure
 * 
 * @param  {Node}    element
 * @param  {Object}  newNode
 * @param  {number}  index
 * @param  {Object}  parentNode
 */
function hydrate (element, newNode, index, parentNode) {
	var currentNode = newNode.nodeType === 2 ? extractComponent(newNode) : newNode;
	var nodeType = currentNode.nodeType;

	// is a fragment if `newNode` is not a text node and type is fragment signature '@'
	var isFragmentNode = nodeType === 11 ? 1 : 0;
	var newElement = isFragmentNode === 1 ? element : element.childNodes[index];

	// if the node is not a textNode and
	// has children hydrate each of its children
	if (nodeType === 1) {
		var newChildren = currentNode.children;
		var newLength = newChildren.length;

		for (var i = 0; i < newLength; i++) {
			hydrate(newElement, newChildren[i], i, currentNode);
		}

		// hydrate the dom element to the virtual element
		currentNode._node = newElement;

		// exit early if fragment
		if (isFragmentNode === 1) { 
			return; 
		}

		// add events if any
		assignProps(newElement, currentNode.props, true);

		// assign refs
		if (currentNode.props.ref !== void 0 && currentNode._owner !== void 0) {
			extractRefs(newElement, currentNode.props.ref, currentNode._owner);
		}
	}
	/*
		when we reach a string child, it is assumed that the dom representing it is a single textNode,
		we do a look ahead of the child, create & append each textNode child to documentFragment 
		starting from current child till we reach a non textNode such that on h('p', 'foo', 'bar') 
		foo and bar are two different textNodes in the fragment, we then replace the 
		single dom's textNode with the fragment converting the dom's single textNode to multiple
	 */
	else if (nodeType === 3) {
		// fragment to use to replace a single textNode with multiple text nodes
		// case in point h('h1', 'Hello', 'World') output: <h1>HelloWorld</h1>
		// but HelloWorld is one text node in the dom while two in the vnode
		var fragment = document.createDocumentFragment();
		var children = parentNode.children;

		// look ahead of this nodes siblings and add all textNodes to the the fragment.
		// exit when a non text node is encounted
		for (var i = index, length = children.length - index; i < length; i++) {
			var textNode = children[i];

			// exit early once we encounter a non text/string node
			if (textNode.nodeType !== 3) {
				break;
			}

			// create textnode, append to the fragment
			fragment.appendChild(textNode._node = document.createTextNode(textNode.children || ''));
		}

		// replace the textNode with a set of textNodes
		element.replaceChild(fragment, element.childNodes[index]);
	}
}

