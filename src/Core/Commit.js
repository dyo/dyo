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
			reconcileChildren(element, elementFragment(commitElement(value)))
		else
			reconcileElement(element, commitElement(value))
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
 * @param {Element} parent
 * @return {string}
 */
function commitXmlns (element, parent) {
	switch (element.type) {
		case 'svg':
			return 'http://www.w3.org/2000/svg'
		case 'math':
			return 'http://www.w3.org/1998/Math/MathML'
	}

	return parent.xmlns && !element.xmlns && parent.type !== 'foreignObject' ? parent.xmlns : ''
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

 			if ((element.DOM = element.children.DOM, element.ref)) 
 				commitReference(element, element.ref, 1)
 			
 			if (element.owner[LifecycleDidMount]) 
 				lifecycleMount(element, LifecycleDidMount)

 			element.work = WorkSync
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
 			element.xmlns = commitXmlns(element, parent)
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
 * @param {(boolean|void)}
 */
function commitUnmount (element, parent, signature) {
	if (element.flag === ElementComponent)
		return componentUnmount(element, element.children, parent, signature, 1)

	commitRemove(element, parent)
	commitDemount(element, 1, signature)
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

	if (element.ref)
		commitReference(element, element.ref, -1)

	if (signature < 1) {
		element.context = null
		element.state = null
		element.event = null
		element.DOM = null
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitMerge (element, snapshot) {
	if (commitUnmount(element, element.parent, 1))
		element.state.then(function () {
			commitRebase(element, snapshot)
		})
	else
		commitRebase(element, snapshot)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitRebase (element, snapshot) {
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
 */
function commitProperties (element) {
	var xmlns = element.xmlns
	var props = element.props

	for (var key in props)
		commitProperty(element, key, props[key], xmlns, props[key] != null ? 1 : 0)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {boolean} xmlns
 * @param {number} signature
 */
function commitProperty (element, name, value, xmlns, signature) {	
	switch (name) {
		case 'ref':
			commitReference(element, value, signature)
		case 'key':
		case 'xmlns':
		case 'children':
			break
		case 'className':
			if (xmlns)
				return commitProperty(element, 'class', value, !xmlns, signature)
		case 'id':
			return commitAttribute(element, name, value, xmlns, 3, signature)
		case 'innerHTML':
			return commitAttribute(element, name, value, xmlns, 2, signature)
		case 'dangerouslySetInnerHTML':
			if (signature > 1 && (!value || !element.props[name] || element.props[name].__html !== value.__html))
				return

			return commitProperty(element, 'innerHTML', value ? value.__html : '', xmlns, 2, signature)
		case 'xlink:href':
			return commitAttribute(element, name, value, xmlns, 1, signature)
		case 'style':
			if (typeof value === 'object' && value !== null)
				return commitStyle(element, name, value, 0)
		default:
			if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110)
				return commitEvent(element, name.toLowerCase(), value, signature)

			commitAttribute(element, name, value, xmlns, 4, signature)
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
			if (element.event != null && element.event.length > 0) {
				delete element.event[type]

				if (--element.event.length === 0)
					DOMEvent(element, type.substring(2), element.event, 0)
			}
			break
		case 0:
			commitEvent(element, type, listener, signature-1)
		case 1:
			if (element.event == null)
				element.event = new Event(element)

			element.event[type] = listener
			element.event.length++

			DOMEvent(element, type.substring(2), element.event, 1)
	}
}

/**
 * @param {Element} element
 * @return {Object}
 */
function commitDOM (element) {
	try {
		return element.flag === ElementNode ? DOMElement(element) : DOMText(element.children)
	} catch (e) {
		return commitDOM(errorBoundary(element, e, LifecycleRender))
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {Object} value
 * @param {number} signature
 */
function commitStyle (element, name, value, signature) {
	DOMStyle(element, name, value, signature)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {boolean} xmlns
 * @param {number} signature
 * @param {boolean} hash
 */
function commitAttribute (element, name, value, xmlns, hash, signature) {
	DOMAttribute(element, name, value, xmlns, hash, signature)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitText (element, snapshot) {
	DOMValue(element, element.children = snapshot.children)
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
