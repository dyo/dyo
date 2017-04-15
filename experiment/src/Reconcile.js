/**
 * Patch Tree
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Number} group
 * @param {Tree} _ancestor
 */
function patch (older, _newer, group, _ancestor) {
	var ancestor = _ancestor;
	var newer = _newer;

	if (older.type !== newer.type) {
		return swap(older, newer, 1, ancestor);
	}

	if (group > 0) {
		if ((newer = shouldUpdate(older, newer, group, ancestor)) === void 0) {
			return;
		}
		// ancestor represents the last root component
		// we need to keep refererence of this to support
		// boundless events when creating new nodes
		if (group === 1) {
			ancestor = older;
		}
	}

	if (older.flag === 1) {
		return content(older, newer);
	}

	var newLength = newer.children.length;
	var oldLength = older.children.length;

	// populate children
	if (oldLength === 0) {
		return void newLength !== 0 ? populate(older, newer, ancestor) : 0;
	}
	// empty children
	if (newLength === 0) {
		return void oldLength !== 0 ? empty(older, newer, true) : 0;
	}

	if (older.keyed === true) {
		keyed(older, newer, ancestor, oldLength, newLength);
	} else {
		nonkeyed(older, newer, ancestor, oldLength, newLength);
	}

	attributes(older, newer, ancestor);
}

/**
 * Reconcile Non-Keyed Children
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Tree} ancestor
 * @param  {Number}
 * @param  {Number}
 */
function nonkeyed (older, newer, ancestor, _oldLength, _newLength) {
	var parent = older.node;
	var oldChildren = older.children;
	var newChildren = newer.children;
	var newLength = _oldLength;
	var oldLength = _newLength;
	var length = newLength > oldLength ? newLength : oldLength;
	var owner = ancestor.owner;

	// patch non-keyed children
	for (var i = 0, newChild, oldChild; i < length; i++) {
		if (i >= newLength) {
			remove(oldChild = oldChildren.pop(), parent, oldChild.node);
			oldLength--;
		} else if (i >= oldLength) {
			create(newChild = oldChildren[i] = newChildren[i], null, owner, parent, null, 1);
			oldLength++;
		} else {
			newChild = newChildren[i];
			oldChild = oldChildren[i];

			if (newChild.flag === 1 && oldChild.flag === 1) {
				content(oldChild, newChild);
			} else if (newChild.type !== oldChild.type) {
				replace(oldChild, oldChildren[i] = newChild, parent, ancestor, oldChild.node);
			} else {
				patch(oldChild, newChild, oldChild.group, ancestor);
			}
		}
	}
}

/**
 * Reconcile Keyed Children [Simple]
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Tree} ancestor
 * @param {Number} oldLength
 * @param {Number} newLength
 */
function keyed (older, newer, ancestor, oldLength, newLength) {
 	var parent = older.node;
 	var oldChildren = older.children;
 	var newChildren = newer.children;
 	var owner = ancestor.owner;
 	var oldStart = 0;
 	var newStart = 0;
 	var oldEnd = oldLength - 1;
 	var newEnd = newLength - 1;
 	var oldStartNode = oldChildren[oldStart];
 	var newStartNode = newChildren[newStart];
 	var oldEndNode = oldChildren[oldEnd];
 	var newEndNode = newChildren[newEnd];
 	var nextPos;
 	var nextNode;

 	// step 1, sync leading [a, b ...], trailing [... c, d], opposites [a, b] [b, a] recursively
 	outer: while (true) {
 		// sync leading nodes
 		while (oldStartNode.key === newStartNode.key) {
 			newChildren[newStart] = oldStartNode;

 			patch(oldStartNode, newStartNode, oldStartNode.group, ancestor);

 			oldStart++;
 			newStart++;

 			if (oldStart > oldEnd || newStart > newEnd) {
 				break outer;
 			}
 			oldStartNode = oldChildren[oldStart];
 			newStartNode = newChildren[newStart];
 		}
 		// sync trailing nodes
 		while (oldEndNode.key === newEndNode.key) {
 			newChildren[newEnd] = oldEndNode;

 			patch(oldEndNode, newEndNode, oldEndNode.group, ancestor);

 			oldEnd--;
 			newEnd--;

 			if (oldStart > oldEnd || newStart > newEnd) {
 				break outer;
 			}
 			oldEndNode = oldChildren[oldEnd];
 			newEndNode = newChildren[newEnd];
 		}
 		// move and sync nodes from right to left
 		if (oldEndNode.key === newStartNode.key) {
 			newChildren[newStart] = oldEndNode;
 			oldChildren[oldEnd] = oldStartNode;

 			patch(oldEndNode, newStartNode, oldEndNode.group, ancestor);
 			move(parent, oldEndNode, oldStartNode.node);

 			oldEnd--;
 			newStart++;

 			oldEndNode = oldChildren[oldEnd];
 			newStartNode = newChildren[newStart];
 			continue;
 		}
 		// move and sync nodes from left to right
 		if (oldStartNode.key === newEndNode.key) {
 			newChildren[newEnd] = oldStartNode;
 			oldChildren[oldStart] = oldEndNode;

 			nextPos = newEnd + 1;
 			nextNode = nextPos < newLength ? oldChildren[nextPos].node : null;

 			patch(oldStartNode, newEndNode, oldStartNode.group, ancestor);
 			move(parent, oldStartNode, nextNode);

 			oldStart++;
 			newEnd--;

 			oldStartNode = oldChildren[oldStart];
 			newEndNode = newChildren[newEnd];
 			continue;
 		}

 		break;
 	}
 	// step 2, remove or insert
 	if (oldStart > oldEnd) {
 		// old children is synced, insert the difference
 		if (newStart <= newEnd) {
 			nextPos = newEnd + 1;
 			nextNode = nextPos < newLength ? newChildren[nextPos].node : null;

 			do {
 				create(newStartNode = newChildren[newStart++], null, owner, parent, nextNode, 2);
 			} while (newStart <= newEnd);
 		}
 	} else if (newStart > newEnd) {
 		// new children is synced, remove the difference
 		do {
 			remove(oldStartNode = oldChildren[oldStart++], parent, oldStartNode.node);
 		} while (oldStart <= oldEnd);
 	} else {
 		// could not completely sync children, move on the the next phase
 		complex(older, newer, ancestor, oldStart, newStart, oldEnd+1, newEnd+1, oldLength, newLength);
 	}
 	older.children = newChildren;
}

/**
 * Reconcile Keyed Children [Complex]
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Tree} ancestor
 * @param {Number} oldStart
 * @param {Number} newStart
 * @param {Number} oldEnd
 * @param {Number} newEnd
 * @param {Number} oldLength
 * @param {number} newLength
 */
function complex (older, newer, ancestor, oldStart, newStart, oldEnd, newEnd, oldLength, newLength) {
	var parent = older.node;
	var oldChildren = older.children;
	var newChildren = newer.children;
	var owner = ancestor.owner;
	var oldOffset = oldEnd - oldStart;
	var newOffset = newEnd - newStart;
	var addOffset = 0;
	var oldIndex = oldStart;
	var newIndex = newStart;
	var oldKeys = {};
	var newKeys = {};
	var childNodes;
	var oldChild;
	var newChild;
	var nextNode;
	var nextPos;

	// step 1, build a map of keys
	while (true) {
		if (oldIndex !== oldEnd) {
			oldChild = oldChildren[oldIndex];
			oldChild.i = oldIndex++;
			oldKeys[oldChild.key] = oldChild;
		}
		if (newIndex !== newEnd) {
			newChild = newChildren[newIndex];
			newChild.i = newIndex++;
			newKeys[newChild.key] = newChild;
		}
		if (oldIndex === oldEnd && newIndex === newEnd) {
			oldIndex = oldStart;
			newIndex = newStart;
			break;
		}
	}

	// step 2, insert
	while (newIndex < newEnd) {
		newChild = newChildren[newIndex];
		oldChild = oldKeys[newChild.key];

		// new child doesn't exist in old children, insert
		if (oldChild === void 0) {
			nextPos = newIndex - addOffset;
			nextNode = nextPos < oldLength ? oldChildren[nextPos].node : null;

			create(newChild, null, owner, parent, nextNode, 2);

			addOffset++;
			newOffset--;
		} else if (newIndex === oldChild.i) {
			patch(newChildren[newIndex] = oldChild, oldChild, oldChild.group, ancestor);
		}
		newIndex++;
	}

	// step 3, remove
	while (oldIndex < oldEnd) {
		oldChild = oldChildren[oldIndex];

		// old child doesn't exist in new children, remove
		if (newKeys[oldChild.key] === void 0) {
			remove(oldChild, parent, oldChild.node);
			oldOffset--;
		}
		oldIndex++;
	}

	// new and old children are synced
	if (oldOffset + newOffset === 2) {
		return;
	}

	newIndex = newStart;
	childNodes = parent.childNodes;

	// step 4, move
	while (newIndex < newEnd) {
		newChild = newChildren[newIndex];

		if (newChild.node === null && (oldChild = oldKeys[newChild.key]) !== void 0) {
			if ((nextNode = childNodes[newIndex+1]) !== oldChild.node) {
				move(parent, oldChild, nextNode);
			}
			patch(newChildren[newIndex] = oldChild, oldChild, oldChild.group, ancestor);
		}
		newIndex++;
	}
}
