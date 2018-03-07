/**
 * @param {Object} prevProps
 * @param {Object} nextProps
 * @return {Object?}
 */
function reconcileProps (prevProps, nextProps) {
	if (prevProps === nextProps)
		return

	var length = 0
	var props = {}

	for (var key in prevProps)
		if (!hasOwnProperty.call(nextProps, key))
			props[(++length, key)] = null

	for (var key in nextProps) {
		var next = nextProps[key]
		var prev = prevProps[key]

		if (next !== prev)
			if (typeof next !== 'object' || next === null)
				props[(++length, key)] = next
			else if (next = reconcileProps(prev || {}, next))
				props[(++length, key)] = next
	}

	if (length > 0)
		return props
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function reconcileElement (element, snapshot) {
	if (!element.active)
		return

	if (element.key !== snapshot.key)
		return commitReplace(element, snapshot)

	if (element.id === SharedElementPromise && snapshot.id === SharedElementPromise)
		return commitPromise(element, element.type = snapshot.type)

	if (element.type !== snapshot.type)
		return commitReplace(element, snapshot)

	switch (element.id) {
		case SharedElementPortal:
		case SharedElementFragment:
			return reconcileChildren(element, snapshot)
		case SharedElementComponent:
			return updateComponentElement(element, snapshot, SharedComponentPropsUpdate)
		case SharedElementText:
			if (element.children !== snapshot.children)
				commitText(element, element.children = snapshot.children)
		case SharedElementEmpty:
			return
	}

	reconcileChildren(element, snapshot)
	commitProps(element, reconcileProps(element.props, element.props = snapshot.props), SharedPropsUpdate)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function reconcileChildren (element, snapshot) {
	var signature = SharedMountAppend
	var host = element.host
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

			reconcileElement(oldHead, newHead)

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

			reconcileElement(oldTail, newTail)

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
				signature = SharedMountInsert
			else if ((oldTail = children, oldLength > 0))
				newHead = newNext

			while (newPos++ < newEnd) {
				newHead = (oldHead = newHead).next
				commitMount(children.insert(oldHead, oldTail), oldTail, element, host, signature, SharedMountCommit)
			}
		}
	} else if (newPos > newEnd++) {
		if (newEnd === newLength && newLength > 0)
			oldHead = oldNext

		while (oldPos++ < oldEnd) {
			oldHead = (newHead = oldHead).next
			commitUnmount(children.remove(newHead), element, SharedMountRemove)
		}
	} else {
		reconcileSiblings(element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd, oldLength)
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
function reconcileSiblings (element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd, oldLength) {
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
						commitAppend(children.insert(children.remove(prevMoved), children), element)
					} else if (nextMoved !== oldChild) {
						if (isValidElement(nextChild = nextNodes[oldChild.key])) {
							if (oldChild.prev.key === nextChild.prev.key)
								commitAppend(children.insert(children.remove(prevMoved), children), element)
							else
								commitInsert(children.insert(children.remove(prevMoved), oldChild), oldChild, element)
						} else if (nextMoved.key !== oldChild.prev.key) {
							commitInsert(children.insert(children.remove(prevMoved), oldChild), oldChild, element)
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
							commitInsert(children.insert(children.remove(prevMoved), nextChild), nextChild, element)
				}
			}
		} else if (!isValidElement(nextChild)) {
			commitMount(children.insert(newChild, children), newChild, element, host, SharedMountAppend, SharedMountCommit)
		} else {
			nextChild = nextChild.active ? nextChild : (nextMoved || oldChild)
			commitMount(children.insert(newChild, nextChild), nextChild, element, host, SharedMountInsert, SharedMountCommit)
		}

		newChild = prevChild
	}

	// step 5, remove/update
	for (var oldKey in prevNodes)
		if (isValidElement((oldChild = prevNodes[oldKey], newChild = nextNodes[oldKey])))
			reconcileElement(oldChild, newChild)
		else
			commitUnmount(children.remove(oldChild), element, SharedMountRemove)
}
