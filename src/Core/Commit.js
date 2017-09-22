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
				return createElementFragment(element)
			case String:
			case Number:
				return createElementText(element, SharedTypeKey)
			default:
				return createElementBranch(element, SharedTypeKey)
		}

	return createElementText('', SharedTypeKey)
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} host
 * @param {number} operation
 * @param {number} signature
 */
function commitChildren (element, sibling, host, operation, signature) {
	var children = element.children
	var length = children.length
	var next = children.next

	while (length-- > 0) {
		commitMount(next, sibling, element, host, operation, signature)
		next = next.next
	}
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 * @param {Element} host
 * @param {number} operation
 * @param {number} signature
 */
function commitMount (element, sibling, parent, host, operation, signature) {
	element.host = host
	element.parent = parent
	element.context = host.context

 	switch (element.id) {
 		case SharedElementComponent:
 			element.work = SharedWorkTask
 			
 			commitMount(mountComponent(element), sibling, parent, element, operation, signature)
 			element.DOM = commitCreate(element)

 			if (element.ref)
 				commitReference(element, element.ref, SharedReferenceAssign)
 			
 			if (element.owner[SharedComponentDidMount])
 				getLifecycleMount(element, SharedComponentDidMount)

 			element.work = SharedWorkSync
 			return
 		case SharedElementPromise:
 			commitWillReconcile(element, element)
 		case SharedElementFragment:
 		case SharedElementPortal:
 			element.DOM = parent.DOM
 			commitChildren(element, sibling, host, operation, signature)
 			element.DOM = commitCreate(element)
 			return
 		case SharedElementNode:
 			element.xmlns = getDOMType(element, parent.xmlns)
 		case SharedElementText:
 			switch (signature) {
 				case SharedMountClone:
 					if (element.DOM = commitQuery(element, parent))
	 					break
 				default:
 					element.DOM = commitCreate(element)

					if (operation === SharedMountAppend)
						commitAppend(element, parent)
					else
						commitInsert(element, sibling, parent)
 			}

 			if (element.id === SharedElementText)
 				return
 	}

 	commitChildren(element, element, host, SharedMountAppend, signature)
 	commitProperties(element, getDOMProps(element), SharedPropsMount)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitDismount (element, parent, signature) {
	switch (element.active = false, element.id) {
		case SharedElementComponent:
			commitDismount(getElementChildren(element), parent, -signature)
			unmountComponent(element)
		case SharedElementText:
			break
		case SharedElementPortal:
			if (signature < SharedElementEmpty)
				if (parent.id > SharedElementEmpty)
					commitRemove(element, parent)
		default:
			var children = element.children
			var length = children.length

			while (length-- > 0)
				commitDismount(children = children.next, element, -signature)
	}

	if (element.ref)
		commitReference(element, element.ref, SharedReferenceRemove)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitUnmount (element, parent, signature) {
	if (signature > SharedElementEmpty)
		commitDismount(element, parent, signature)

	if (element.id !== SharedElementComponent)
		return commitRemove(element, parent)

	if (element.state)
		return element.state = void element.state
			.then(commitWillUnmount(element, parent, SharedErrorActive))
			.catch(commitWillUnmount(element, parent, SharedErrorPassive))

	commitUnmount(getElementChildren(element), parent, SharedElementEmpty)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 * @return {function}
 */
function commitWillUnmount (element, parent, signature) {
	if (signature === SharedErrorPassive)
		element.host = createElementImmutable(element.host)

	if (element.id === SharedElementComponent)
		return commitWillUnmount(merge(getElementChildren(element), {
			DOM: createDOMObject(getDOMNode(element))
		}), parent, signature)
	
	return function (err) {
		commitUnmount(element, parent)

		if (signature === SharedErrorPassive)
			invokeErrorBoundary(element.host, err, SharedSiteAsync+':'+SharedComponentWillUnmount, signature)
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitWillReconcile (element, snapshot) {
	snapshot.type.then(function (value) {
		if (element.active)
			if (element.id === SharedElementPromise)
				reconcileChildren(element, createElementFragment(commitElement(value)))
			else
				reconcileElement(element, commitElement(value))
	}).catch(function (err) {
		invokeErrorBoundary(element, err, SharedSiteAsync+':'+SharedSiteRender, SharedErrorActive)
	})
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} parent
 * @param {Element} host
 * @param {number} signature
 */
function commitReplace (element, snapshot, parent, host, signature) {
	commitMount(snapshot, element, parent, host, SharedMountInsert, SharedMountCommit)
	commitUnmount(element, parent, signature)		
	
	for (var key in snapshot)
		switch (key) {
			case 'DOM':
				merge(element[key], snapshot[key])
			case SharedSiblingNext:
			case SharedSiblingPrevious:
				break
			default:
				element[key] = snapshot[key]	
		}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element}
 */
function commitRebase (element, snapshot) {
	return assign(element, snapshot, {
		key: element.key, 
		prev: element.prev, 
		next: element.next,
		host: element.host,
		parent: element.parent
	})
}

/**
 * @param {Element} element
 * @param {(function|string)?} callback
 * @param {number} signature
 * @param {*} key
 */
function commitReference (element, callback, signature, key) {
	switch (typeof callback) {
		case 'string':
			if (signature === SharedReferenceRemove)
				return commitReference(element, setComponentReference, SharedReferenceRemove, callback)
			else
				return commitReference(element, setComponentReference, SharedReferenceDispatch, callback)
		case 'function':
			switch (signature) {
				case SharedReferenceRemove:
					return getLifecycleCallback(element.host, callback, element.ref = null, key, element)
				case SharedReferenceAssign:
					element.ref = callback
				case SharedReferenceDispatch:
					return getLifecycleCallback(element.host, callback, element.instance || getDOMNode(element), key, element)
				case SharedReferenceReplace:
					commitReference(element, callback, SharedReferenceRemove, key)
					commitReference(element, callback, SharedReferenceAssign, key)
			}
			break
		default:
			commitReference(element, element.ref || noop, SharedReferenceRemove, key)
	}
}

/**
 * @param {Element} element
 * @param {string} type
 * @param {(function|EventListener)} callback
 */
function commitEvent (element, type, callback) {
	if (!element.event)
		element.event = {}

	if (!element.event[type])
		setDOMEvent(element, type)

	element.event[type] = callback
}

/**
 * @param {Element} element
 * @param {number} props
 * @param {number} signature
 */
function commitProperties (element, props, signature) {
	for (var key in props)
		switch (key) {
			case 'ref':
				commitReference(element, props[key], signature)
			case 'key':
			case 'xmlns':
			case 'children':
				break
			default:
				if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110)
					commitEvent(element, key.substring(2).toLowerCase(), props[key])
				else
					setDOMProperties(element, key, props[key], element.xmlns)
		}
}

/**
 * @param {Element} element
 */
function commitCreate (element) {
	try {
		switch (element.active = true, element.id) {
			case SharedElementNode:
				return createDOMElement(element)
			case SharedElementText:
				return createDOMText(element)
			case SharedElementComponent:
				return getElementChildren(element).DOM
			default:
				return createDOMObject(getDOMNode(getElementBoundary(element, SharedSiblingNext)))
		}
	} catch (err) {
		return commitCreate(commitRebase(element, invokeErrorBoundary(element, err, SharedSiteElement, SharedErrorActive)))
	}
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @return {Object?}
 */
function commitQuery (element, parent) {	
	if (element.active = true)
		return getDOMQuery(
			element,
			parent,
			getElementSibling(element, SharedSiblingPrevious),
			getElementSibling(element, SharedSiblingNext)
		)
}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function commitValue (element, value) {
	setDOMValue(element, value)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitRemove (element, parent) {
	if (parent.id < SharedElementEmpty)
		return commitRemove(element, getElementParent(parent))

	if (element.id > SharedElementEmpty)
		removeDOMNode(element, parent)
	else
		getElementChildren(element).forEach(function (children) {
			commitRemove(children, element)
		})
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function commitInsert (element, sibling, parent) {
	if (parent.id < SharedElementEmpty)
		if (parent.id !== SharedElementPortal || sibling.parent === parent)
			return commitInsert(element, sibling, getElementParent(parent))
		else if (!parent.active)
			return commitInsert(element, createElementNode(SharedDOMObject), getElementParent(parent))
		else
			return

	if (sibling.id === SharedElementPortal)
		return commitInsert(element, getElementSibling(sibling, SharedSiblingNext), parent)

	if (element.id > SharedElementEmpty)
		insertDOMNode(element, sibling, parent)
	else
		getElementChildren(element).forEach(function (children) {
			commitInsert(children, sibling, element)
		})
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitAppend (element, parent) {
	if (parent.id < SharedElementEmpty)
		if (parent.active)
			return commitInsert(element, getElementBoundary(parent, SharedSiblingPrevious), parent)
		else
			return commitAppend(element, getElementParent(parent))

	if (element.id > SharedElementEmpty)
		appendDOMNode(element, parent)
	else
		getElementChildren(element).forEach(function (children) {
			commitAppend(children, element)
		})
}
