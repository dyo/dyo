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
 * @return {Object}
 */
function commitDOM (element) {
	try {
		return element.flag === ElementNode ? DOMElement(element.type, element.xmlns) : DOMText(element.children)
	} catch (e) {
		return commitDOM(errorBoundary(element, e, LifecycleRender))
	}
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
 			element.sync = PriorityTask
 			
 			componentMount(element)

 			if (element.owner[LifecycleWillMount]) 
 				lifecycleMount(element, LifecycleWillMount)

 			commitMount(element.children, sibling, parent, element, signature)

 			if ((element.DOM = element.children.DOM, element.ref)) 
 				commitReference(element, element.ref, 1)
 			if (element.owner[LifecycleDidMount]) 
 				lifecycleMount(element, LifecycleDidMount)

 			element.sync = PriorityHigh
 			return
 		case ElementPortal:
 			element.DOM = {node: element.type}
 			break
 		case ElementPromise:
 			commitPromise(element, element)
 		case ElementFragment:
 			element.DOM = {node: parent.DOM.node}
 			break
 		case ElementNode:
 			switch (element.type) {
 				case 'svg':
 					element.xmlns = NSSvg
 					break
 				case 'math':
 					element.xmlns = NSMathML
 					break
 				default:
 					if (parent.xmlns && !element.xmlns && parent.type !== 'foreignObject')
						element.xmlns = parent.xmlns
 			}
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
	commitProperties(element)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitUnmount (element, parent, signature) {
	if (element.flag !== ElementComponent) {
		commitRemove(element, parent)
		commitDemount(element, 1, signature)
	} else
		componentUnmount(element, element.children, parent, signature, 1)
}

/**
 * @param {Element} element
 * @param {number} flag
 * @param {number} signature
 */
function commitDemount (element, flag, signature) {
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
						commitDemount(next, 1, 1)
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
 * @param {Element} snapshot
 */
function commitMerge (element, snapshot) {
	commitMount(snapshot, element, element.parent, element.host, 1)	
	commitUnmount(element, element.parent, 1)

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
 */
function commitProperties (element) {
	var props = element.props
	var xmlns = !!element.xmlns
	var value = null

	for (var key in props)
		if ((value = props[key]) != null)
			commitProperty(element, key, value, 1, xmlns)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {number} signature
 * @param {boolean} xmlns
 */
function commitProperty (element, name, value, signature, xmlns) {	
	switch (name) {
		case 'dangerouslySetInnerHTML':
			if (signature > 1 && (!value || !element.props[name] || element.props[name].__html !== value.__html))
				return
			else
				return commitProperty(element, 'innerHTML', value.__html, signature, xmlns)
		case 'ref':
			commitReference(element, value, signature)
		case 'key':
		case 'xmlns':
		case 'children':
			break
		case 'className':
			if (xmlns)
				return commitProperty(element, 'class', value, signature, !xmlns)
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
					return lifecycleCallback(element.host, callback, element.ref = null, key, element)
				case 0:
					element.ref = callback
				case 1:
					lifecycleCallback(element.host, callback, element.instance || element.DOM.node, key, element)
					break
				case 2:
					commitReference(element, callback, -1, key)
					commitReference(element, callback, 0, key)
			}
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitText (element, snapshot) {
	DOMValue(element.DOM, element.children = snapshot.children)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitRemove (element, parent) {
	if (element.flag > ElementIntermediate)
		DOMRemove(element.DOM, parent.DOM)
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
		DOMInsert(element.DOM, sibling.DOM, parent.DOM)
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
		DOMAppend(element.DOM, parent.DOM)
	else if (element.flag < ElementPortal)
		element.children.forEach(function (children) {
			commitAppend(children, parent)
		})
}
