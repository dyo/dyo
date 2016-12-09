/**
 * patch
 *  
 * @param {Object} newNode  
 * @param {Object} oldNode  
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
	else if (newNode.props.key !== oldNode.props.key) {
		return 5; 
	}
	// replace operation
	else if (newNode.type !== oldNode.type) {
		return 4;
	}
	// recursive
	else {		
		// if _newNode and oldNode are the identical, exit early
		if (newNode !== oldNode) {		
			// extract node from possible component node
			var _newNode = newNodeType === 2 ? extractComponent(newNode) : newNode;

			// component will update
			if (oldNodeType === 2) {
				var component = oldNode._owner;

				if (
					component.shouldComponentUpdate && 
					component.shouldComponentUpdate(newNode.props, newNode._owner.state) === false
				) {
					return 0;
				}

				if (component.componentWillUpdate) {
					component.componentWillUpdate(newNode.props, newNode._owner.state);
				}
			}

			// patch props only if oldNode is not a textNode 
			// and the props objects of the two noeds are not equal
			if (_newNode.props !== oldNode.props) {
				patchProps(_newNode, oldNode); 
			}

			// references, children & children length
			var newChildren = _newNode.children;
			var oldChildren = oldNode.children;
			var newLength   = newChildren.length;
			var oldLength   = oldChildren.length;

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
				var isKeyed    = false;
				var oldKeys    = null;

				// for loop, the end point being which ever is the 
				// greater value between newLength and oldLength
				for (var i = 0; i < newLength || i < oldLength; i++) {

					var newChild = newChildren[i] || nodeEmpty;
					var oldChild = oldChildren[i] || nodeEmpty;
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
								// create padding
								if (oldLength > newLength) {
									// initialize keyed operations
									if (isKeyed === false) { 
										isKeyed = true;
										oldKeys = {}; 
									}

									// create key/node map
									oldKeys[oldChild.props.key] = [oldChild, i];

									// normalize old array, remove old child
									oldChildren.splice(i, 1);

									// remove dom node
									removeNode(oldChild, parentNode);

									// normalize old length
									oldLength--;
								}
								else {								
									var newKey;
									var moved = oldKeys !== null && oldKeys[newKey = newChild.props.key] !== void 0;

									if (newLength > oldLength) {
										// moved dom node
										if (moved) {
											var oldKeyed = oldKeys[newKey];

											// normalize old array, insert child at right index
											oldChildren.splice(i, 0, oldKeyed[0]);

											// place dom node back at the right index
											moveNode(oldChild, parentNode, oldKeyed[0]);
										} else {
											// normalize old array, insert new child
											i === 0 ? oldChildren.unshift(newChild) : oldChildren.splice(i, 0, newChild);

											// insert dom node
											insertNode(newChild, oldChild, parentNode, createNode(newChild, null, null));
										}

										// normalize old length
										oldLength++;
									} else {
										// moved dom node
										if (moved) {
											var oldKeyed = oldKeys[newKey];

											// normalize old array, move old child
											oldChildren.splice(i, 0, oldChildren.splice(oldKeyed[1], 1)[0]);

											// move dom node
											moveNode(oldChildren[i+1], parentNode, oldKeyed[0]);
										} else {
											// replace dom node, replace old child
											replaceNode(
												oldChildren[i] = newChild, 
												oldChild, 
												parentNode, 
												createNode(newChild, null, null)
											);
										}
									}
								}

								break;
							}
						}
					}
				}
			}

			// component did update
			if (oldNodeType === 2 && component.componentDidUpdate) {
				component.componentDidUpdate(newNode.props, newNode._owner.state);
			}
		}
	}

	return 0;
}

