/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function reconcileProps (element, snapshot) {
	commitProps(element, reconcileObject(element.props, element.props = snapshot.props), SharedPropsUpdate)
}

/**
 * @param {Object} prevObject
 * @param {Object} nextObject
 * @return {Object?}
 */
function reconcileObject (prevObject, nextObject) {
	if (prevObject === nextObject)
		return

	var length = 0
	var delta = {}

	for (var key in prevObject)
		if (!hasOwnProperty.call(nextObject, key))
			delta[(++length, key)] = null

	for (var key in nextObject) {
		var next = nextObject[key]
		var prev = prevObject[key]

		if (next !== prev)
			if (typeof next !== 'object' || next === null)
				delta[(++length, key)] = next
			else if (next = reconcileObject(prev || {}, next))
				delta[(++length, key)] = next
	}

	if (length > 0)
		return delta
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function reconcileElement (element, snapshot) {
	if (element.id === SharedElementPromise && snapshot.id === SharedElementPromise)
		return commitWillReconcile(element, snapshot)

	if (element.key !== snapshot.key || element.type !== snapshot.type)
		return commitReplace(element, snapshot, element.parent, element.host)

	switch (element.id) {
		case SharedElementPortal:
		case SharedElementFragment:
			return reconcileChildren(element, snapshot)
		case SharedElementComponent:
			return updateComponent(element, snapshot, SharedComponentPropsUpdate)
		case SharedElementText:
			if (element.children !== snapshot.children)
				commitText(element, element.children = snapshot.children)
			break
		case SharedElementNode:
			reconcileChildren(element, snapshot)
			reconcileProps(element, snapshot)
	}
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

	// step 1, prefix/suffix
	outer: while (true) {
		while (oldHead.key === newHead.key) {
			reconcileElement(oldHead, newHead)
			++oldPos
			++newPos

			if (oldPos > oldEnd || newPos > newEnd)
				break outer

			oldHead = oldHead.next
			newHead = newHead.next
		}
		while (oldTail.key === newTail.key) {
			reconcileElement(oldTail, newTail)
			--oldEnd
			--newEnd

			if (oldPos > oldEnd || newPos > newEnd)
				break outer

			oldTail = oldTail.prev
			newTail = newTail.prev
		}
		break
	}

	// step 2, insert/append/remove
	if (oldPos > oldEnd++) {
		if (newPos <= newEnd++) {
			if (newEnd < newLength)
				signature = SharedMountInsert
			else if ((oldTail = children, oldLength > 0))
				newHead = newHead.next

			while (newPos++ < newEnd) {
				newHead = (oldHead = newHead).next
				commitMount(children.insert(oldHead, oldTail), oldTail, element, host, signature, SharedMountCommit)
			}
		}
	} else if (newPos > newEnd++) {
		if (newEnd === newLength && newLength > 0)
			oldHead = oldHead.next

		while (oldPos++ < oldEnd) {
			oldHead = (newHead = oldHead).next
			commitUnmount(children.remove(newHead), element, SharedMountRemove)
		}
	} else {
		reconcileSiblings(element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd)
	}
}

/**
 * @param  {Element} element
 * @param  {Element} host
 * @param  {List} children
 * @param  {Element} oldHead
 * @param  {Element} newHead
 * @param  {number} oldPos
 * @param  {number} newPos
 * @param  {number} oldEnd
 * @param  {number} newEnd
 */
function reconcileSiblings (element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd) {
	var oldIndex = oldPos
	var newIndex = newPos
	var oldChild = oldHead
	var newChild = newHead
	var oldNext = oldHead
	var newNext = newHead
	var newHash = ''
	var oldSize = 0
	var oldPool = {}

	// step 3, hashmap
	while (oldIndex < oldEnd)
		if (oldChild.key !== newChild.key) {
			oldPool[oldChild.key] = oldChild
			oldChild = oldChild.next
			++oldSize
			++oldIndex
		} else {
			reconcileElement(oldChild, newChild)
			oldChild = oldChild.next
			newChild = newChild.next
			++oldIndex
			++newIndex
		}

	// step 4, insert/append
	while (newIndex++ < newEnd) {
		newHash = newChild.key
		newNext = newChild.next
		oldNext = oldPool[newHash]

		if (oldNext) {
			if (oldChild === children)
				commitAppend(children.insert(children.remove(oldNext), oldChild), element)
			else
				commitInsert(children.insert(children.remove(oldNext), oldChild), oldChild, element)

			reconcileElement(oldNext, newChild)

			delete oldPool[(--oldSize, newHash)]
		} else if (oldChild === children)
			commitMount(children.insert(newChild, oldChild), newChild, element, host, SharedMountAppend, SharedMountCommit)
		else
			commitMount(children.insert(newChild, oldChild), oldChild, element, host, SharedMountInsert, SharedMountCommit)

		newChild = newNext
	}

	// step 5, remove
	if (oldSize > 0)
		for (newHash in oldPool)
			commitUnmount(children.remove(oldPool[newHash]), element, SharedMountRemove)
}
