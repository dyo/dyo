/**
 * patch nodes
 *  
 * @param  {VNode}   newNode  
 * @param  {VNode}   oldNode 
 * @param  {number}  newNodeType 
 * @param  {number}  oldNodeType
 */
function patch (newNode, oldNode, newNodeType, oldNodeType) {
	// if currentNode and oldNode are the identical, exit early
	if (newNode === oldNode) {
		return;
	}

	// extract node from possible component node
	var currentNode = newNodeType === 2 ? extractComponent(newNode) : newNode;

	// a component
	if (oldNodeType === 2) {
		var oldComponent = oldNode.instance;
		var newComponent = newNode.instance;

		var newProps = newComponent.props;
		var newState = newComponent.state;

		// component with shouldComponentUpdate
		if (
			oldComponent.shouldComponentUpdate && 
			oldComponent.shouldComponentUpdate(newProps, newState) === false
		) {
			// exit early
			return;
		}

		// component with componentWillUpdate
		if (oldComponent.componentWillUpdate) {
			oldComponent.componentWillUpdate(newProps, newState);
		}
	}

	// references, children & children length
	var newChildren = currentNode.children;
	var oldChildren = oldNode.children;
	var newLength   = newChildren.length;
	var oldLength   = oldChildren.length;

	// new children length is 0 clear/remove all children
	if (newLength === 0) {
		// but only if old children is not already cleared
		if (oldLength !== 0) {
			oldNode.DOMNode.textContent = '';
			oldNode.children = newChildren;
		}
	} else {
		// new node has children
		var parentNode = oldNode.DOMNode;

		var hasKeys = false;
		var diffKeys = false;
		
		var oldKeys;
		var newKeys;

		// for loop, the end point being which ever is the 
		// greater value between newLength and oldLength
		for (var i = 0; i < newLength || i < oldLength; i++) {
			var newChild = newChildren[i] || nodEmpty;
			var oldChild = oldChildren[i] || nodEmpty;

			var newChildType = newChild.nodeType;
			var oldChildType = oldChild.nodeType;

			var action = 0;

			// remove
			if (newChildType === 0) {
				action = 1;
			}
			// add
			else if (oldChildType === 0) {
				action = 2;
			}
			// text
			else if (newChildType === 3 && oldChildType === 3) {
				if (newChild.children !== oldChild.children) {
					action = 3;
				}
			}
			// keys
			else if (newChild.props.key !== void 0 || oldChild.props.key !== void 0) {
				action = 4;
			}
			// replace
			else if (newChild.type !== oldChild.type) {
				action = 5;
			}
			// noop
			else {
				patch(newChild, oldChild, newChildType, oldChildType);
			}

			// patch
			if (action !== 0) {
				if (diffKeys) {
					action = 4;
				}

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
						appendNode(oldChildren[oldChildren.length] = newChild, parentNode, createNode(newChild, null, null));
						break;
					}
					// text operation
					case 3: {
						// replace dom node text, replace old child text
						oldChild.DOMNode.nodeValue = oldChild.children = newChild.children;
						break;
					}
					// keyed operation
					case 4: {
						var newKey = newChild.props.key;
						var oldKey = oldChild.props.key;

						// initialize key hash maps
						if (hasKeys === false) {
							hasKeys = true;
							oldKeys = {};
							newKeys = {};
						}

						// register to patch keys if a mis-match is found
						if (newKey !== oldKey) {
							if (diffKeys === false) {
								diffKeys = true;
							}
						} else {
							patch(newChild, oldChild, newChildType, oldNodeType);
						}

						// register key
						newKeys[newKey] = (newChild.index = i, newChild);
						oldKeys[oldKey] = (oldChild.index = i, oldChild);
						break;
					}
					// replace operation
					case 5: {
						// replace dom node, replace old child
						replaceNode(oldChildren[i] = newChild, oldChild, parentNode, createNode(newChild, null, null));
						break;
					}
				}
			}
		}
	}

	// reconcile keyed children
	if (diffKeys) {
		// offloaded to another function to keep the type feedback 
		// of this function to a minimum when non-keyed
		keyed(
			newKeys, 
			oldKeys, 
			parentNode, 
			newNode,
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

	// component with componentDidUpdate
	if (oldNodeType === 2 && oldComponent.componentDidUpdate) {
		oldComponent.componentDidUpdate(newProps, newState);
	}
}

