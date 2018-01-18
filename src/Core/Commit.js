/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitReplace (element, snapshot) {
	var host = element.host
	var parent = element.parent
	var sibling = getElementSibling(element, parent, SharedSiblingNext)

	commitUnmount(element, parent, SharedMountRemove)
	commitMount(snapshot, sibling, parent, host, SharedMountInsert, SharedMountCommit)

	if (host.children !== element) {
		replaceElementChildren(parent.children, element, snapshot)
	} else {
		host.children = snapshot

		while (getClientNode(host) === getClientNode(element)) {
			setClientNode(host, getClientNode(snapshot))
			host = host.host
		}
	}
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
			element.work = SharedWorkMounting

			commitMount(mountComponentElement(element), sibling, parent, element, operation, signature)
			commitCreate(element)

			element.work = SharedWorkIdle

			if (element.ref)
				commitRefs(element, element.ref, SharedReferenceDispatch)

			if (element.owner[SharedComponentDidMount])
				getLifecycleMount(element, SharedComponentDidMount)

			return
		case SharedElementPromise:
			commitWillReconcile(element, element)
		case SharedElementPortal:
		case SharedElementFragment:
			setClientNode(element, element.id !== SharedElementPortal ? getClientNode(parent) : getClientPortal(element))
			commitChildren(element, sibling, host, operation, signature)
			commitCreate(element)
			return
		case SharedElementNode:
			element.xmlns = getClientType(element, parent.xmlns)
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
	commitProps(element, getClientProps(element), SharedPropsMount)
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
		commitRefs(element, element.ref, SharedReferenceRemove)

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
		return commitWillUnmount(element.children, parent, host, signature)

	return function (err) {
		commitUnmount(element, parent, SharedMountRemove)

		if (signature === SharedErrorActive)
			invokeErrorBoundary(host, err, SharedSiteAsync+':'+SharedComponentWillUnmount, signature)
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitWillReconcile (element, snapshot) {
	snapshot.type.then(function (value) {
		if (element.active)
			reconcileChildren(element, getElementModule(value))
	}).catch(function (err) {
		invokeErrorBoundary(element, err, SharedSiteAsync+':'+SharedSiteRender, SharedErrorActive)
	})
}

/**
 * @param {Element} element
 * @param {number} props
 * @param {number} signature
 */
function commitProps (element, props, signature) {
	for (var key in props)
		switch (key) {
			case 'ref':
				commitRefs(element, props[key], signature)
			case 'key':
			case 'xmlns':
			case 'children':
				break
			default:
				if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.length > 2)
					commitEvents(element, key.substring(2).toLowerCase(), props[key])
				else
					setClientProps(element, key, props[key], element.xmlns)
		}
}

/**
 * @param {Element} element
 * @param {string} type
 * @param {(function|EventListener)} callback
 */
function commitEvents (element, type, callback) {
	if (!element.event)
		element.event = {}

	if (!element.event[type])
		setClientEvent(element, type)

	element.event[type] = callback
}

/**
 * @param {Element} element
 * @param {(function|string)?} callback
 * @param {number} signature
 * @param {*} key
 */
function commitRefs (element, callback, signature, key) {
	switch (typeof callback) {
		case 'string':
			if (signature === SharedReferenceRemove)
				return commitRefs(element, setComponentRefs, SharedReferenceRemove, callback)
			else
				return commitRefs(element, setComponentRefs, SharedReferenceDispatch, callback)
		case 'function':
			switch (signature) {
				case SharedReferenceRemove:
					return getLifecycleCallback(element.host, callback, element.ref = null, key, element)
				case SharedReferenceAssign:
					element.ref = callback
				case SharedReferenceDispatch:
					return getLifecycleCallback(element.host, callback, element.instance || getClientNode(element), key, element)
				case SharedReferenceReplace:
					commitRefs(element, callback, SharedReferenceRemove, key)
					commitRefs(element, callback, SharedReferenceAssign, key)
			}
			break
		default:
			commitRefs(element, element.ref === callback ? noop : element.ref, SharedReferenceRemove, key)
	}
}

/**
 * @param {Element} element
 */
function commitCreate (element) {
	try {
		switch (element.active = true, element.id) {
			case SharedElementNode:
				return setClientNode(element, createClientElement(element))
			case SharedElementText:
				return setClientNode(element, createClientText(element))
			case SharedElementEmpty:
				return setClientNode(element, createClientEmpty(element))
			case SharedElementComponent:
				return setClientNode(element, getClientNode(element.children))
			case SharedElementPortal:
				break
			default:
				setClientNode(element, getClientNode(getElementBoundary(element, SharedSiblingNext)))
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
	setClientNode(
		element,
		getClientQuery(
			element,
			parent,
			getElementSibling(element, parent, SharedSiblingPrevious),
			getElementSibling(element, parent, SharedSiblingNext)
		)
	)

	return element.active = !!getClientNode(element)
}

/**
 * @param {Element} element
 * @param {string} value
 */
function commitText (element, value) {
	setClientText(element, value)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitRemove (element, parent) {
	if (parent.id < SharedElementPortal)
		return commitRemove(element, getElementParent(parent))

	if (element.id > SharedElementIntermediate)
		return removeClientNode(element, parent)

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
		else if (!parent.active)
			return commitAppend(element, parent)

	switch (sibling.id) {
		case SharedElementComponent:
			return commitInsert(element, getElementDescription(sibling), parent)
		case SharedElementPortal:
			return commitInsert(element, getElementSibling(sibling, parent, SharedSiblingNext), parent)
		case SharedElementFragment:
		case SharedElementPromise:
			return commitInsert(element, getElementBoundary(sibling, SharedSiblingNext), parent)
		case SharedElementIntermediate:
			return commitAppend(element, parent)
	}

	switch (element.id) {
		case SharedElementNode:
		case SharedElementText:
		case SharedElementEmpty:
			return insertClientNode(element, sibling, parent)
		case SharedElementComponent:
			return commitInsert(getElementDescription(element), sibling, parent)
		case SharedElementPortal:
			return
	}

	element.children.forEach(function (children) {
		commitInsert(getElementDescription(children), sibling, parent)
	})
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitAppend (element, parent) {
 if (parent.id < SharedElementPortal)
		return commitAppend(element, getElementParent(parent))

	switch (element.id) {
		case SharedElementNode:
		case SharedElementText:
		case SharedElementEmpty:
			return appendClientNode(element, parent)
		case SharedElementComponent:
			return commitAppend(getElementDescription(element), parent)
		case SharedElementPortal:
			return
	}

	element.children.forEach(function (children) {
		commitAppend(getElementDescription(children), parent)
	})
}
