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
	var value

	for (var key in prevObject)
		if (nextObject[key] == null)
			delta[(length++, key)] = undefined

	for (var key in nextObject) {
		var next = nextObject[key]
		var prev = prevObject[key]

		if (next !== prev) {
			if (typeof next !== 'object' || next === null)
				delta[(length++, key)] = next
			else if (value = reconcileObject(prev || {}, next))
				delta[(length++, key)] = value
		}
	}

	if (length > 0)
		return delta
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function reconcileProperties (element, snapshot) {
	commitProperties(element, reconcileObject(element.props, element.props = snapshot.props), SharedPropsUpdate)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function reconcileElement (element, snapshot) {
	if (element.id === SharedElementPromise && snapshot.id === SharedElementPromise)
		return commitWillReconcile(element, snapshot)

	if (element.key !== snapshot.key || element.type !== snapshot.type)
		return commitReplace(element, snapshot, element.parent, element.host, SharedMountReplace)

	if (element === snapshot)
		return

	switch (element.id) {
		case SharedElementPortal:
		case SharedElementFragment:
			return reconcileChildren(element, snapshot)
		case SharedElementComponent:
			return updateComponent(element, snapshot, SharedComponentPropsUpdate)
		case SharedElementText:
			if (element.children !== snapshot.children)
				commitValue(element, element.children = snapshot.children)
			break
		case SharedElementNode:
			reconcileChildren(element, snapshot)
			reconcileProperties(element, snapshot)
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
	var aLength = children.length
	var bLength = siblings.length

	if (aLength + bLength === 0)
		return

	var aPos = 0
	var bPos = 0
	var aEnd = aLength - 1
	var bEnd = bLength - 1
	var aHead = children.next
	var bHead = siblings.next
	var aTail = children.prev
	var bTail = siblings.prev

	// step 1, prefix/suffix
	outer: while (true) {
		while (aHead.key === bHead.key) {
			reconcileElement(aHead, bHead)
			aPos++
			bPos++
			
			if (aPos > aEnd || bPos > bEnd) 
				break outer
			
			aHead = aHead.next
			bHead = bHead.next
		}
		while (aTail.key === bTail.key) {
			reconcileElement(aTail, bTail)
			aEnd--
			bEnd--

			if (aPos > aEnd || bPos > bEnd) 
				break outer
			
			aTail = aTail.prev
			bTail = bTail.prev
		}
		break
	}

	// step 2, insert/append/remove
	if (aPos > aEnd++) {
		if (bPos <= bEnd++) {
			if (bEnd < bLength) 
				signature = SharedMountInsert
			else if (aLength > 0)
				bHead = bHead.next

			while (bPos++ < bEnd) {
				bHead = (aHead = bHead).next
				commitMount(children.insert(aHead, aTail), aTail, element, host, signature, SharedMountCommit)
			}
		}
	} else if (bPos > bEnd++) {
		if (bEnd === bLength && bLength > 0)
			aHead = aHead.next

		while (aPos++ < aEnd) {
			aHead = (bHead = aHead).next
			commitUnmount(children.remove(bHead), element, SharedMountRemove)
		}
	} else {
		reconcileSiblings(element, host, children, aHead, bHead, aPos, bPos, aEnd, bEnd)
	}
}

/**
 * @param  {Element} element
 * @param  {Element} host
 * @param  {List} children
 * @param  {Element} aHead
 * @param  {Element} bHead
 * @param  {number} aPos
 * @param  {number} bPos
 * @param  {number} aEnd
 * @param  {number} bEnd
 */
function reconcileSiblings (element, host, children, aHead, bHead, aPos, bPos, aEnd, bEnd) {
	var aIndx = aPos
	var bIndx = bPos
	var aNode = aHead
	var bNode = bHead
	var aNext = aHead
	var bNext = bHead
	var bHash = ''
	var aSize = 0
	var aPool = {}

	// step 3, hashmap
	while (aIndx < aEnd)
		if (aNode.key !== bNode.key) {
			aPool[aNode.key] = aNode
			aNode = aNode.next
			aSize++
			aIndx++
		} else {
			reconcileElement(aNode, bNode)
			aNode = aNode.next
			bNode = bNode.next
			aIndx++
			bIndx++
		}

	// step 4, insert/append
	while (bIndx++ < bEnd) {
		bHash = bNode.key
		bNext = bNode.next
		aNext = aPool[bHash]

		if (aNext = aPool[bHash]) {
			if (aNode === children)
				commitAppend(children.insert(children.remove(aNext), aNode), element)
			else
				commitInsert(children.insert(children.remove(aNext), aNode), aNode, element)

			reconcileElement(aNext, bNode)
			
			if (delete aPool[bHash])
				aSize--
		} else if (aNode === children)
			commitMount(children.insert(bNode, aNode), bNode, element, host, SharedMountAppend, SharedMountCommit)
		else
			commitMount(children.insert(bNode, aNode), aNode, element, host, SharedMountInsert, SharedMountCommit)	

		bNode = bNext
	}

	// step 5, remove
	if (aSize > 0)
		for (bHash in aPool)
			commitUnmount(children.remove(aPool[bHash]), element, SharedMountRemove)
}
