/**
 * @param {*} element
 * @param {object} container
 * @param {function?} callback
 */
function render (element, container, callback) {
	if (!container)
		render(element, getNodeDocument(), callback)
	else if (registry.has(container))
		update(registry.get(container).children, getElementDefinition(element), callback)
	else
		mount(element, container, callback, SharedMountCommit)
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
		mount(element, container, callback, SharedMountQuery)
}

/**
 * @param {Element} element
 * @param {object} container
 * @param {function} callback
 * @param {number} signature
 */
function mount (element, container, callback, signature) {
	if (!isValidElement(element))
		mount(getElementDefinition(element), container, callback, signature)
	else if (!isValidNodeTarget(container))
		invariant(SharedSiteRender, 'Target container is not a valid container')
	else
		initialize(element, createElementSnapshot(element), container, signature)

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} callback
 */
function update (element, snapshot, callback) {
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
function initialize (element, parent, container, signature) {
	registry.set(parent.owner = container, parent)

	if (signature === SharedMountCommit)
		setNodeDocument(parent)

	commitElement(element, element, parent, parent, SharedMountAppend, signature)
}

/**
 * @param {Node} container
 * @return {boolean}
 */
function unmountComponentAtNode (container) {
	return registry.has(container) && !render(null, container)
}
