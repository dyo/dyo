/**
 * patch keyed nodes
 *
 * @param {Object}  newKeys
 * @param {Object}  oldKeys
 * @param {VNode}   oldNode
 * @param {Node}    parentNode
 * @param {VNode[]} newChildren
 * @param {VNode[]} oldChildren
 * @param {number}  newLength
 * @param {number}  oldLength
 */

var index = 0;

function keyed (newKeys, oldKeys, parentNode, oldNode, newChildren, oldChildren, newLength, oldLength) {
	var reconciled = new Array(newLength);

	for (var i = 0; i < oldChildren.length; i++) {
		var oldChild = oldChildren[i];
		var oldKey   = oldChild.props.key;
		var newChild = newKeys[oldKey];

		if (newChild) {
			var index = newChild._index;

			// moved
			if (index !== i) {
				parentNode.insertBefore(oldChild._node, parentNode.children[index+1]);
			}

			reconciled[index] = oldChild; 
		} else {
			// removed
			parentNode.removeChild(oldChild._node);
		}
	}

	for (var i = 0; i < newChildren.length; i++) {
		var newChild = newChildren[i];
		var newKey   = newChild.props.key;
		var oldChild = oldKeys[newKey];

		if (oldChild) {
			reconciled[i] = oldChild;			
		} else {
			// added
			reconciled[i] = newChild;
			parentNode.insertBefore(createNode(newChild, null, null), parentNode.children[i]);
		}		
	}

	console.log(reconciled);
	oldNode.children = reconciled;

	// throw '';


	// var reconciledChildren = new Array(newLength);
	// var deleteCount        = 0;

	// for (var i = 0; i < newLength || i < oldLength; i++) {
	// 	var newChild = newChildren[i] || nodEmpty;
	// 	var oldChild = oldChildren[i] || nodEmpty;
	// 	var newKey   = newChild.props.key;
	// 	var oldKey   = oldChild.props.key;

	// 	// new and old keys match, no-op
	// 	if (newKey === oldKey) {
	// 		reconciledChildren[i-deleteCount] = oldChild;
	// 	}
	// 	// new and old keys don't match 
	// 	else {
	// 		var movedChild = oldKeys[newKey];

	// 		// new key exists in old keys
	// 		if (movedChild) {
	// 			var idx = movedChild._index;

	// 			// but the index does not match,
	// 			if (i !== idx) {
	// 				// move
	// 				reconciledChildren[idx] = oldChild;

	// 				parentNode.insertBefore(
	// 					oldChild._node = parentNode.children[idx],
	// 					parentNode.children[i+1]
	// 				);
	// 			}
	// 		}
	// 		// old key does not exist
	// 		else if (oldChild.nodeType === 0) {
	// 			// insert
	// 			reconciledChildren[i-deleteCount] = newChild;

	// 			insertNode(
	// 				newChild, 
	// 				oldChildren[i+1], 
	// 				parentNode, 
	// 				createNode(newChild, null, null)
	// 			);
	// 		}
	// 		// new key does not exist
	// 		else if (newChild.nodeType === 0) {
	// 			console.log(i);
	// 			// remove
	// 			removeNode(oldChild, parentNode);
	// 			deleteCount++;
	// 		}
	// 		// new key and old key exists 
	// 		// but new key is not in old keys
	// 		else {
	// 			// replace
	// 			reconciledChildren[i-deleteCount] = newChild;
	// 			replaceNode(newChild, oldChild, parentNode, createNode(newChild, null, null));
	// 		}
	// 	}
	// }

	// replace old children with reconciled children
	// oldNode.children = reconciledChildren;
}