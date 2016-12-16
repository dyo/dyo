/**
 * patch nodes
 *  
 * @param  {VNode}  newNode  
 * @param  {VNode}  oldNode  
 * @return {number} number
 */
function patch (newNode, oldNode) {
	var newNodeType = newNode.nodeType;
	var oldNodeType = oldNode.nodeType;

	// remove operation
	if (newNodeType === 0) { 
		return 1; 
	}
	// add operation
	else if (oldNodeType === 0) { 
		return 2;
	}
	// text operation
	else if (newNodeType === 3 && oldNodeType === 3) { 
		if (newNode.children !== oldNode.children) {
			return 3; 
		} 
	}
	// key operation
	// else if (newNode.props.key !== oldNode.props.key) {
	// 	return 5; 
	// }
	else if (newNode.props.key !== void 0 || oldNode.props.key !== void 0) {
		return 5; 
	}
	// replace operation
	else if (newNode.type !== oldNode.type) {
		return 4;
	}
	// recursive
	else {
		// if currentNode and oldNode are the identical, exit early
		if (newNode !== oldNode) {		
			// extract node from possible component node
			var currentNode = newNodeType === 2 ? extractComponent(newNode) : newNode;

			// a component
			if (oldNodeType === 2) {
				var oldComponent = oldNode._owner;
				var newComponent = newNode._owner;

				// a component with shouldComponentUpdate method
				if (
					oldComponent.shouldComponentUpdate && 
					oldComponent.shouldComponentUpdate(newNode.props, newComponent.state) === false
				) {
					// exit early
					return 0;
				}

				// a component with a componentWillUpdate method
				if (oldComponent.componentWillUpdate) {
					oldComponent.componentWillUpdate(newNode.props, newComponent.state);
				}
			}

			// references, children & children length
			var newChildren = currentNode.children;
			var oldChildren = oldNode.children;
			var newLength   = newChildren.length;
			var oldLength   = oldChildren.length;
			var _newChildren = [].slice.call(newChildren);

			// new children length is 0 clear/remove all children
			if (newLength === 0) {
				// but only if old children is not already cleared
				if (oldLength !== 0) {
					oldNode._node.textContent = '';
					oldNode.children = newChildren;
				}	
			}
			// newNode has children
			else {
				var parentNode = oldNode._node;
				var isKeyed = false;
				var oldKeys;
				var newKeys;

				// for loop, the end point being which ever is the 
				// greater value between newLength and oldLength
				for (var i = 0; i < newLength || i < oldLength; i++) {
					var newChild = newChildren[i] || nodEmpty;
					var oldChild = oldChildren[i] || nodEmpty;
					var action   = patch(newChild, oldChild);

					// if action dispatched, 
					// 1 - remove, 2 - add, 3 - text update, 4 - replace, 5 - key
					if (action !== 0) {
						switch (action) {
							// remove operation
							case 1: {
								// remove dom node, remove old child
								removeNode(oldChildren.pop(), parentNode);

								break;
							}
							// add operation
							case 2: {
								// append dom node, push new child
								appendNode(
									oldChildren[oldChildren.length] = newChild, 
									parentNode, 
									createNode(newChild, null, null)
								);

								break;
							}
							// text operation
							case 3: {
								// replace dom node text, replace old child text
								oldChild._node.nodeValue = oldChild.children = newChild.children;

								break;
							}
							// replace operation
							case 4: {
								// replace dom node, replace old child
								replaceNode(
									oldChildren[i] = newChild, 
									oldChild, 
									parentNode, 
									createNode(newChild, null, null)
								);

								break;
							}
							// keyed operation
							case 5: {
								// register keyed children
								if (isKeyed === false) {
									isKeyed = true;
									oldKeys = {};
									newKeys = {};
								}

								// var newKey = newChild.props.key;
								// var oldKey = oldChild.props.key;

								// register key
								newKeys[newChild.props.key] = (newChild._index = i, newChild);
								oldKeys[oldChild.props.key] = (oldChild._index = i, oldChild);

								// padding
								// if (newChildren.length > oldChildren.length) {
								// 	oldChildren.splice(i, 0, nodEmpty);
								// } else if (oldChildren.length > newChildren.length) {
								// 	newChildren.splice(i, 0, nodEmpty);
								// }

								break;
							}
						}
					}
				}
			}

			// reconcile keyed children
			if (isKeyed === true) {
				// offloaded to another function to keep the type feedback 
				// of this function to a minimum when non-keyed
				keyed(
					newKeys, 
					oldKeys, 
					parentNode, 
					oldNode, 
					newChildren, 
					oldChildren, 
					newLength, 
					oldLength
				);
			}

			// patch props only if oldNode is not a textNode 
			// and the props objects of the two nodes are not equal
			if (currentNode.props !== oldNode.props) {
				patchProps(currentNode, oldNode); 
			}

			// a component with a componentDidUpdate method
			if (oldNodeType === 2 && oldComponent.componentDidUpdate) {
				oldComponent.componentDidUpdate(newNode.props, newComponent.state);
			}
		}
	}

	return 0;
}

