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
 * @param {number} signature
 * @param {number} mode
 */
function commitChildren (element, sibling, host, signature, mode) {
	var children = element.children
	var length = children.length
	var next = children.next

	while (length-- > 0) {
		commitMount(next, sibling, element, host, signature, mode)
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

 	switch (element.id) {
 		case SharedElementComponent:
 			element.work = SharedWorkTask
 			
 			commitMount(mountComponent(element), sibling, parent, element, signature, mode)
 			element.DOM = getElementChildren(element).DOM

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
 			commitChildren(element, sibling, host, signature, mode)
 			element.DOM = commitCreate(element)
 			return
 		case SharedElementNode:
 			element.xmlns = getDOMType(element, parent.xmlns)
 		case SharedElementText:
 			switch (mode) {
 				case SharedMountClone:
 					if (element.DOM = commitQuery(element, parent, element.id === SharedElementText))
	 					break
 				default:
 					element.DOM = commitCreate(element)
 					
 					if (signature < SharedMountInsert)
 						commitAppend(element, parent)
 					else
 						commitInsert(element, sibling, parent)
 			}

 			if (element.id === SharedElementText)
 				return
 	}

 	commitChildren(element, element, host, SharedMountAppend, mode)
 	commitProperties(element, element.props, SharedPropsMount)
}

/**
 * @param {Element} element
 * @param {number} signature
 * @param {boolean}
 */
function commitDismount (element, signature) {
	switch (element.id) {
		case SharedElementComponent:
			unmountComponent(element)
			commitDismount(getElementChildren(element), -signature)
		case SharedElementText:
			break
		default:
			var children = element.children
			var length = children.length

			while (length-- > 0)
				commitDismount(children = children.next, -signature)
	}

	if (element.ref)
		commitReference(element, element.ref, SharedReferenceRemove)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 * @return {(Promise|void)}
 */
function commitUnmount (element, parent, signature) {
	if (signature > SharedElementEmpty)
		commitDismount(element, signature)

	if (element.id !== SharedElementComponent)
		return commitRemove(element, parent)

	if (element.state)
		return element.state
			.then(commitWillUnmount(element, parent, SharedElementEmpty))
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
	return function (e) {
		commitUnmount(getElementChildren(element), parent)

		if (signature === SharedErrorPassive)
			invokeErrorBoundary(element, e, SharedSiteAsync+':'+SharedComponentWillUnmount, signature)
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitWillReconcile (element, snapshot) {
	snapshot.type.then(function (value) {
		if (hasDOMNode(element))
			if (element.id === SharedElementPromise)
				reconcileChildren(element, createElementFragment(commitElement(value)))
			else
				reconcileElement(element, commitElement(value))
	}).catch(function (e) {
		invokeErrorBoundary(element, e, SharedSiteAsync+':'+SharedSiteRender, SharedErrorActive)
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
	if (signature === SharedMountReplace)
		if (element.state instanceof Promise)
			return element.state = commitWillReplace(element, snapshot, parent, host, signature)
		else if (element.state = commitUnmount(element, parent, signature))
			return commitWillReplace(element, snapshot, parent, host, -signature)

	commitMount(snapshot, getElementSibling(element, SharedSiblingNext), parent, host, SharedMountInsert, SharedMountCommit)
	
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
 * @param {Element} parent
 * @param {Element} host
 * @param {number} signature
 */
function commitWillReplace (element, snapshot, parent, host, signature) {
	return void element.state.then(function () {
		commitReplace(element, snapshot, parent, host, signature)
	}).catch(function () {
		invokeErrorBoundary(snapshot, e, SharedSiteRender, SharedErrorActive)
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
			return commitReference(element, setComponentReference, signature, callback)			
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
 * @return {Object}
 */
function commitCreate (element) {
	try {
		switch (element.id) {
			case SharedElementNode:
				return createDOMElement(element)
			case SharedElementText:
				return createDOMText(element)
			default:
				return createDOMObject(getDOMNode(getElementBoundary(element, SharedSiblingNext)))
		}
	} catch (e) {
		return commitDOMNode(commitElement(invokeErrorBoundary(element, e, SharedSiteRender, SharedErrorActive)))
	}
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {boolean} signature
 * @return {DOM?}
 */
function commitQuery (element, parent, signature) {
	if (signature && element.children.length === 0)
		return null

	return getDOMQuery(
		element, 
		parent, 
		getElementSibling(element, SharedSiblingPrevious), 
		getElementSibling(element, SharedSiblingNext), 
		signature
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
		return commitInsert(element, sibling, getElementParent(parent))

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
		if (hasDOMNode(parent))
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
