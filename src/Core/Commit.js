/**
 * @param {*} element
 * @return {Element}
 */
function commitElement (element) {
	if (element != null)
		switch (element.constructor) {
			case Element:
				return element
			case List:
			case Array:
				return elementFragment(element)
			case String:
			case Number:
			case Date:
			case Error:
				return elementText(element)
			case Function:
			case Promise:
				return createElement(element)
			case Boolean:
			case Symbol:
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
			patchChildren(element, elementFragment(commitElement(value)))
		else
			patchElement(element, commitElement(value))
	})
}

/**
 * @param {Element} element
 * @return {DOM}
 */
function commitCreate (element) {
	try {
		return element.flag === ElementNode ? DOMElement(element.type, element.xmlns) : DOMText(element.children)
	} catch (e) {
		return commitCreate(Boundary(element, e, LifecycleRender))
	}
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 * @param {Element} composite
 * @param {number} signature
 * @return {Element}
 */
function commitMount (element, sibling, parent, composite, signature) {
	var node = null
	var children = null
	var owner = null
	var host = composite
	var flag = element.flag
	var length = 0

	element.host = host
	element.parent = parent
	element.context = host.context

 	if (flag === ElementComponent) {
 		componentMount((element.sync = PriorityTask, host = element))

 		if (element.owner[LifecycleWillMount])
 			lifecycleMount(element, LifecycleWillMount)
 	}

 	switch (children = element.children, flag) {
 		case ElementText:
 			element.DOM = commitCreate(element)
 			break
 		case ElementNode:
 			switch (element.type) {
 				case 'svg':
 					element.xmlns = NSSVG
 					break
 				case 'math':
 					element.xmlns = NSMathML
 					break
 				default:
 					if (element.xmlns === null)
 						element.xmlns = parent.xmlns
 			}

 			node = children.next
 			length = children.length

 			element.DOM = commitCreate(element)
 			break
 		case ElementPromise:
 			commitPromise(element, element)
 		case ElementPortal:
 			if (flag === ElementPortal)
 				element.DOM = {node: element.type}
 		case ElementFragment:
 			if (flag !== ElementPortal)
 				element.DOM = parent.DOM

 			node = children.next
 			length = children.length
 			break
 		case ElementComponent:
 			commitMount(children, sibling, parent, host, signature)
 			element.DOM = children.DOM
 	}

 	if (length > 0)
 		while (length-- > 0) {
 			if (node.DOM)
 				node = merge(new Element(ElementNode), node)

 			commitMount(node, node, element, host, 0)
 			node = node.next
 		}

 	if (flag >= ElementNode) {
 		switch (signature) {
 			case 0:
 				commitAppend(element, parent)
 				break
 			case 1:
 				commitInsert(element, sibling, parent)
 		}

 		if (flag !== ElementText)
 			patchProps(element, element, 0)
 	} else if (flag === ElementComponent) {
 		if (element.ref)
 			commitReference(element, element.ref, 1)

 		if (element.owner[LifecycleDidMount])
 			lifecycleMount(element, LifecycleDidMount)

 		element.sync = PriorityHigh
 	}
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitUnmount (element, parent, signature) {
	if (element.flag !== ElementComponent) {
		commitRemove(element, parent)
		commitRelease(element, 1, signature)
	} else
		componentUnmount(element, element.children, parent, signature, 1)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitMerge (element, snapshot) {
	commitMount(snapshot, element, element.parent, element.host, 1)	
	commitUnmount(element, element.parent, 2)

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
 * @param {number} flag
 * @param {number} signature
 */
function commitRelease (element, flag, signature) {
	switch (element.flag*flag) {
		case ElementText:
			break
		default:
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
						commitRelease(next, 1, 1)
						next = next.next
				}
	}

	if (signature < 1)
		element.context = element.DOM = null

	if (element.ref)
		commitReference(element, element.ref, -1)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitRemove (element, parent) {
	if (element.flag < ElementComponent)
		return element.children.forEach(function (children) {
			commitRemove(children, element.flag !== ElementPortal ? parent : element)
		})

	DOMRemove(element.DOM, parent.DOM)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitAppend (element, parent) {
	if (parent.flag < ElementPortal)
		return commitInsert(element, elementSibling(parent, 0), parent)

	if (element.flag < ElementComponent)
		return element.children.forEach(function (children) {
			commitAppend(children, parent)
		})

	DOMAppend(element.DOM, parent.DOM)
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function commitInsert (element, sibling, parent) {
	if (sibling.flag < ElementComponent)
		return commitInsert(element, elementSibling(sibling, 1), parent)

	if (element.flag < ElementComponent)
		return element.children.forEach(function (children) {
			commitInsert(children, sibling, parent)
		})

	DOMInsert(element.DOM, sibling.DOM, parent.DOM)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitText (element, snapshot) {
	DOMContent(element.DOM, element.children = snapshot.children)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {number} signature
 * @param {number} xmlns
 */
function commitProps (element, name, value, signature, xmlns) {	
	switch (name) {
		case 'dangerouslySetInnerHTML':
			if (signature > 1 && (!value || !element.props[name] || element.props[name].__html !== value.__html))
				return
			else
				return commitProps(element, 'innerHTML', value.__html, signature, xmlns)
		case 'ref':
			commitReference(element, value, signature)
		case 'key':
		case 'xmlns':
		case 'children':
			break
		case 'className':
			if (xmlns)
				return commitProps(element, 'class', value, signature, !xmlns)
		case 'id':
			return DOMAttribute(element.DOM, name, value, signature, xmlns, 3)
		case 'innerHTML':
			return DOMAttribute(element.DOM, name, value, signature, xmlns, 2)
		case 'xlink:href':
			return DOMAttribute(element, name, value, signature, xmlns, 1)
		case 'style':
			if (value != null && typeof value !== 'string') {
				if (signature > 1)
					return DOMAttribute(element.DOM, name, patchStyle(element.style, value), signature, xmlns, 0)
				else
					return DOMAttribute(element.DOM, name, element.style = value, signature, xmlns, 0)
			}
		default:
			if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110)
				return commitEvent(element, name.toLowerCase(), value, signature)

			DOMAttribute(element.DOM, name, value, signature, xmlns, 4)
	}
}

/**
 * @param {Element} element
 * @param {string} type
 * @param {(function|EventListener)} listener
 * @param {number} signature
 */
function commitEvent (element, type, listener, signature) {
	switch (signature) {
		case -1:
			if (element.event !== null && element.event.length > 0) {
				delete element.event[type]

				if (--element.event.length === 0)
					DOMEvent(element.DOM, type.substring(2), element.event, 0)
			}
			break
		case 0:
			commitEvent(element, type, listener, signature-1)
		case 1:
			if (element.event === null)
				element.event = new Event(element)

			element.event[type] = listener
			element.event.length++

			DOMEvent(element.DOM, type.substring(2), element.event, 1)
	}
}

/**
 * @param {Element} element
 * @param {Element} instance
 * @param {string} key
 * @param {(function|string)?} callback
 * @param {number} signature
 * @param {*} key
 */
function commitReference (element, callback, signature, key) {
	switch (typeof callback) {
		case 'string':
			return commitReference(element, componentReference, signature, callback)
		case 'undefined':
		case 'object':
			return commitReference(element, element.ref || noop, -1, key)
		case 'function':
			switch (signature) {
				case -1:
					return lifecycleCallback(element.host, callback, element.ref = null, callback, key, element)
				case 0:
					element.ref = callback
				case 1:
					lifecycleCallback(element.host, callback, element.DOM.node, key, element)
					break
				case 2:
					commitReference(element, callback, -1, key)
					commitReference(element, callback, 0, key)
			}
	}
}
