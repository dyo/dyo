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

	if (group > 0) {
		if (older.type !== newer.type) {
			return exchange(older, newer, 1, ancestor);
		}
		if ((newer = shouldUpdate(older, newer, group, ancestor)) === void 0) {
			return;
		}

		if (group > 1) {
			ancestor = older;
		}
	}

	if (older.flag === 1) {
		return content(older.node, older.children = newer.children);
	}
	var newLength = newer.children.length;
	var oldLength = older.children.length;

	// fill children
	if (oldLength === 0) {
		if (newLength !== 0) {
			fill(older, newer, ancestor);
			older.children = newChildren;
		}
		return;
	}
	// empty children
	if (newLength === 0) {
		if (oldLength !== 0) {
			empty(older, false);
			older.children = newChildren;
			clear(older.node);
		}
		return;
	}

	if (older.keyed === true) {
		keyed(older, newer, ancestor, oldLength, newLength);
	} else {
		nonkeyed(older, newer, ancestor, oldLength, newLength);
	}

	attributes(older, newer, ancestor);

	if (group > 0) {
		didUpdate(older);
	}
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

	// patch non-keyed children
	for (var i = 0, newChild, oldChild; i < length; i++) {
		if (i >= newLength) {
			oldChild = oldChildren.pop();
			if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
				mountBoundary(oldChild.owner, 2);
			}
			remove(oldChild.node, parent);
			empty(oldChild, true);
			oldLength--;
		} else if (i >= oldLength) {
			create(newChild = oldChildren[i] = newChildren[i], null, ancestor, parent, null, 1);
			oldLength++;
		} else {
			newChild = newChildren[i];
			oldChild = oldChildren[i];

			if (newChild.flag === 1 && oldChild.flag === 1) {
				content(oldChild.node, oldChild.children = newChild.children);
			} else if (newChild.type !== oldChild.type) {
				if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
					mountBoundary(oldChild.owner, 2);
				}
				change(oldChild, oldChildren[i] = newChild, parent, ancestor);
				empty(oldChild, true);
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

 			move(oldEndNode.node, oldStartNode.node, oldStart, parent);
 			patch(oldEndNode, newStartNode, oldEndNode.group, ancestor);

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

 			if (nextPos < newLength) {
 				move(oldStartNode, oldChildren[nextPos].node, nextPos, parent);
 			} else {
 				append(oldStartNode.node, parent);
 			}
 			patch(oldStartNode, newEndNode, oldStartNode.group, ancestor);

 			oldStart++;
 			newEnd--;

 			oldStartNode = oldChildren[oldStart];
 			newEndNode = newChildren[newEnd];
 			continue;
 		}
 		break;
 	}
 	// step 2, remove or insert or both
 	if (oldStart > oldEnd) {
 		// old children is synced, insert the difference
 		if (newStart <= newEnd) {
 			nextPos = newEnd + 1;
 			nextNode = nextPos < newLength ? newChildren[nextPos].node : null;

 			do {
 				create(newStartNode = newChildren[newStart++], null, ancestor, parent, nextNode, 2);
 			} while (newStart <= newEnd);
 		}
 	} else if (newStart > newEnd) {
 		// new children is synced, remove the difference
 		do {
 			oldStartNode = oldChildren[oldStart++];
 			if (oldStartNode.group > 0 && oldStartNode.owner.componentWillUnmount !== void 0) {
 				mountBoundary(oldStartNode.owner, 2);
 			}
 			remove(oldStartNode.node, parent);
 			empty(oldStartNode, true);
 		} while (oldStart <= oldEnd);
 	} else if (newStart === 0 && newEnd === newLength-1) {
 		// all children are out of sync, remove all, append new set
 		empty(older, false);
 		clear(parent);
 		fill(older, newer, ancestor);
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
	var oldKeys = {};
	var newKeys = {};
	var oldIndex = oldStart;
	var newIndex = newStart;
	var oldOffset = 0;
	var newOffset = 0;
	var oldChild;
	var newChild;
	var nextNode;
	var nextPos;

	// step 1, build a map of keys
	while (true) {
		if (oldIndex !== oldEnd) {
			oldChild = oldChildren[oldIndex];
			oldKeys[oldChild.key] = oldIndex++;
		}
		if (newIndex !== newEnd) {
			newChild = newChildren[newIndex];
			newKeys[newChild.key] = newIndex++;
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
		oldIndex = oldKeys[newChild.key];

		// new child doesn't exist in old children, insert
		if (oldIndex === void 0) {
			nextPos = newIndex - newOffset;
			nextNode = nextPos < oldLength ? oldChildren[nextPos].node : null;
			create(newChild, null, ancestor, parent, nextNode, 2);
			newOffset++;
		} else if (newIndex === oldIndex) {
			oldChild = oldChildren[oldIndex];
			patch(newChildren[newIndex] = oldChild, newChild, oldChild.group, ancestor);
		}
		newIndex++;
	}

	oldIndex = oldStart;

	// step 3, remove
	while (oldIndex < oldEnd) {
		oldChild = oldChildren[oldIndex];
		newIndex = newKeys[oldChild.key];

		// old child doesn't exist in new children, remove
		if (newIndex === void 0) {
			if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
				mountBoundary(oldChild.owner, 2);
			}
			remove(oldChild.node, parent);
			empty(oldChild, true);
			oldOffset++;
		}
		oldIndex++;
	}

	// new and old children are synced
	if (((oldEnd - oldStart) - oldOffset) + ((newEnd - newStart) - newOffset) === 2) {
		return;
	}
	newIndex = newStart;

	// step 4, move
	while (newIndex < newEnd) {
		newChild = newChildren[newIndex];

		if (newChild.node === null) {
			oldIndex = oldKeys[newChild.key];

			if (oldIndex !== void 0) {
				nextPos = newIndex + 1;
				oldChild = oldChildren[oldIndex];

				move(oldChild, null, nextPos, parent);
				patch(newChildren[newIndex] = oldChild, newChild, oldChild.group, ancestor);
			}
		}
		newIndex++;
	}
}
