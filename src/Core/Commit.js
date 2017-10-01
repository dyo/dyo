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
			element.work = SharedWorkMounting

			commitMount(mountComponentElement(element), sibling, parent, element, operation, signature)
			commitCreate(element)

			if (element.ref)
				commitReference(element, element.ref, SharedReferenceDispatch)

			if (element.owner[SharedComponentDidMount])
				getLifecycleMount(element, SharedComponentDidMount)

			element.work = SharedWorkIdle
			return
		case SharedElementPromise:
			commitWillReconcile(element, element)
		case SharedElementPortal:
		case SharedElementFragment:
			setDOMNode(element, element.id !== SharedElementPortal ? getDOMNode(parent) : getDOMPortal(element))
			commitChildren(element, sibling, host, operation, signature)
			commitCreate(element)
			return
		case SharedElementNode:
			element.xmlns = getDOMType(element, parent.xmlns)
		default:
			switch (signature) {
				case SharedMountQuery:
					if (commitQuery(element, parent))
						break
				default:
					commitCreate(element)

					if (operation === SharedMountAppend)
						commitAppend(element, parent)
					else
						commitInsert(element, sibling, parent)
			}

			if (element.id !== SharedElementNode)
				return
	}

	commitChildren(element, sibling, host, SharedMountAppend, signature)
	commitProperties(element, getDOMProps(element), SharedPropsMount)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitDismount (element, parent, signature) {
	switch (element.id) {
		case SharedElementComponent:
			commitDismount(element.children, parent, -signature)
			unmountComponentElement(element)
		case SharedElementText:
		case SharedElementEmpty:
			break
		case SharedElementPortal:
			if (signature < SharedElementIntermediate && parent.id > SharedElementIntermediate)
				commitRemove(element, parent)
		default:
			var children = element.children
			var length = children.length

			while (length-- > 0)
				commitDismount(children = children.next, element, -signature)
	}

	if (element.ref)
		commitReference(element, element.ref, SharedReferenceRemove)

	element.active = false
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitUnmount (element, parent, signature) {
	if (signature > SharedElementIntermediate)
		commitDismount(element, parent, signature)

	if (element.id !== SharedElementComponent)
		return commitRemove(element, parent)

	if (element.state)
		return element.state = void element.state
			.then(commitWillUnmount(element, parent, element, SharedErrorPassive))
			.catch(commitWillUnmount(element, parent, element, SharedErrorActive))

	commitUnmount(element.children, parent, SharedElementIntermediate)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {Element} host
 * @param {number} signature
 * @return {function}
 */
function commitWillUnmount (element, parent, host, signature) {
	if (element.id === SharedElementComponent)
		return commitWillUnmount(element.children, parent, merge({}, host), signature)

	setDOMNode(element, getDOMNode(host))

	return function (err) {
		commitUnmount(element, parent, SharedMountRemove)

		if (signature === SharedErrorActive)
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
			reconcileChildren(element, createElementFragment(getElementDefinition(value)))
	}).catch(function (err) {
		invokeErrorBoundary(element, err, SharedSiteAsync+':'+SharedSiteRender, SharedErrorActive)
	})
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} parent
 * @param {Element} host
 */
function commitReplace (element, snapshot, parent, host) {
	commitMount(snapshot, element, parent, host, SharedMountInsert, SharedMountCommit)
	commitUnmount(element, parent, SharedMountRemove)

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
				return setDOMNode(element, createDOMElement(element))
			case SharedElementText:
				return setDOMNode(element, createDOMText(element))
			case SharedElementEmpty:
				return setDOMNode(element, createDOMEmpty(element))
			case SharedElementComponent:
				element.DOM = element.children.DOM
			case SharedElementPortal:
				break
			default:
				element.DOM = getElementBoundary(element, SharedSiblingNext).DOM
		}
	} catch (err) {
		return commitCreate(commitRebase(element, invokeErrorBoundary(element, err, SharedSiteElement, SharedErrorActive)))
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
 * @param {Element} parent
 * @return {boolean}
 */
function commitQuery (element, parent) {
	setDOMNode(
		element,
		getDOMQuery(
			element,
			parent,
			getElementSibling(element, parent, SharedSiblingPrevious),
			getElementSibling(element, parent, SharedSiblingNext)
		)
	)

	return element.active = !!getDOMNode(element)
}

/**
 * @param {Element} element
 * @param {string} value
 */
function commitValue (element, value) {
	setDOMValue(element, value)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitRemove (element, parent) {
	if (parent.id < SharedElementPortal)
		return commitRemove(element, getElementParent(parent))

	if (element.id > SharedElementIntermediate)
		removeDOMNode(element, parent)
	else
		element.children.forEach(function (children) {
			commitRemove(getElementDescription(children), element)
		})
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function commitInsert (element, sibling, parent) {
	if (parent.id < SharedElementIntermediate)
		if (parent.id < SharedElementPortal)
			return commitInsert(element, sibling, getElementParent(parent))
		else if (parent !== sibling.parent)
			if (!parent.active)
				return commitAppend(element, parent)
			else
				return

	switch (sibling.id) {
		case SharedElementComponent:
			return commitInsert(element, getElementDescription(sibling), parent)
		case SharedElementPortal:
			return commitInsert(element, getElementSibling(sibling, parent, SharedSiblingNext), parent)
		case SharedElementIntermediate:
			return commitAppend(element, parent)
	}

	switch (element.id) {
		case SharedElementNode:
		case SharedElementText:
		case SharedElementEmpty:
			return insertDOMNode(element, sibling, parent)
		case SharedElementComponent:
			return commitInsert(getElementDescription(element), sibling, parent)
	}

	element.children.forEach(function (children) {
		commitInsert(getElementDescription(children), sibling, element)
	})
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitAppend (element, parent) {
	if (parent.id < SharedElementIntermediate)
		if (parent.active)
			return commitInsert(element, getElementBoundary(parent, SharedSiblingPrevious), parent)
		else if (parent.id < SharedElementPortal)
			return commitAppend(element, getElementParent(parent))

	switch (element.id) {
		case SharedElementNode:
		case SharedElementText:
		case SharedElementEmpty:
			return appendDOMNode(element, parent)
		case SharedElementComponent:
			return commitAppend(getElementDescription(element), parent)
	}

	element.children.forEach(function (children) {
		commitAppend(getElementDescription(children), element)
	})
}
