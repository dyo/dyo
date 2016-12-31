/**
 * patch keyed nodes
 *
 * @param {Object<string, any>[2]} keys
 * @param {Node}                   parentNode
 * @param {VNode}                  newNode
 * @param {VNode}                  oldNode
 * @param {number}                 newLength
 * @param {number}                 oldLength
 * @param {number}                 pos
 */
function patchKeys (keys, parentNode, newNode, oldNode, newLength, oldLength, pos) {
	var reconciled = new Array(newLen);
	var childNodes = parentNode.childNodes;

	// children
	var newChildren = newNode.children;
	var oldChildren = oldNode.children;

	var length = oldChildren.length;

	// keys
	var newKeys = keys[0];
	var oldKeys = keys[1];

	// book keeping
	var delOffset = 0;
	var addOffset = 0;

	// hydrate clean nodes
	if (pos !== 0) {
		for (var i = 0; i < pos; i++) {
			reconciled[i] = oldChildren[i];
		}
	}

	// old children
	for (var i = pos; i < oldLen; i++) {
		var oldChild = oldChildren[i];
		var newChild = newKeys[oldChild.props.key];

		// removed
		if (newChild === void 0) {
			// book keeping
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

	// new children
	for (var i = pos; i < newLen; i++) {
		var newChild = newChildren[i];
		var oldChild = oldKeys[newChild.props.key];

		// exists
		if (oldChild !== void 0) {
			var index = oldChild.index;

			// moved
			if (index+addOffset !== i) {
				parentNode.insertBefore(childNodes[index], childNodes[i]);
			}

			// assign clean node
			reconciled[i] = oldChild;
		} else {
			if (i < length) {
				// insert
				insertNode(newChild, childNodes[i], parentNode, createNode(newChild, null, null));
			} else {
				// append
				appendNode(newChild, parentNode, createNode(newChild, null, null));
			}

			// book keeping
			addOffset++; 
			length++;

			// assign clean node
			reconciled[i] = newChild;
		}	
	}

	// replace dirty children
	oldNode.children = reconciled;
}

