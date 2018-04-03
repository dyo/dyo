/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} host
 */
function reconcileElement (element, snapshot, host) {
	if (!element.active)
		return

	if (element.key !== snapshot.key)
		return commitMountElementReplace(element, snapshot, host)

	if (element.id === SharedElementPromise && snapshot.id === SharedElementPromise)
		return commitMountElementPromise(element, host, element.type = snapshot.type)

	if (element.type !== snapshot.type)
		return commitMountElementReplace(element, snapshot, host)

	switch (element.id) {
		case SharedElementText:
		case SharedElementComment:
			if (element.children !== snapshot.children)
				commitOwnerContent(element, element.children = snapshot.children)
		case SharedElementEmpty:
			return
		case SharedElementPortal:
		case SharedElementFragment:
			return reconcileElementChildren(element, snapshot, host)
		case SharedElementComponent:
			return updateComponentElement(element, snapshot, host, SharedComponentPropsUpdate)
	}

	reconcileElementChildren(element, snapshot, host)
	commitOwnerPropsUpdate(element, reconcileElementProps(element.props, element.props = snapshot.props))
}

/**
 * @param {object} older
 * @param {object} newer
 * @return {object?}
 */
function reconcileElementProps (older, newer) {
	if (older === newer)
		return

	var length = 0
	var change = {}

	for (var key in older)
		if (!ObjectHasOwnProperty.call(newer, key))
			change[(++length, key)] = null

	for (var key in newer) {
		var next = newer[key]
		var prev = older[key]

		if (next !== prev)
			// primitive
			if (typeof next !== 'object' || next === null)
				change[(++length, key)] = next
			// object/circular data-structure
			else if (next === newer || next[SymbolForIterator] === SymbolForIterator || (next = reconcileElementProps(prev || {}, next)))
				change[(++length, key)] = next
	}

	if (length > 0)
		return change
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} host
 */
function reconcileElementChildren (element, snapshot, host) {
	var signature = SharedOwnerAppend
	var children = element.children
	var siblings = snapshot.children
	var oldLength = children.length
	var newLength = siblings.length

	if (oldLength + newLength === 0)
		return

	var oldPos = 0
	var newPos = 0
	var oldEnd = oldLength - 1
	var newEnd = newLength - 1
	var oldHead = children.next
	var newHead = siblings.next
	var oldTail = children.prev
	var newTail = siblings.prev
	var oldNext = oldHead
	var newNext = newHead
	var oldPrev = oldTail
	var newPrev = newTail

	// step 1, prefix/suffix
	outer: while (true) {
		while (oldHead.key === newHead.key) {
			oldNext = oldHead.next
			newNext = newHead.next

			reconcileElement(oldHead, newHead, host)

			++oldPos
			++newPos

			if (oldPos > oldEnd || newPos > newEnd)
				break outer

			oldHead = oldNext
			newHead = newNext
		}

		while (oldTail.key === newTail.key) {
			oldPrev = oldTail.prev
			newPrev = newTail.prev

			reconcileElement(oldTail, newTail, host)

			--oldEnd
			--newEnd

			if (oldPos > oldEnd || newPos > newEnd)
				break outer

			oldTail = oldPrev
			newTail = newPrev
		}

		break
	}

	// step 2, mount/remove
	if (oldPos > oldEnd++) {
		if (newPos <= newEnd++) {
			if (newEnd < newLength)
				signature = SharedOwnerInsert
			else if ((oldTail = children, oldLength > 0))
				newHead = newNext

			while (newPos++ < newEnd) {
				newHead = (oldHead = newHead).next
				commitMountElement(children.insert(oldHead, oldTail), oldTail, element, host, signature, SharedMountOwner)
			}
		}
	} else if (newPos > newEnd++) {
		if (newEnd === newLength && newLength > 0)
			oldHead = oldNext

		while (oldPos++ < oldEnd) {
			oldHead = (newHead = oldHead).next
			commitUnmountElement(children.remove(newHead), element)
		}
	} else {
		reconcileElementSiblings(element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd, oldLength)
	}
}

/**
 * @param {Element} element
 * @param {Element} host
 * @param {List} children
 * @param {Element} oldHead
 * @param {Element} newHead
 * @param {number} oldPos
 * @param {number} newPos
 * @param {number} oldEnd
 * @param {number} newEnd
 * @param {number} oldLength
 */
function reconcileElementSiblings (element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd, oldLength) {
	var oldIndex = oldPos
	var newIndex = newPos
	var oldChild = oldHead
	var newChild = newHead
	var prevChild = oldChild
	var nextChild = oldChild
	var prevMoved = oldChild
	var nextMoved = oldChild
	var prevNodes = {}
	var nextNodes = {}

	// step 3, hashmap
	while (oldIndex < oldEnd || newIndex < newEnd) {
		if (oldIndex < oldEnd && (prevNodes[oldChild.key] = oldChild, ++oldIndex !== oldLength))
			oldChild = oldChild.next

		if (newIndex < newEnd && (nextNodes[newChild.key] = newChild, ++newIndex !== newEnd))
			newChild = newChild.next
	}

	// step 4, mount/move
	while (newIndex-- > newPos) {
		prevChild = newChild.prev
		nextChild = newChild.next
		prevMoved = prevNodes[newChild.key]
		nextMoved = prevNodes[nextChild.key]

		if (isValidElement(prevMoved)) {
			if (!isValidElement(nextChild)) {
				if (isValidElement(nextMoved = prevMoved.next) && isValidElement(nextNodes[nextMoved.key])) {
					if (prevChild.key === oldChild.key) {
						commitOwnerAppend(children.insert(children.remove(prevMoved), children), element)
					} else if (nextMoved !== oldChild) {
						if (isValidElement(nextChild = nextNodes[oldChild.key])) {
							if (oldChild.prev.key === nextChild.prev.key)
								commitOwnerAppend(children.insert(children.remove(prevMoved), children), element)
							else
								commitOwnerInsert(children.insert(children.remove(prevMoved), oldChild), oldChild, element)
						} else if (nextMoved.key !== oldChild.prev.key) {
							commitOwnerInsert(children.insert(children.remove(prevMoved), oldChild), oldChild, element)
						}
					}
				}
			} else {
				nextChild = nextChild.active ? nextChild : nextMoved || oldChild
				nextMoved = prevMoved.next

				if (nextChild.key !== nextMoved.key) {
					while (isValidElement(nextMoved) && !isValidElement(nextNodes[nextMoved.key]))
						nextMoved = nextMoved.next

					if (nextChild.key !== nextMoved.key)
						if (prevChild.key !== prevMoved.prev.key || nextChild.key !== nextMoved.next.key)
							commitOwnerInsert(children.insert(children.remove(prevMoved), nextChild), nextChild, element)
				}
			}
		} else if (!isValidElement(nextChild)) {
			commitMountElement(children.insert(newChild, children), newChild, element, host, SharedOwnerAppend, SharedMountOwner)
		} else {
			nextChild = nextChild.active ? nextChild : (nextMoved || oldChild)
			commitMountElement(children.insert(newChild, nextChild), nextChild, element, host, SharedOwnerInsert, SharedMountOwner)
		}

		newChild = prevChild
	}

	// step 5, remove/update
	for (var oldKey in prevNodes)
		if (isValidElement((oldChild = prevNodes[oldKey], newChild = nextNodes[oldKey])))
			reconcileElement(oldChild, newChild, host)
		else
			commitUnmountElement(children.remove(oldChild), element)
}
