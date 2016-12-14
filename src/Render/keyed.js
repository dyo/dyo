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
function keyed (newKeys, oldKeys, parentNode, oldNode, newChildren, oldChildren, newLength, oldLength) {
	var reconciledChildren = new Array(newLength);
	var deleteCount = 0;

	for (var i = 0; i < newLength || i < oldLength; i++) {
		var newChild = newChildren[i] || nodeEmpty;
		var oldChild = oldChildren[i] || nodeEmpty;
		var newKey   = newChild.props.key;
		var oldKey   = oldChild.props.key;

		// new and old keys match, no-op
		if (newKey === oldKey) {
			reconciledChildren[i-deleteCount] = oldChild;
		}
		// new and old keys don't match 
		else {
			var movedChild = oldKeys[newKey];

			// new key exists in old keys
			if (movedChild) {	
				var idx = movedChild._index;

				// but the index does not match,
				if (i !== idx) {
					// move
					reconciledChildren[idx] = oldChild;
					parentNode.insertBefore(movedChild._node, parentNode.childNodes[i+1]);
				}
			}
			// old key does not exist
			else if (oldChild.nodeType === 0) {
				// insert
				reconciledChildren[i-deleteCount] = newChild;

				insertNode(
					newChild, 
					oldChildren[i+1], 
					parentNode, 
					createNode(newChild, null, null)
				);
			}
			// new key does not exist
			else if (newChild.nodeType === 0) {
				// remove
				removeNode(oldChild, parentNode);
				deleteCount++;
			}
			// new key and old key exists 
			// but new key is not in old keys
			else {
				// replace
				reconciledChildren[i-deleteCount] = newChild;
				replaceNode(newChild, oldChild, parentNode, createNode(newChild, null, null));
			}
		}
	}

	// replace old children with reconciled children
	oldNode.children = reconciledChildren;
}