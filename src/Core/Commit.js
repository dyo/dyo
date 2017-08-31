/**
 * @param {*} element
 * @return {Element}
 */
function commitElement (element) {
	if (element != null)
		switch (element.constructor) {
			case Element:
				return element
			case Array:
				return elementFragment(element)
			case String:
			case Number:
				return elementText(element)
			case Function:
			case Promise:
				return createElement(element)
			case Boolean:
				break
			default:
				return elementUnknown(element)
		}

	return elementText('')
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitPromise (element, snapshot) {
	snapshot.type.then(function (value) {
		if (!element.DOM)
			return
		if (element.flag === ElementPromise)
			reconcileChildren(element, elementFragment(commitElement(value)))
		else
			reconcileElement(element, commitElement(value))
	}).catch(function (e) {
		errorBoundary(element, e, LifecycleAsync+':'+LifecycleRender, 1)
	})
}

/**
 * @param {Element} element
 * @param {List} children
 * @param {Element} host
 * @param {number} signature
 * @param {number} mode
 */
function commitChildren (element, children, host, signature, mode) {
	var length = children.length
	var sibling = children.next
	var next = sibling

	while (length-- > 0) {
		if (!next.DOM && signature > ModePull) {
			children.insert(next = merge(new Element(ElementNode), sibling = next), sibling)
			children.remove(sibling)
		}

		commitMount(next, element, element, host, signature, mode)
		next = next.next
	}
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 * @param {Element} host
 * @param {number} signature
 * @param {number} mode
 */
function commitMount (element, sibling, parent, host, signature, mode) {
	element.host = host
	element.parent = parent
	element.context = host.context

 	switch (element.flag) {
 		case ElementComponent:
 			element.work = WorkTask
 			
 			componentMount(element)

 			if (element.owner[LifecycleWillMount]) 
 				lifecycleMount(element, LifecycleWillMount)

 			if (element.owner[LifecycleChildContext])
 				element.context = getChildContext(element)

 			commitMount(element.children, sibling, parent, element, signature, mode)
 			element.DOM = element.children.DOM

 			if (element.ref)
 				commitRef(element, element.ref, RefAssign)
 			
 			if (element.owner[LifecycleDidMount])
 				lifecycleMount(element, LifecycleDidMount)

 			element.work = WorkSync
 			return
 		case ElementPortal:
 			element.DOM = DOM(element.type)
 			break
 		case ElementPromise:
 			commitPromise(element, element)
 		case ElementFragment:
 			element.DOM = DOM(DOMTarget(parent))
 			break
 		case ElementNode:
 			element.xmlns = DOMType(element.type, parent.xmlns)
 		case ElementText:
 			switch (mode) {
 				case ModePull:
 					if (element.DOM = DOMFind(element, elementPrev(element), parent))
 						break
 				default:
 					element.DOM = commitDOM(element)
 					
 					if (signature < MountInsert)
 						commitAppend(element, parent)
 					else
 						commitInsert(element, sibling, parent)
 			}

 			if (element.flag > ElementNode)
 				return
 	}

 	commitChildren(element, element.children, host, MountAppend, mode)
 	commitProps(element, element.props, PropsAppend)	
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitUnmount (element, parent, signature) {
	if (element.flag === ElementComponent)
		return componentUnmount(element, element.children, parent, signature)

	commitRemove(element, parent)
	commitDetach(element, signature)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {number} signature
 */
function commitReplace (element, snapshot, signature) {
	if (signature > MountInsert && commitUnmount(element, element.parent, MountReplace))
		return void element.state.then(function () {
			commitReplace(element, snapshot, MountInsert)
		})

	commitMount(snapshot, elementNext(element, MountAppend), element.parent, element.host, MountInsert, ModePush)

	for (var key in snapshot)
		switch (key) {
			case 'DOM':
				merge(element[key], snapshot[key])
			case 'next':
			case 'prev':
				break
			default:
				element[key] = snapshot[key]	
		}
}

/**
 * @param {Element} element
 * @param {number} signature
 */
function commitDetach (element, signature) {
	if (element.flag !== ElementText) {
		var index = 0
		var children = element.children
		var length = children.length
		var next = children.next

		while (index++ < length)
			switch (next.flag) {
				case ElementComponent:
					if (next.owner[LifecycleWillUnmount])
						lifecycleMount(next, LifecycleWillUnmount)
				default:
					commitDetach(next, MountAppend)
					next = next.next
			}
	}

	if (element.ref)
		commitRef(element, element.ref, RefRemove)

	if (signature < MountReplace) {
		element.context = null
		element.state = null
		element.event = null
		element.DOM = null
	}
}

/**
 * @param {Element} element
 * @param {(function|string)?} callback
 * @param {number} signature
 * @param {*} key
 */
function commitRef (element, callback, signature, key) {
	switch (typeof callback) {
		case 'string':
			return commitRef(element, componentRef, signature, callback)			
		case 'function':
			switch (signature) {
				case RefRemove:
					return lifecycleCallback(element.host, callback, element.ref = null, key, element)
				case RefAssign:
					element.ref = callback
					return lifecycleCallback(element.host, callback, element.instance || DOMTarget(element), key, element)
				case RefReplace:
					commitRef(element, callback, RefRemove, key)
					commitRef(element, callback, RefAssign, key)
			}
			break
		default:
			commitRef(element, element.ref || noop, RefRemove, key)
	}
}

/**
 * @param {Element} element
 * @param {string} type
 * @param {(function|EventListener)} callback
 */
function commitEvent (element, type, callback) {
	if (!element.event)
		DOMEvent((element.event = {}, element), type)

	element.event[type] = callback
}

/**
 * @param {Element} element
 * @param {number} props
 * @param {number} signature
 */
function commitProps (element, props, signature) {
	for (var key in props)
		if (key === 'ref')
			commitRef(element, props[key], signature)
		else if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110)
			commitEvent(element, key.substring(2).toLowerCase(), props[key])
		else
			DOMProperties(element, key, props[key], element.xmlns)
}

/**
 * @param {Element} element
 * @return {Object}
 */
function commitDOM (element) {
	try {
		return element.flag === ElementNode ? DOMElement(element) : DOMText(element)
	} catch (e) {
		return commitDOM(commitElement(errorBoundary(element, e, LifecycleRender, 1)))
	}
}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function commitValue (element, value) {
	DOMValue(element, value)
}

/**
 * @param {Element} element
 */
function commitContent (element) {
	DOMContent(element)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitRemove (element, parent) {
	if (element.flag > ElementIntermediate)
		DOMRemove(element, parent)
	else
		element.children.forEach(function (children) {
			commitRemove(children, element.flag < ElementPortal ? parent : element)
		})
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function commitInsert (element, sibling, parent) {
	if (sibling.flag < ElementIntermediate)
		return commitInsert(element, elementNext(sibling, MountInsert), parent)

	if (element.flag > ElementIntermediate)
		DOMInsert(element, sibling, parent)
	else if (element.flag < ElementPortal)
		element.children.forEach(function (children) {
			commitInsert(children, sibling, parent)
		})
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitAppend (element, parent) {
	if (parent.flag < ElementPortal)
		return commitInsert(element, elementNext(parent, MountAppend), parent)

	if (element.flag > ElementIntermediate)
		DOMAppend(element, parent)
	else if (element.flag < ElementPortal)
		element.children.forEach(function (children) {
			commitAppend(children, parent)
		})
}
