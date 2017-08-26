/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function reconcileProperties (element, snapshot) {
	var xmlns = element.xmlns
	var next = snapshot.props
	var prev = element.props
	var value = null
	var style = null

	for (var key in prev)
		if (next[key] == null)
			commitProperty(element, key, value, xmlns, 0)

	for (var key in next)
		if ((value = next[key]) !== (style = prev[key]))
			if (key !== 'style' || typeof value !== 'object') {
				commitProperty(element, key, value, xmlns, 1)
			} else {
				for (var name in style)
					if (!value || value[name] == null)
						commitStyle(element, name, null, 1)

				for (var name in value)
					if (!style || value[name] !== style[name])
						commitStyle(element, name, value[name], 1)
			}

	element.props = next
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function reconcileElement (element, snapshot) {	
	if (snapshot.flag === ElementPromise)
		return commitPromise(element, snapshot)

	if (element.key !== snapshot.key || element.type !== snapshot.type)
		return commitMerge(element, snapshot)

	switch (element.flag) {
		case ElementPortal:
		case ElementFragment:
			return reconcileChildren(element, snapshot)
		case ElementComponent:
			return componentUpdate(element, snapshot, 1)
		case ElementText:
			if (element.children !== snapshot.children)
				commitValue(element, element.children = snapshot.children)
			break
		case ElementNode:
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
			return reconcileInsert(bHead, bHead, element, host, children, 0, bLength, 0)
	}

	// non-keyed
	if (!snapshot.keyed) {
		i = aLength > bLength ? bLength : aLength

		while (i--) { 
			reconcileElement(aHead, bHead) 
			bHead = bHead.next
			aHead = aHead.next
		}

		if (aLength !== bLength)
			if (aLength > bLength)
				while (aLength > bLength)
					commitUnmount(children.pop(), element, (aLength--, 0))
			else
				while (aLength < bLength) {
					aHead = bHead
					bHead = bHead.next
					commitMount(children.push(aHead), aHead, element, host, 0)
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
		if (bPos <= bEnd++)
			reconcileInsert(bEnd < bLength ? (i = 1, bHead) : bHead.next, aTail, element, host, children, bPos, bEnd, i)
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
				delete aPool[bHash]
			} else if (aNode === children)
				commitMount(children.push(bNode), bNode, element, host, 0)
				else
					commitMount(children.insert(bNode, aNode), aNode, element, host, 1)	

			bNode = bNext
		}

		if (aSize > 0)
			for (bHash in aPool)
				commitUnmount(children.remove(aPool[bHash]), element, 0)
	} else {
		reconcileRemove(aHead, element, children, 0, aEnd)
		reconcileInsert(bHead, bHead, element, host, children, 0, bEnd, 0)
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
		commitMount(children.push((next = (prev = next).next, prev)), sibling, parent, host, signature)
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
		commitUnmount(children.remove((next = (prev = next).next, prev)), parent, 0)
}
