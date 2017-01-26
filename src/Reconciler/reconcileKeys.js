/**
 * reconcile keyed nodes
 *
 * @param {Object<string, any>[2]} keys
 * @param {Node}                   parentNode
 * @param {VNode}                  newNode
 * @param {VNode}                  oldNode
 * @param {number}                 newLength
 * @param {number}                 oldLength
 * @param {number}                 pos
 */
function reconcileKeys (keys, parentNode, newNode, oldNode, newLength, oldLength, pos) {
	var reconciled = new Array(newLength);
	var childNodes = parentNode.childNodes;

	// children
	var newChildren = newNode.children;
	var oldChildren = oldNode.children;

	// keys
	var newKeys = keys[0];
	var oldKeys = keys[1];

	// position
	var inserted = 0;
	var added = 0;
	var removed = 0;
	var i = 0;
	var index = 0;

	// VNodes
	var newChild;
	var oldChild;

	// DOMNodes
	var nextNode;
	var prevNode;

	// signatures
	var nodeType;

	// hydrate clean nodes
	if (pos !== 0) {
		for (var i = 0; i < pos; i++) {
			reconciled[i] = oldChildren[i];
		}
	}

	// old children
	for (var i = pos; i < oldLength; i++) {
		oldChild = oldChildren[i];
		newChild = newKeys[oldChild.key];

		// removed
		if (newChild === void 0) {
			removeNode(oldChild.Type, oldChild, parentNode);
			removed++;
		}

		// update forward indexes
		if (removed !== 0) {
			oldChild.index -= removed;
		}
	}

	oldLength -= removed;

	// new children
	for (var i = pos; i < newLength; i++) {
		newChild = newChildren[i];
		oldChild = oldKeys[newChild.key];

		// new
		if (oldChild === void 0) {
			nodeType = newChild.Type;
			nextNode = createNode(newChild, null, null);

			// insert
			if (i < oldLength + added) {
				oldChild = oldChildren[i - added];
				prevNode = oldChild.DOMNode;

				insertNode(nodeType, newChild, prevNode, parentNode, nextNode);

				// update forward indexes
				oldChild.index += ++inserted;
			} 
			// append
			else {
				appendNode(nodeType, newChild, parentNode, nextNode);
			}

			added++;

			reconciled[i] = newChild;
		}
		// old
		else {
			index = oldChild.index;

			// moved
			if (index !== i) {
				if (newChild.key !== oldChildren[i - added].key) {
					prevNode = childNodes[i];
					nextNode = oldChild.DOMNode;

					if (prevNode !== nextNode) {
						parentNode.insertBefore(nextNode, prevNode);
					}
				}
			}

			reconciled[i] = oldChild;
		}
	}

	oldNode.children = reconciled;
}
