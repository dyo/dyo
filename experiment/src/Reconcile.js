/**
 * Patch Tree
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Tree} _ancestor
 * @param {Number} group
 */
function patch (older, _newer, _ancestor, group) {
	var ancestor = _ancestor;
	var newer = _newer;

	if (older.type !== newer.type) {
		return exchange(older, newer, ancestor, true);
	}

	if (group > 0) {
		if (shouldUpdate(older, newer, group) === false) {
			return;
		}

		newer = shape(renderBoundary(older, group), older, true);

		if (older.async === 2) {
			return;
		}

		older.async = 0;

		if (newer.tag !== older.tag) {
			return exchange(older, newer, older, false);
		}

		if (group > 1) {
			ancestor = older;
		}
	}

	if (older.flag === 1) {
		return content(older, older.children = newer.children);
	}

	var newLength = newer.children.length;
	var oldLength = older.children.length;

	if (oldLength === 0) {
		// fill children
		if (newLength !== 0) {
			fill(older, newer, newLength, ancestor);
			older.children = newer.children;
		}
	} else if (newLength === 0) {
		// empty children
		if (oldLength !== 0) {
			unmount(older, false);
			clear(older.node);
			older.children = newer.children;
		}
	} else if (newer.keyed === true) {
		keyed(older, newer, ancestor, oldLength, newLength);
	} else {
		nonkeyed(older, newer, ancestor, oldLength, newLength);
	}

	attributes(older, newer, ancestor);

	if (group > 0) {
		var owner = older.owner;

		if (owner.componentDidUpdate !== void 0) {
			older.async = 3;
			updateBoundary(owner, 2, owner._props, owner._state);
			older.async = 0;
		}
	}
}

/**
 * Reconcile Non-Keyed Children
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Tree} ancestor
 * @param  {Number} _oldLength
 * @param  {Number} _newLength
 */
function nonkeyed (older, newer, ancestor, _oldLength, _newLength) {
	var oldChildren = older.children;
	var newChildren = newer.children;
	var oldLength = _oldLength;
	var newLength = _newLength;
	var length = newLength > oldLength ? newLength : oldLength;

	for (var i = 0, newChild, oldChild; i < length; i++) {
		if (i >= newLength) {
			oldChild = oldChildren.pop();
			if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
				mountBoundary(oldChild.owner, 2);
			}
			remove(oldChild, older);
			unmount(oldChild, true);
			oldLength--;
		} else if (i >= oldLength) {
			create(newChild = oldChildren[i] = newChildren[i], ancestor, older, empty, 1, null);
			oldLength++;
		} else {
			newChild = newChildren[i];
			oldChild = oldChildren[i];

			if (newChild.flag === 1 && oldChild.flag === 1) {
				content(oldChild, oldChild.children = newChild.children);
			} else if (newChild.type !== oldChild.type) {
				if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
					mountBoundary(oldChild.owner, 2);
				}
				create(oldChildren[i] = newChild, ancestor, older, oldChild, 3, null);
				unmount(oldChild, true);
			} else {
				patch(oldChild, newChild, ancestor, oldChild.group);
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
 	var nextChild;

 	// step 1, sync leading [a, b ...], trailing [... c, d], opposites [a, b] [b, a] recursively
 	outer: while (true) {
 		// sync leading nodes
 		while (oldStartNode.key === newStartNode.key) {
 			newChildren[newStart] = oldStartNode;
 			patch(oldStartNode, newStartNode, ancestor, oldStartNode.group);

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
 			patch(oldEndNode, newEndNode, ancestor, oldEndNode.group);

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
 			move(oldEndNode, oldStartNode, older);
 			patch(oldEndNode, newStartNode, ancestor, oldEndNode.group);

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
 				move(oldStartNode, oldChildren[nextPos], older);
 			} else {
 				append(oldStartNode, older);
 			}

 			patch(oldStartNode, newEndNode, ancestor, oldStartNode.group);

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
 			nextChild = nextPos < newLength ? newChildren[nextPos] : empty;

 			do {
 				create(newStartNode = newChildren[newStart++], ancestor, older, nextChild, 2, null);
 			} while (newStart <= newEnd);
 		}
 	} else if (newStart > newEnd) {
 		// new children is synced, remove the difference
 		do {
 			oldStartNode = oldChildren[oldStart++];
 			if (oldStartNode.group > 0 && oldStartNode.owner.componentWillUnmount !== void 0) {
 				mountBoundary(oldStartNode.owner, 2);
 			}
 			remove(oldStartNode, older);
 			unmount(oldStartNode, true);
 		} while (oldStart <= oldEnd);
 	} else if (newStart === 0 && newEnd === newLength-1) {
 		// all children are out of sync, remove all, append new set
 		unmount(older, false);
 		clear(older);
 		fill(older, newer, newLength, ancestor);
 	} else {
 		// could sync all children, move on the the next phase
 		complex(older, newer, ancestor, oldStart, newStart, oldEnd + 1, newEnd + 1, oldLength, newLength);
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
	var nextChild;
	var nextPos;

	// step 1, build a map of keys
	while (true) {
		if (oldIndex < oldEnd) {
			oldChild = oldChildren[oldIndex];
			oldKeys[oldChild.key] = oldIndex++;
		}
		if (newIndex < newEnd) {
			newChild = newChildren[newIndex];
			newKeys[newChild.key] = newIndex++;
		}
		if (oldIndex === oldEnd && newIndex === newEnd) {
			break;
		}
	}

	// reset
	oldIndex = oldStart;
	newIndex = newStart;

	// step 2, insert and sync nodes from left to right [a, b, ...]
	while (newIndex < newEnd) {
		newChild = newChildren[newIndex];
		oldIndex = oldKeys[newChild.key];

		// new child doesn't exist in old children, insert
		if (oldIndex === void 0) {
			nextPos = newIndex - newOffset;
			nextChild = nextPos < oldLength ? oldChildren[nextPos] : empty;
			create(newChild, ancestor, older, nextChild, 2, null);
			newOffset++;
		} else if (newIndex === oldIndex) {
			oldChild = oldChildren[oldIndex];
			patch(newChildren[newIndex] = oldChild, newChild, ancestor, oldChild.group);
		}
		newIndex++;
	}

	// reset
	oldIndex = oldStart;

	// step 3, remove and sync nodes from left to right [a, b, ...]
	while (oldIndex < oldEnd) {
		oldChild = oldChildren[oldIndex];
		newIndex = newKeys[oldChild.key];

		// old child doesn't exist in new children, remove
		if (newIndex === void 0) {
			if (oldChild.group > 0 && oldChild.owner.componentWillUnmount !== void 0) {
				mountBoundary(oldChild.owner, 2);
			}
			remove(oldChild, older);
			unmount(oldChild, true);
			oldOffset++;
		}
		oldIndex++;
	}

	// compute changes
	oldOffset = (oldEnd - oldStart) - oldOffset;
	newOffset = (newEnd - newStart) - newOffset;

	// new and old children positions are in sync
	if (oldOffset + newOffset === 2) {
		return;
	}

	// reset
	newIndex = newEnd - 1;

	// step 4, move and sync nodes from right to left, [..., c, d]
	while (newIndex >= newStart) {
		newChild = newChildren[newIndex];

		// moved node
		if (newChild.node === null) {
			// retreive index
			oldIndex = oldKeys[newChild.key];

			// exists
			if (oldIndex !== void 0) {
				oldChild = oldChildren[oldIndex];

				// within bounds
				if ((nextPos = newIndex + 1) < newLength) {
					move(oldChild, newChildren[nextPos], older);
				} else {
					append(oldChild, older);
				}
				patch(newChildren[newIndex] = oldChild, newChild, ancestor, oldChild.group);
			}
		}
		newIndex--;
	}
}
