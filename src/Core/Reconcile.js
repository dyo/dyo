/**
 * @param {Object} prevObject
 * @param {Object} nextObject
 * @return {Object?}
 */
function reconcileObject (prevObject, nextObject) {
	var length = 0
	var delta = {}
	var value

	for (var key in prevObject)
		if (nextObject[key] == null)
			delta[(length++, key)] = false

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
	commitProperties(element, reconcileObject(element.props, snapshot.props), SharedPropsUpdate)
	element.props = snapshot.props
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function reconcileElement (element, snapshot) {
	if (element.id === SharedElementPromise && snapshot.id === SharedElementPromise)
		return commitPromise(element, snapshot)

	if (element.key !== snapshot.key || element.type !== snapshot.type)
		return commitReplace(element, snapshot, SharedMountReplace)

	switch (element.id) {
		case SharedElementPortal:
		case SharedElementFragment:
			return reconcileChildren(element, snapshot)
		case SharedElementComponent:
			return componentUpdate(element, snapshot, SharedComponentPropsUpdate)
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
	var host = element.host
	var children = element.children
	var siblings = snapshot.children
	var aLength = children.length
	var bLength = siblings.length
	var aHead = children.next
	var bHead = siblings.next
	var i = 0

	// batch-op/no-op
	switch (aLength+bLength) {
		case 0:
			return
		case aLength:
			return reconcileRemove(aHead, element, children, 0, aLength)
		case bLength:
			return reconcileInsert(bHead, bHead, element, host, children, 0, bLength, SharedMountAppend)
	}

	// non-keyed
	if (!snapshot.keyed) {
		i = aLength > bLength ? bLength : aLength

		while (i-- > 0) { 
			reconcileElement(aHead, bHead) 
			bHead = bHead.next
			aHead = aHead.next
		}

		if (aLength !== bLength)
			if (aLength > bLength)
				while (aLength > bLength)
					commitUnmount(children.pop(), element, (aLength--, SharedMountRemove))
			else
				while (aLength < bLength) {
					aHead = bHead
					bHead = bHead.next
					commitMount(children.push(aHead), aHead, element, host, SharedMountAppend, SharedMountCommit)
					aLength++
				}
		return
	}

	// keyed
	var aPos = 0
	var bPos = 0
	var aEnd = aLength - 1
	var bEnd = bLength - 1
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
	if (aPos > aEnd) {
		if (bPos <= bEnd++) {
			if (bEnd < bLength)
				reconcileInsert(bHead, aTail, element, host, children, bPos, bEnd, SharedMountInsert)
			else
				reconcileInsert(bHead.next, aTail, element, host, children, bPos, bEnd, SharedMountAppend)
		}
	} else if (bPos > bEnd)
		reconcileRemove(bEnd+1 < bLength ? aHead : aHead.next, element, children, aPos, aEnd+1)
	else
		reconcileMove(element, host, children, aHead, bHead, aPos, bPos, aEnd+1, bEnd+1)
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
function reconcileMove (element, host, children, aHead, bHead, aPos, bPos, aEnd, bEnd) {
	var aIndx = aPos
	var bIndx = bPos
	var aNode = aHead
	var bNode = bHead
	var aNext = aNode
	var bNext = bNode
	var bHash = ''
	var aSize = 0
	var aPool = {}

	// step 3, hashmap
	while (bIndx < bEnd && aIndx < aEnd) {
		if (aNode.key !== bNode.key) {
			aPool[aNode.key] = aNode
			aNode = aNode.next
			aSize++
			aIndx++
			continue
		}

		reconcileElement(aNode, bNode)
		aNode = aNode.next
		bNode = bNode.next
		aIndx++
		bIndx++
	}

	// step 4, insert/remove
	if (aSize !== aEnd) {
		while (bIndx++ < bEnd) {
			bHash = bNode.key
			bNext = bNode.next
			aNext = aPool[bHash]

			if (aNext = aPool[bHash]) {
				if (aNode === children)
					commitAppend(children.push(children.remove(aNext)), element)
				else
					commitInsert(children.insert(children.remove(aNext), aNode), aNode, element)

				reconcileElement(aNext, bNode)
				
				if (delete aPool[bHash])
					aSize--
			} else if (aNode === children)
				commitMount(children.push(bNode), bNode, element, host, SharedMountAppend, SharedMountCommit)
			else
				commitMount(children.insert(bNode, aNode), aNode, element, host, SharedMountInsert, SharedMountCommit)	

			bNode = bNext
		}

		if (aSize > 0)
			for (bHash in aPool)
				commitUnmount(children.remove(aPool[bHash]), element, SharedMountRemove)
	} else {
		reconcileRemove(aHead, element, children, 0, aEnd)
		reconcileInsert(bHead, bHead, element, host, children, 0, bEnd, SharedMountAppend)
	}
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 * @param {Element} host
 * @param {List} children
 * @param {number} index
 * @param {number} length
 * @param {number} signature
 */
function reconcileInsert (element, sibling, parent, host, children, index, length, signature) {
	var i = index
	var next = element
	var prev = element

	while (i++ < length)
		commitMount(children.push((next = (prev = next).next, prev)), sibling, parent, host, signature, SharedMountCommit)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {List} children
 * @param {number} index
 * @param {number} length
 */
function reconcileRemove (element, parent, children, index, length) {
	var i = index
	var next = element
	var prev = element
	
	while (i++ < length)
		commitUnmount(children.remove((next = (prev = next).next, prev)), parent, SharedMountRemove)
}
