/**
 * patch keyed nodes
 *
 * @param {Object}  newKeys
 * @param {Object}  oldKeys
 * @param {Node}    parentNode
 * @param {VNode}   oldNode
 * @param {VNode[]} newChildren
 * @param {VNode[]} oldChildren
 * @param {number}  newLength
 * @param {number}  oldLength
 */
function keyed (newKeys, oldKeys, parentNode, oldNode, newChildren, oldChildren, newLength, oldLength) {
	var reconciled = new Array(newLength);
	var children   = parentNode.children;
	var length     = children.length;
	var delOffset  = 0;
	var addOffset  = 0;

	for (var i = 0; i < oldLength; i++) {
		var oldChild = oldChildren[i];
		var oldKey   = oldChild.props.key;
		var newChild = newKeys[oldKey];

		// removed
		if (newChild === void 0) {
			delOffset++;

			removeNode(oldChild, parentNode);
		}

		// update old indexes
		if (delOffset !== 0) {
			oldChild.index -= delOffset;
		}
	}

	// update length
	length -= delOffset;

	for (var j = 0; j < newLength; j++) {
		var newChild = newChildren[j];
		var newKey   = newChild.props.key;
		var oldChild = oldKeys[newKey];

		// exists
		if (oldChild) {
			var index = oldChild.index;

			// moved
			if (index+addOffset !== j) {
				parentNode.insertBefore(oldChild.DOMNode, children[j]);
			}

			reconciled[j] = oldChild; 	
		} else {
			reconciled[j] = newChild;

			addOffset++;

			if (j < length) {
				// insert
				insertNode(newChild, children[j], parentNode, createNode(newChild, null, null));
			} else {
				// append
				appendNode(newChild, parentNode, createNode(newChild, null, null));
			}

			length++;
		}		
	}

	oldNode.children = reconciled;
}