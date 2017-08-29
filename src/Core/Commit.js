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
 * @param {Element} sibling
 * @param {Element} host
 */
function commitChildren (element, sibling, host) {
	var children = element.children
	var length = children.length
	var next = children.next

	while (length-- > 0) {
		commitMount(!next.DOM ? next : merge(new Element(ElementNode), next), sibling, element, host, 0)
		next = next.next
	}
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 * @param {Element} host
 * @param {number} signature
 */
function commitMount (element, sibling, parent, host, signature) {
	element.host = host
	element.parent = parent
	element.context = host.context

 	switch (element.flag) {
 		case ElementComponent:
 			element.work = WorkTask
 			
 			componentMount(element)

 			if (element.owner[LifecycleWillMount]) 
 				lifecycleMount(element, LifecycleWillMount)

 			commitMount(element.children, sibling, parent, element, signature)

 			element.DOM = element.children.DOM

 			if (element.ref)
 				commitRef(element, element.ref, 1)
 			
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
 			element.DOM = DOM(DOMNode(parent))
 			break
 		case ElementNode:
 			element.xmlns = DOMScope(element.type, parent.xmlns)
 		case ElementText:
 			element.DOM = commitDOM(element)
 			
 			if (signature < 1) 
 				commitAppend(element, parent)
 			else
 				commitInsert(element, sibling, parent)
 
 			if (element.flag > ElementNode)
 				return
 	}

	commitChildren(element, element, host)
	commitProps(element, element.props, 1)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitUnmount (element, parent, signature) {
	if (element.flag === ElementComponent)
		return componentUnmount(element, element.children, parent, signature, 1)

	commitRemove(element, parent)
	commitDetach(element, signature)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {number} signature
 */
function commitReplace (element, snapshot, signature) {
	if (signature > 0 && commitUnmount(element, element.parent, 1))
		return void element.state.then(function () {
			commitReplace(element, snapshot, 0)
		})

	commitMount(snapshot, elementSibling(element, 0), element.parent, element.host, 1)

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
					commitDetach(next, 1)
					next = next.next
			}
	}

	if (element.ref)
		commitRef(element, element.ref, -1)

	if (signature < 1) {
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
				case -1:
					return lifecycleCallback(element.host, callback, element.ref = null, key, element)
				case 0:
					element.ref = callback
				case 1:
					return lifecycleCallback(element.host, callback, element.instance || findDOMNode(element), key, element)
				case 2:
					commitRef(element, callback, -1, key)
					commitRef(element, callback, 0, key)
			}
			break
		default:
			commitRef(element, element.ref || noop, -1, key)
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
 * @param {Object} props
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
		return commitDOM(errorBoundary(element, e, LifecycleRender, 1))
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
		return commitInsert(element, elementSibling(sibling, 1), parent)

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
		return commitInsert(element, elementSibling(parent, 0), parent)

	if (element.flag > ElementIntermediate)
		DOMAppend(element, parent)
	else if (element.flag < ElementPortal)
		element.children.forEach(function (children) {
			commitAppend(children, parent)
		})
}
