/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 * @param {Element} host
 * @param {number} operation
 * @param {number} signature
 */
function commitComponent (element, sibling, parent, host, operation, signature) {
	try {
		commitComponentChildren(mountComponentElement(element), sibling, parent, element, operation, signature)

		if (element.owner[SharedComponentDidMount])
			getLifecycleMount(element, SharedComponentDidMount, element.owner)

		if (element.ref)
			commitReference(element, element.ref, SharedRefsDispatch)
	} catch (err) {
		commitComponentChildren(getElementDefinition(), sibling, parent, host, operation, signature)
		replaceErrorBoundary(element, host, parent, err)
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
function commitComponentChildren (element, sibling, parent, host, operation, signature) {
	commitElement(host.children = element, sibling, parent, host, operation, signature)
	commitOwner(host)
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 * @param {Element} host
 * @param {number} operation
 * @param {number} signature
 */
function commitElement (element, sibling, parent, host, operation, signature) {
	element.host = host
	element.parent = parent

	switch (element.id) {
		case SharedElementComponent:
			return commitComponent(element, sibling, parent, host, operation, signature)
		case SharedElementPromise:
			commitPromise(element, host, element.type)
		case SharedElementFragment:
		case SharedElementPortal:
			element.owner = element.id !== SharedElementPortal ? parent.owner : getNodePortal(element)

			commitChildren(element, sibling, host, operation, signature)

			return commitOwner(element)
		case SharedElementCustom:
		case SharedElementNode:
			element.xmlns = getNodeType(element, parent.xmlns)
		default:
			switch (signature) {
				case SharedMountQuery:
					if (commitQuery(element, parent))
						break
				default:
					commitOwner(element)

					if (operation === SharedMountAppend)
						commitAppend(element, parent)
					else
						commitInsert(element, sibling, parent)
			}

			if (element.id > SharedElementNode)
				return
	}

	commitChildren(element, sibling, host, SharedMountAppend, signature)
	commitProps(element, getNodeProps(element), element.xmlns, SharedPropsMount)
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
		commitElement(next, sibling, element, host, operation, signature)
		next = next.next
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} host
 */
function commitReplace (element, snapshot, host) {
	var parent = element.parent
	var sibling = getElementSibling(element, parent, SharedLinkedNext)

	commitUnmount(element, parent)

	if (sibling.active)
		commitElement(snapshot, sibling, parent, host, SharedMountInsert, SharedMountCommit)
	else
		commitElement(snapshot, sibling, parent, host, SharedMountAppend, SharedMountCommit)

	if (snapshot.active)
		if (element !== host.children)
			replaceElementChildren(element, snapshot, parent.children)
		else
			host.children = snapshot
}

/**
 * @param {Element} element
 */
function commitOwner (element) {
	try {
		switch (element.id) {
			case SharedElementNode:
				element.owner = createNodeElement(element)
				break
			case SharedElementText:
				element.owner = createNodeText(element)
				break
			case SharedElementEmpty:
				element.owner = createNodeEmpty(element)
				break
			case SharedElementComment:
				element.owner = createNodeComment(element)
				break
			case SharedElementCustom:
				element.owner = createNodeComponent(element)
			case SharedElementComponent:
			case SharedElementPortal:
				break
			default:
				element.owner = getElementBoundary(element, SharedLinkedNext).owner
		}
	} catch (err) {
		throwErrorException(element, err, SharedSiteRender)
	} finally {
		element.active = true
	}
}

/**
 * @param {Element} element
 * @param {Element} host
 * @param {object} type
 */
function commitPromise (element, host, type) {
	type.then(function (value) {
		element.active && element.type === type && reconcileChildren(element, getElementModule(value), host)
	}, function (err) {
		invokeErrorBoundary(element, err, SharedSiteRender)
	})
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {Element} children
 */
function commitWillUnmount (element, parent, children) {
	element.cache.then(function () {
		commitRemove(children, parent)
	})
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitUnmount (element, parent) {
	if (!element.active)
		return

	commitDismount(element, element)

	if (element.id === SharedElementComponent)
		if (element.cache)
			return commitWillUnmount(element, parent, getElementDescription(element))

	commitRemove(element, parent)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitDismount (element, parent) {
	switch (element.active = false, element.id) {
		case SharedElementComponent:
			commitDismount(unmountComponentElement(element, parent), element)
		case SharedElementText:
		case SharedElementEmpty:
		case SharedElementComment:
			break
		case SharedElementPortal:
			if (element !== parent && parent.id > SharedElementSnapshot)
				commitRemove(element, parent)
		default:
			var children = element.children
			var length = children.length

			while (length-- > 0)
				commitDismount(children = children.next, element)
	}

	if (element.ref)
		commitReference(element, element.ref, SharedRefsRemove)
}

/**
 * @param {Element} element
 * @param {number} props
 * @param {string?} xmlns
 * @param {number} signature
 */
function commitProps (element, props, xmlns, signature) {
	if (signature === SharedPropsUpdate)
		if (!shouldNodeUpdateProps(element, props, xmlns))
			return

	for (var key in props)
		switch (key) {
			case 'ref':
				commitReference(element, props[key], signature)
			case 'key':
			case 'xmlns':
			case 'children':
				break
			default:
				setNodeProps(element, key, props[key], xmlns)
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
			if (signature === SharedRefsRemove)
				commitReference(element, getComponentReference, SharedRefsRemove, callback)
			else
				commitReference(element, getComponentReference, SharedRefsDispatch, callback)
			break
		case 'function':
			switch (signature) {
				case SharedRefsRemove:
					return getLifecycleCallback(element.host, callback, element.ref = null, key, element)
				case SharedRefsAssign:
					element.ref = callback
				case SharedRefsDispatch:
					return getLifecycleCallback(element.host, callback, element.owner, key, element)
				case SharedRefsReplace:
					commitReference(element, element.ref, SharedRefsRemove, key)
					commitReference(element, callback, SharedRefsAssign, key)
			}
			break
		default:
			commitReference(element, element.ref === callback ? noop : element.ref, SharedRefsRemove, key)
	}
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @return {boolean}
 */
function commitQuery (element, parent) {
	element.owner = getNodeQuery(
		element,
		parent,
		getElementDescription(getElementSibling(element, parent, SharedLinkedPrevious)),
		getElementSibling(element, parent, SharedLinkedNext)
	)

	return element.active = !!element.owner
}

/**
 * @param {Element} element
 * @param {string} value
 */
function commitTextual (element, value) {
	switch (element.id) {
		case SharedElementText:
			return setNodeText(element, value)
		case SharedElementComment:
			return setNodeComment(element, value)
	}
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitRemove (element, parent) {
	if (parent.id < SharedElementPortal)
		return commitRemove(element, getElementParent(parent))

	switch (element.id) {
		case SharedElementPortal:
		case SharedElementPromise:
		case SharedElementFragment:
			return element.children.forEach(function (children) {
				commitRemove(getElementDescription(children), element)
			})
		case SharedElementComponent:
			return commitRemove(getElementDescription(element), parent)
	}

	removeNodeChild(element, parent)
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function commitInsert (element, sibling, parent) {
	if (parent.id < SharedElementSnapshot)
		if (parent.id < SharedElementPortal)
			return commitInsert(element, sibling, getElementParent(parent))
		else if (!parent.active)
			return commitAppend(element, parent)

	switch (sibling.id) {
		case SharedElementPortal:
			return commitInsert(element, getElementSibling(sibling, parent, SharedLinkedNext), parent)
		case SharedElementPromise:
		case SharedElementFragment:
			return commitInsert(element, getElementBoundary(sibling, SharedLinkedNext), parent)
		case SharedElementComponent:
			return commitInsert(element, getElementDescription(sibling), parent)
		case SharedElementSnapshot:
			return commitAppend(element, parent)
	}

	switch (element.id) {
		case SharedElementPortal:
			return
		case SharedElementPromise:
		case SharedElementFragment:
			return element.children.forEach(function (children) {
				commitInsert(getElementDescription(children), sibling, parent)
			})
		case SharedElementComponent:
			return commitInsert(getElementDescription(element), sibling, parent)
	}

	insertNodeBefore(element, sibling, parent)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitAppend (element, parent) {
	if (parent.id < SharedElementPortal)
		return commitAppend(element, getElementParent(parent))

	switch (element.id) {
		case SharedElementPortal:
			return
		case SharedElementPromise:
		case SharedElementFragment:
			return element.children.forEach(function (children) {
				commitAppend(getElementDescription(children), parent)
			})
		case SharedElementComponent:
			return commitAppend(getElementDescription(element), parent)
	}

	appendNodeChild(element, parent)
}
