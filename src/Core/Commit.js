/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 * @param {Element} host
 * @param {number} operation
 * @param {number} signature
 */
function commitMountElement (element, sibling, parent, host, operation, signature) {
	element.host = host
	element.parent = parent

	switch (element.id) {
		case SharedElementComponent:
			commitMountComponentElement(element, sibling, parent, host, operation, signature)

			return
		case SharedElementPromise:
			commitMountElementPromise(element, host, element.type)
		case SharedElementFragment:
		case SharedElementPortal:
			element.owner = element.id !== SharedElementPortal ? parent.owner : getNodePortal(element)

			commitMountElementChildren(element, sibling, host, operation, signature)
			commitOwner(element)

			return
		case SharedElementCustom:
		case SharedElementNode:
			element.xmlns = getNodeType(element, parent.xmlns)
		default:
			switch (signature) {
				case SharedMountQuery:
					if (commitOwnerQuery(element, parent))
						break
				default:
					commitOwner(element)

					if (operation === SharedOwnerAppend)
						commitOwnerAppend(element, parent)
					else
						commitOwnerInsert(element, sibling, parent)
			}

			if (element.id > SharedElementNode)
				return
	}

	commitMountElementChildren(element, sibling, host, SharedOwnerAppend, signature)
	commitOwnerProps(element, getNodeInitialProps(element, element.props), element.xmlns, SharedPropsMount)
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} host
 * @param {number} operation
 * @param {number} signature
 */
function commitMountElementChildren (element, sibling, host, operation, signature) {
	var children = element.children
	var length = children.length
	var next = children.next

	while (length-- > 0) {
		commitMountElement(next, sibling, element, host, operation, signature)
		next = next.next
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} host
 */
function commitMountElementReplace (element, snapshot, host) {
	var parent = element.parent
	var sibling = getElementSibling(element, parent, SharedLinkedNext)

	commitUnmountElement(element, parent)

	if (sibling.active)
		commitMountElement(snapshot, sibling, parent, host, SharedOwnerInsert, SharedMountOwner)
	else
		commitMountElement(snapshot, sibling, parent, host, SharedOwnerAppend, SharedMountOwner)

	if (snapshot.active)
		if (element !== host.children)
			replaceElementChildren(element, snapshot, parent.children)
		else
			host.children = snapshot
}

/**
 * @param {Element} element
 * @param {Element} host
 * @param {object} type
 */
function commitMountElementPromise (element, host, type) {
	type.then(function (value) {
		element.active && element.type === type && reconcileElementChildren(element, getElementModule(value), host)
	}, function (err) {
		invokeErrorBoundary(element, err, SharedSiteRender)
	})
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 * @param {Element} host
 * @param {number} operation
 * @param {number} signature
 */
function commitMountComponentElement (element, sibling, parent, host, operation, signature) {
	try {
		commitMountComponentChildren(mountComponentInstance(element), sibling, parent, element, operation, signature)

		if (element.owner[SharedComponentDidMount])
			getLifecycleMount(element, SharedComponentDidMount, element.owner)

		if (element.ref)
			commitOwnerRefs(element, element.ref, SharedRefsDispatch)
	} catch (err) {
		commitMountComponentChildren(getElementDefinition(), sibling, parent, host, operation, signature)
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
function commitMountComponentChildren (element, sibling, parent, host, operation, signature) {
	commitMountElement(host.children = element, sibling, parent, host, operation, signature)
	commitOwner(host)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {Element} children
 */
function commitUnmountPromise (element, parent, children) {
	element.cache.then(function () {
		commitOwnerRemove(children, parent)
	})
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitUnmountElement (element, parent) {
	if (element.active)
		if (commitUnmountElementChildren(element, parent, SharedUnmountElement))
			commitUnmountPromise(element, parent, getElementDescription(element))
		else
			commitOwnerRemove(element, parent)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 * @return {boolean}
 */
function commitUnmountElementChildren (element, parent, signature) {
	var id = element.id
	var active = element.active = false
	var children = element.children

	if (id !== SharedElementComponent) {
		if (id < SharedElementComment)
			for (var length = children.length; length > 0; --length)
				commitUnmountElementChildren(children = children.next, element, SharedUnmountChildren)

		willNodeUnmount(element, parent)

		if (id === SharedElementPortal && signature === SharedUnmountChildren && parent.id > SharedElementSnapshot)
			commitOwnerRemove(element, parent)
	} else {
		commitUnmountElementChildren(children, parent, signature)

		if (unmountComponentInstance(element))
			active = !active
	}

	if (element.ref)
		commitOwnerRefs(element, element.ref, SharedRefsRemove)

	return active
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
 * @param {Element} parent
 * @return {boolean}
 */
function commitOwnerQuery (element, parent) {
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
 * @param {(function|string)?} callback
 * @param {number} signature
 * @param {*} key
 */
function commitOwnerRefs (element, callback, signature, key) {
	switch (typeof callback) {
		case 'string':
			if (signature === SharedRefsRemove)
				commitOwnerRefs(element, getComponentReference, SharedRefsRemove, callback)
			else
				commitOwnerRefs(element, getComponentReference, SharedRefsDispatch, callback)
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
					commitOwnerRefs(element, element.ref, SharedRefsRemove, key)
					commitOwnerRefs(element, callback, SharedRefsAssign, key)
			}
			break
		default:
			commitOwnerRefs(element, element.ref === callback ? noop : element.ref, SharedRefsRemove, key)
	}
}

/**
 * @param {Element} element
 * @param {number} props
 * @param {string?} xmlns
 * @param {number} signature
 */
function commitOwnerProps (element, props, xmlns, signature) {
	for (var key in props)
		switch (key) {
			case 'ref':
				commitOwnerRefs(element, props[key], signature)
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
 * @param {object} props
 */
function commitOwnerPropsUpdate (element, props) {
	commitOwnerProps(element, getNodeUpdatedProps(element, props), element.xmlns, SharedPropsUpdate)
}

/**
 * @param {Element} element
 * @param {string} value
 */
function commitOwnerContent (element, value) {
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
function commitOwnerRemove (element, parent) {
	if (parent.id < SharedElementPortal)
		return commitOwnerRemove(element, getElementParent(parent))

	switch (element.id) {
		case SharedElementPortal:
		case SharedElementPromise:
		case SharedElementFragment:
			return element.children.forEach(function (children) {
				commitOwnerRemove(getElementDescription(children), element)
			})
		case SharedElementComponent:
			return commitOwnerRemove(getElementDescription(element), parent)
	}

	removeNodeChild(element, parent)
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function commitOwnerInsert (element, sibling, parent) {
	if (parent.id < SharedElementSnapshot)
		if (parent.id < SharedElementPortal)
			return commitOwnerInsert(element, sibling, getElementParent(parent))
		else if (!parent.active)
			return commitOwnerAppend(element, parent)

	switch (sibling.id) {
		case SharedElementPortal:
			return commitOwnerInsert(element, getElementSibling(sibling, parent, SharedLinkedNext), parent)
		case SharedElementPromise:
		case SharedElementFragment:
			return commitOwnerInsert(element, getElementBoundary(sibling, SharedLinkedNext), parent)
		case SharedElementComponent:
			return commitOwnerInsert(element, getElementDescription(sibling), parent)
		case SharedElementSnapshot:
			return commitOwnerAppend(element, parent)
	}

	switch (element.id) {
		case SharedElementPortal:
			return
		case SharedElementPromise:
		case SharedElementFragment:
			return element.children.forEach(function (children) {
				commitOwnerInsert(getElementDescription(children), sibling, parent)
			})
		case SharedElementComponent:
			return commitOwnerInsert(getElementDescription(element), sibling, parent)
	}

	insertNodeChild(element, sibling, parent)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitOwnerAppend (element, parent) {
	if (parent.id < SharedElementPortal)
		return commitOwnerAppend(element, getElementParent(parent))

	switch (element.id) {
		case SharedElementPortal:
			return
		case SharedElementPromise:
		case SharedElementFragment:
			return element.children.forEach(function (children) {
				commitOwnerAppend(getElementDescription(children), parent)
			})
		case SharedElementComponent:
			return commitOwnerAppend(getElementDescription(element), parent)
	}

	appendNodeChild(element, parent)
}
