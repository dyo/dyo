/**
 * @param {Object} prev
 * @param {Object} next
 */
function patchStyle (prev, next) {
	var value, delta = {}

	for (var key in next)
		switch (value = next[key]) {
			case prev[key]:
				break
			default:
				delta[key] = value
		}

	return element.style = next, delta
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {number} signature
 */
function patchProps (element, snapshot, signature) {
	var props = element.props
	var delta = signature === 0 ? props : assign({}, props, snapshot.props)
	var xmlns = element.xmlns !== null
	var value = null

	switch (signature) {
		case 0:
			for (var key in delta)
				if ((value = delta[key]) != null)
					commitProps(element, key, delta[key], 1, xmlns)
			return
		case 1:
			for (var key in delta)
				switch (value = delta[key]) {
					case props[key]:
						break
					default:
						commitProps(element, key, value, value == null ? 0 : 2, xmlns)
				}
	}

	element.props = snapshot.props
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function patchElement (element, snapshot) {	
	if (snapshot.flag === ElementPromise)
		return commitPromise(element, snapshot)

	if (element.key !== snapshot.key || element.type !== snapshot.type)
		return commitMerge(element, snapshot)
			
	switch (snapshot.flag) {
		case ElementText:
			if (element.children !== snapshot.children)
				commitText(element, snapshot)
			break
		case ElementPortal:
		case ElementNode:
			return patchChildren(element, snapshot), patchProps(element, snapshot, 1)
		case ElementFragment:
			return patchChildren(element, snapshot)
		case ElementComponent:
			return componentUpdate(element, snapshot, element.flag, 1)
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function patchChildren (element, snapshot) {
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
			return patchRemove(aHead, element, children, 0, aLength)
		case bLength:
			return patchInsert(bHead, bHead, element, host, children, 0, bLength, 0)
	}

	// non-keyed
	if (!snapshot.keyed) {
		i = aLength > bLength ? bLength : aLength

		while (i--) { 
			patchElement(aHead, bHead) 
			bHead = bHead.next
			aHead = aHead.next
		}

		if (aLength !== bLength)
			if (aLength > bLength)
				while (aLength > bLength) {
					commitUnmount(children.pop(), element, 0)
					aLength--
				}
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
			patchElement(aHead, bHead)
			aPos++
			bPos++
			
			if (aPos > aEnd || bPos > bEnd) 
				break outer
			
			aHead = aHead.next
			bHead = bHead.next
		}
		while (aTail.key === bTail.key) {
			patchElement(aTail, bTail)
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
				i = 1
			else
				bHead = bHead.next

			patchInsert(bHead, aTail, element, host, children, bPos, bEnd, i)
		}
	} else if (bPos > bEnd)
		patchRemove(bEnd+1 < bLength ? aHead : aHead.next, element, children, aPos, aEnd+1)
	else
		patchMove(element, host, children, aHead, bHead, aPos, bPos, aEnd+1, bEnd+1)
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
function patchMove (element, host, children, aHead, bHead, aPos, bPos, aEnd, bEnd) {
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

		patchElement(aNode, bNode)

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
				if (aNode === children) {
					commitAppend(children.push(children.remove(aNext)), element)
				} else {
					commitInsert(children.insert(children.remove(aNext), aNode), aNode, element)
				}

				if (delete aPool[bHash])
					patchElement(aNext, bNode)
			} else {
				if (aNode === children)
					commitMount(children.push(bNode), bNode, element, host, 0)
				else
					commitMount(children.insert(bNode, aNode), aNode, element, host, 1)	
			}

			bNode = bNext
		}

		if (aSize > 0)
			for (bHash in aPool)
				commitUnmount(children.remove(aPool[bHash]), element, 0)
	} else {
		patchRemove(aHead, element, children, 0, aEnd)
		patchInsert(bHead, bHead, element, host, children, 0, bEnd, 0)
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
function patchInsert (element, sibling, parent, host, children, index, length, signature) {
	var i = index
	var prev = element
	var next = prev

	while (i++ < length) {
		next = (prev = next).next
		commitMount(children.push(prev), sibling, parent, host, signature)
	}
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {List} children
 * @param {number} index
 * @param {number} length
 */
function patchRemove (element, parent, children, index, length) {
	var i = index
	var prev = element
	var next = prev
	
	while (i++ < length) {
		next = (prev = next).next
		commitUnmount(children.remove(prev), parent, 0)
	}
}
