/**
 * Patch
 *
 * @param {Tree} older
 * @param {Tree} _newer
 * @param {Number} group
 */
function patch (older, _newer, group) {
	var newer = _newer;

	if (older.type !== newer.type) {
		return exchange(older, newer, true);
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
			return exchange(older, newer, false);
		}

		if (newer.flag === 3) {
			composite(older, newer, group);

			if (older.owner.componentDidUpdate !== void 0) {
				didUpdate(older);
			}
			return;
		}
	}

	if (older.flag === 1) {
		return nodeValue(older, newer);
	}

	var oldLength = older.children.length;
	var newLength = newer.children.length;

	if (oldLength === 0) {
		// fill children
		if (newLength !== 0) {
			fill(older, newer, newLength);

			older.children = newer.children;
		}
	} else if (newLength === 0) {
		// remove children
		if (oldLength !== 0) {
			unmount(older, false);
			removeChildren(older);

			older.children = newer.children;
		}
	} else {
		switch (newer.keyed) {
			case false: nonkeyed(older, newer, oldLength, newLength); break;
			case true: keyed(older, newer, oldLength, newLength); break;
		}
	}

	attributes(older, newer);

	if (group > 0 && older.owner.componentDidUpdate !== void 0) {
		didUpdate(older);
	}
}

/**
 * Non-Keyed Children [Simple]
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Number} oldLength
 * @param {Number} newLength
 */
function nonkeyed (older, newer, oldLength, newLength) {
	var host = older.host;
	var oldChildren = older.children;
	var newChildren = newer.children;
	var length = newLength > oldLength ? newLength : oldLength;

	for (var i = 0; i < length; i++) {
		if (i >= newLength) {
			remove(oldChildren.pop(), shared, older);
		} else if (i >= oldLength) {
			create(oldChildren[i] = newChildren[i], older, shared, 1, host, null);
		} else {
			var newChild = newChildren[i];
			var oldChild = oldChildren[i];

			if (newChild.flag === 1 && oldChild.flag === 1) {
				nodeValue(oldChild, newChild);
			} else if (newChild.type !== oldChild.type) {
				create(oldChildren[i] = newChild, older, oldChild, 3, host, null);
			} else {
				patch(oldChild, newChild, oldChild.group);
			}
		}
	}
}

/**
 * Keyed Children [Simple]
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Number} oldLength
 * @param {Number} newLength
 */
function keyed (older, newer, oldLength, newLength) {
	var host = older.host;
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

 			patch(oldStartNode, newStartNode, oldStartNode.group);

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

 			patch(oldEndNode, newEndNode, oldEndNode.group);

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

 			insertBefore(oldEndNode, oldStartNode, older);
 			patch(oldEndNode, newStartNode, oldEndNode.group);

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
 				insertBefore(oldStartNode, oldChildren[nextPos], older);
 			} else {
 				appendChild(oldStartNode, older);
 			}

 			patch(oldStartNode, newEndNode, oldStartNode.group);

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
 			nextChild = nextPos < newLength ? newChildren[nextPos] : shared;

 			do {
 				create(newStartNode = newChildren[newStart++], older, nextChild, 2, host, null);
 			} while (newStart <= newEnd);
 		}
 	} else if (newStart > newEnd) {
 		// new children is synced, remove the difference
 		do {
 			remove(oldStartNode = oldChildren[oldStart++], shared, older);
 		} while (oldStart <= oldEnd);
 	} else if (newStart === 0 && newEnd === newLength-1) {
 		// all children are out of sync, remove all, append new set
 		unmount(older, false);
 		removeChildren(older);
 		fill(older, newer, newLength);
 	} else {
 		// could sync all children, move on the the next phase
 		complex(older, newer, oldStart, newStart, oldEnd + 1, newEnd + 1, oldLength, newLength);
 	}

 	older.children = newChildren;
}

/**
 * Keyed Children [Complex]
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Number} oldStart
 * @param {Number} newStart
 * @param {Number} oldEnd
 * @param {Number} newEnd
 * @param {Number} oldLength
 * @param {number} newLength
 */
function complex (older, newer, oldStart, newStart, oldEnd, newEnd, oldLength, newLength) {
	var host = older.host;
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
			nextChild = nextPos < oldLength ? oldChildren[nextPos] : shared;

			create(newChild, older, nextChild, 2, host, null);

			newOffset++;
		} else if (newIndex === oldIndex) {
			oldChild = oldChildren[oldIndex];

			patch(newChildren[newIndex] = oldChild, newChild, oldChild.group);
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
			remove(oldChild, shared, older);

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
					insertBefore(oldChild, newChildren[nextPos], older);
				} else {
					appendChild(oldChild, older);
				}

				patch(newChildren[newIndex] = oldChild, newChild, oldChild.group);
			}
		}

		newIndex--;
	}
}
