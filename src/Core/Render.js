/**
 * @param {*} element
 * @param {object} container
 * @param {function?} callback
 */
function render (element, container, callback) {
	if (!container)
		render(element, getNodeDocument(), callback)
	else if (registry.has(container))
		updateContainerElement(registry.get(container).children, getElementDefinition(element), callback)
	else
		mountContainerElement(element, container, callback, SharedMountOwner)
}

/**
 * @param {*} element
 * @param {object} container
 * @param {function?} callback
 */
function hydrate (element, container, callback) {
	if (!container)
		hydrate(element, getNodeDocument(), callback)
	else
		mountContainerElement(element, container, callback, SharedMountQuery)
}

/**
 * @param {Node} container
 * @return {boolean}
 */
function unmountComponentAtNode (container) {
	return registry.has(container) && !render(null, container)
}

/**
 * @param {Element} element
 * @param {object} container
 * @param {function} callback
 * @param {number} signature
 */
function mountContainerElement (element, container, callback, signature) {
	if (!isValidElement(element))
		mountContainerElement(getElementDefinition(element), container, callback, signature)
	else if (!isValidNodeTarget(container))
		invariant(SharedSiteRender, 'Target container is not a valid container')
	else
		commitContainerElement(element, createElementSnapshot(element), container, signature)

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} callback
 */
function updateContainerElement (element, snapshot, callback) {
	reconcileElement(element, snapshot, element.host)

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {object} container
 * @param {number} signature
 */
function commitContainerElement (element, parent, container, signature) {
	registry.set(parent.owner = container, parent)

	if (signature === SharedMountOwner)
		setNodeDocument(parent)

	commitMountElement(element, element, parent, parent, SharedOwnerAppend, signature)
}
