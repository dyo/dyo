/**
 * Patch
 *
 * @param {Tree} older
 * @param {Tree} _newer
 * @param {Number} group
 */
function patch (older, _newer, group) {
	var newer = _newer;
	var type = older.type;
	var skip = false;

	if (type !== newer.type) {
		exchange(older, newer, true);
		return;
	}

	if (group !== STRING) {
		var owner = older.owner

		if (owner === null || older.async !== READY) {
			return;
		}

		older.async = PROCESSING;

		var newProps = newer.props;
		var oldProps = older.props;
		var newState;
		var oldState;

		if (group !== FUNCTION) {
			oldState = owner.state;
			newState = owner._state;
		} else {
			oldState = oldProps;
			newState = newProps;
		}

		if (group !== NOOP) {
			if (type.propTypes !== void 0) {
				propTypes(owner, type, newProps);
			}

			if (owner.componentWillReceiveProps !== void 0) {
				dataBoundary(older, owner, 0, newProps);
			}

			if (type.defaultProps !== void 0) {
				merge(type.defaultProps, newProps === PROPS ? (newProps = {}) : newProps);
			}
		}

		if (
			owner.shouldComponentUpdate !== void 0 &&
			updateBoundary(older, owner, 0, newProps, newState) === false
		) {
			older.async = READY;
			return;
		}

		if (group < 3) {
			if (group === CLASS) {
				owner.props = newProps;
			}

			older.props = newProps;
		}

		if (owner.componentWillUpdate !== void 0) {
			updateBoundary(older, owner, 1, newProps, newState);
		}

		// update current state
		if (group !== FUNCTION) {
			updateState(oldState, newState);
		}

		newer = renderBoundary(older, group);
		newer = newer !== older ? shape(newer, older, true) : newer;

		if (older.async === PENDING) {
			return;
		}

		older.async = READY;

		if (newer.tag !== older.tag) {
			exchange(older, newer, false);
			skip = true;
		} else {
			// composite component
			if (newer.flag === COMPOSITE) {
				patch(older.children[0], newer.children[0], group);
				skip = true;
			}
		}
	}

	if (skip === false) {
		switch (older.flag) {
			// text component
			case TEXT: {
				if (older.children !== newer.children) {
					nodeValue(older, newer);
				}
				break
			}
			default: {
				var oldLength = older.children.length;
				var newLength = newer.children.length;

				/**
				 * In theory switch(int * int)
				 *
				 * should be faster than
				 *
				 * if (int === x && int === y, ...condtions)
				 *
				 * when int * 0 === 0,
				 * if oldLength is not zero then newLength is.
				 */
				switch (oldLength * newLength) {
					case 0: {
						switch (oldLength) {
							// fill children
							case 0: {
								if (newLength > 0) {
									fill(older, newer, newLength);
									older.children = newer.children;
								}
								break
							}
							// remove children
							default: {
								unmount(older);
								removeChildren(older);
								older.children = newer.children;
							}
						}
						break;
					}
					default: {
						switch (newer.keyed) {
							case 0: nonkeyed(older, newer, oldLength, newLength); break;
							case 1: keyed(older, newer, oldLength, newLength); break;
						}
					}
				}

				attributes(older, newer);
			}
		}
	}

	if (group !== STRING && older.owner.componentDidUpdate !== void 0) {
		older.async = PROCESSED;
		updateBoundary(older, owner, 2, oldProps, oldState);
		older.async = READY;
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
		if (i >= oldLength) {
			create(oldChildren[i] = newChildren[i], older, SHARED, 1, host, null);
		} else if (i >= newLength) {
			remove(oldChildren.pop(), SHARED, older);
		} else {
			var newChild = newChildren[i];
			var oldChild = oldChildren[i];

			if (newChild.flag === TEXT && oldChild.flag === TEXT) {
				if (newChild.children !== oldChild.children) {
					nodeValue(oldChild, newChild);
				}
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
 			nextChild = nextPos < newLength ? newChildren[nextPos] : SHARED;

 			do {
 				create(newStartNode = newChildren[newStart++], older, nextChild, 2, host, null);
 			} while (newStart <= newEnd);
 		}
 	} else if (newStart > newEnd) {
 		// new children is synced, remove the difference
 		do {
 			remove(oldStartNode = oldChildren[oldStart++], SHARED, older);
 		} while (oldStart <= oldEnd);
 	} else if (newStart === 0 && newEnd === newLength-1) {
 		// all children are out of sync, remove all, append new set
 		unmount(older);
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
			nextChild = nextPos < oldLength ? oldChildren[nextPos] : SHARED;

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
			remove(oldChild, SHARED, older);

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
