/**
 * patch nodes
 *  
 * @param  {VNode}   newNode  
 * @param  {VNode}   oldNode 
 * @param  {number}  newNodeType 
 * @param  {number}  oldNodeType
 */
function patchNodes (newNode, oldNode, newNodeType, oldNodeType) {
	// if newNode and oldNode are the identical, exit early
	if (newNode === oldNode) {
		return;
	}

	// extract node from possible component node
	var currentNode = newNodeType === 2 ? extractComponent(newNode) : newNode;

	// a component
	if (oldNodeType === 2) {
		// retrieve components
		var oldComp = oldNode.instance;
		var newComp = newNode.instance;

		// retrieve props
		var newProps = newComp.props;
		var newState = newComp.state;

		// component with shouldComponentUpdate
		if (oldComp.shouldComponentUpdate !== void 0 && 
			oldComp.shouldComponentUpdate(newProps, newState) === false) {
			// exit early
			return;
		}

		// component with componentWillUpdate
		if (oldComp.componentWillUpdate !== void 0) {
			oldComp.componentWillUpdate(newProps, newState);
		}
	}

	// children
	var newChildren = currentNode.children;
	var oldChildren = oldNode.children;

	// children length
	var newLength = newChildren.length;
	var oldLength = oldChildren.length;

	// new children length is 0, remove all children
	if (newLength === 0) {
		// but only if old children is not already cleared
		if (oldLength !== 0) {
			oldNode.DOMNode.textContent = '';
			oldNode.children = newChildren;
		}
	} else {
		// new node has children
		var parentNode = oldNode.DOMNode;

		// when keyed, the position that dirty keys begin
		var pos = 0;

		// non-keyed until the first dirty key is found
		var keyed = false;

		// un-initialized key hash maps
		var oldKeys;
		var newKeys;

		// the highest point of interest
		var length = newLength > oldLength ? newLength : oldLength;

		// for loop, the end point being which ever is the 
		// greater value between new length and old length
		for (var i = 0; i < length; i++) {
			var newChild = newChildren[i] || nodEmpty;
			var oldChild = oldChildren[i] || nodEmpty;

			var newType = newChild.nodeType;
			var oldType = oldChild.nodeType;

			if (keyed) {
				// push keys
				if (newType !== 0) newKeys[newChild.props.key] = (newChild.index = i, newChild);
				if (oldType !== 0) oldKeys[oldChild.props.key] = (oldChild.index = i, oldChild);
			}
			// remove
			else if (newType === 0) {
				removeNode(oldChildren.pop(), parentNode);
			}
			// add
			else if (oldType === 0) {
				appendNode(oldChildren[oldChildren.length] = newChild, parentNode, createNode(newChild, null, null));
			}
			// text
			else if (newType === 3 && oldType === 3) {
				if (newChild.children !== oldChild.children) {
					oldChild.DOMNode.nodeValue = oldChild.children = newChild.children;
				}
			}
			// key
			else if (newChild.props.key !== oldChild.props.key) {
				keyed = true; 
				pos = i;
				oldKeys = {}; 
				newKeys = {}; 

				// push keys
				newKeys[newChild.props.key] = (newChild.index = i, newChild);
				oldKeys[oldChild.props.key] = (oldChild.index = i, oldChild);
			}
			// replace
			else if (newChild.type !== oldChild.type) {
				replaceNode(oldChildren[i] = newChild, oldChild, parentNode, createNode(newChild, null, null));
			}
			// noop
			else {
				patchNodes(newChild, oldChild, newType, oldType);
			}
		}

		// reconcile keyed children
		if (keyed) {
			patchKeys([newKeys, oldKeys], parentNode, newNode, oldNode, newLength, oldLength, pos);
		}
	}

	// props objects of the two nodes are not equal, patch
	if (currentNode.props !== oldNode.props) {
		patchProps(currentNode, oldNode);
	}

	// component with componentDidUpdate
	if (oldNodeType === 2 && oldComp.componentDidUpdate !== void 0) {
		oldComp.componentDidUpdate(newProps, newState);
	}
}

