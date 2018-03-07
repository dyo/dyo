/**
 * @param {Element} element
 */
function commitCreate (element) {
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
			case SharedElementCustom:
				element.owner = createNodeComponent(element)
				break
			case SharedElementComponent:
			case SharedElementPortal:
				break
			default:
				element.owner = getElementBoundary(element, SharedLinkedNext).owner
		}
	} catch (err) {
		commitRebase(element, getElementDefinition(invokeErrorBoundary(element, err, SharedSiteElement, SharedErrorCatch)))
	} finally {
		element.active = true
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitRebase (element, snapshot) {
	commitCreate(createElementRebase(merge(element, snapshot), element))
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitReplace (element, snapshot) {
	var host = element.host
	var parent = element.parent
	var sibling = getElementSibling(element, parent, SharedLinkedNext)

	commitUnmount(element, parent, SharedMountRemove)
	commitMount(snapshot, sibling, parent, host, SharedMountInsert, SharedMountCommit)

	if (host.children !== element)
		setElementSibling(element, snapshot, parent.children)
	else
		host.children = snapshot
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

	switch (element.id) {
		case SharedElementComponent:
			element.work = SharedWorkMounting

			commitMount(mountComponentElement(element), sibling, parent, element, operation, signature)
			commitCreate(element)

			element.work = SharedWorkIdle

			if (element.owner[SharedComponentDidMount])
				getLifecycleMount(element, SharedComponentDidMount, element.owner)

			if (element.ref)
				commitRefs(element, element.ref, SharedRefsDispatch)

			return
		case SharedElementPromise:
			commitPromise(element, element.type)
		case SharedElementFragment:
		case SharedElementPortal:
			element.owner = element.id !== SharedElementPortal ? parent.owner : getNodePortal(element)

			commitChildren(element, sibling, host, operation, signature)
			commitCreate(element)

			return
		case SharedElementCustom:
		case SharedElementNode:
			element.xmlns = getNodeType(element, parent.xmlns)
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

			if (element.id > SharedElementNode)
				return
	}

	commitChildren(element, sibling, host, SharedMountAppend, signature)
	commitProps(element, getNodeProps(element), SharedPropsMount)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitDismount (element, parent, signature) {
	switch (element.active = false, element.id) {
		case SharedElementComponent:
			commitDismount(element.children, parent, -signature)
			unmountComponentElement(element)
		case SharedElementText:
		case SharedElementEmpty:
			break
		case SharedElementPortal:
			if (signature < SharedElementUnsigned && parent.id > SharedElementIntermediate)
				commitRemove(element, parent)
		default:
			var children = element.children
			var length = children.length

			while (length-- > 0)
				commitDismount(children = children.next, element, -signature)
	}

	if (element.ref)
		commitRefs(element, element.ref, SharedRefsRemove)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 */
function commitUnmount (element, parent, signature) {
	if (signature > SharedElementUnsigned)
		commitDismount(element, parent, signature)

	if (element.id !== SharedElementComponent)
		return commitRemove(element, parent)

	if (element.cache)
		return element.cache = void element.cache.then(
			commitWillUnmount(element, parent, element, SharedErrorThrow),
			commitWillUnmount(element, parent, element, SharedErrorCatch)
		)

	commitUnmount(element.children, parent, SharedElementUnsigned)
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

		if (signature === SharedErrorCatch)
			invokeErrorBoundary(host, err, SharedSitePromise+':'+SharedComponentWillUnmount, SharedErrorCatch)
	}
}

/**
 * @param {Element} element
 * @param {object} type
 */
function commitPromise (element, type) {
	type.then(function (value) {
		element.active && element.type === type && reconcileChildren(element, getElementModule(value))
	}, function (err) {
		invokeErrorBoundary(element, err, SharedSitePromise+':'+SharedSiteRender, SharedErrorCatch)
	}, SymbolAsyncIterator)
}

/**
 * @param {Element} element
 * @param {number} props
 * @param {number} signature
 */
function commitProps (element, props, signature) {
	for (var key in props)
		switch (key) {
			case 'key':
			case 'xmlns':
			case 'children':
				break
			case 'ref':
				return commitRefs(element, props[key], signature)
			case 'style':
				return setNodeStyle(element, key, props[key])
			default:
				if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.length > 2)
					commitEvents(element, key.substring(2).toLowerCase(), props[key])
				else
					setNodeProps(element, key, props[key], element.xmlns)
		}
}

/**
 * @param {Element} element
 * @param {string} type
 * @param {(function|EventListener)?} callback
 */
function commitEvents (element, type, callback) {
	if (!element.cache)
		element.cache = {}

	if (!element.cache[type])
		setNodeEvent(element, type)

	element.cache[type] = callback
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
			if (signature === SharedRefsRemove)
				return commitRefs(element, getLifecycleRefs, SharedRefsRemove, callback)

			return commitRefs(element, getLifecycleRefs, SharedRefsDispatch, callback)
		case 'function':
			switch (signature) {
				case SharedRefsRemove:
					return getLifecycleCallback(element.host, callback, element.ref = null, key, element)
				case SharedRefsAssign:
					element.ref = callback
				case SharedRefsDispatch:
					return getLifecycleCallback(element.host, callback, element.owner, key, element)
				case SharedRefsReplace:
					commitRefs(element, element.ref, SharedRefsRemove, key)
					commitRefs(element, callback, SharedRefsAssign, key)
			}

			break
		default:
			commitRefs(element, element.ref === callback ? noop : element.ref, SharedRefsRemove, key)
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
function commitText (element, value) {
	setNodeText(element, value)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitRemove (element, parent) {
	if (parent.id < SharedElementPortal)
		return commitRemove(element, getElementParent(parent))

	if (element.id > SharedElementIntermediate)
		return removeNodeChild(element, parent)

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
		case SharedElementPromise:
		case SharedElementFragment:
			return commitInsert(element, getElementBoundary(sibling, SharedLinkedNext), parent)
		case SharedElementComponent:
			return commitInsert(element, getElementDescription(sibling), parent)
		case SharedElementPortal:
			return commitInsert(element, getElementSibling(sibling, parent, SharedLinkedNext), parent)
		case SharedElementIntermediate:
			return commitAppend(element, parent)
	}

	switch (element.id) {
		case SharedElementPromise:
		case SharedElementFragment:
			return element.children.forEach(function (children) {
				commitInsert(getElementDescription(children), sibling, parent)
			})
		case SharedElementComponent:
			return commitInsert(getElementDescription(element), sibling, parent)
		case SharedElementPortal:
			return
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
		case SharedElementPromise:
		case SharedElementFragment:
			return element.children.forEach(function (children) {
				commitAppend(getElementDescription(children), parent)
			})
		case SharedElementComponent:
			return commitAppend(getElementDescription(element), parent)
		case SharedElementPortal:
			return
	}

	appendNodeChild(element, parent)
}
