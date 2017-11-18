/**
 * @param {*} element
 * @param {Node} container
 * @param {function=} callback
 */
function render (element, container, callback) {
	if (!container)
		return render(element, getClientDocument(), callback)

	if (isValidClientHost(container))
		return update(getClientHost(container), getElementDefinition(element), callback)

	mount(element, container, callback, SharedMountCommit)
}

/**
 * @param {*} element
 * @param {Node} container
 * @param {function=} callback
 */
function hydrate (element, container, callback) {
	if (!container)
		return hydrate(element, getClientDocument(), callback)

	mount(element, container, callback, SharedMountQuery)
}

/**
 * @param {Element} element
 * @param {Node} container
 * @param {function} callback
 * @param {number} signature
 */
function mount (element, container, callback, signature) {
	if (!isValidElement(element))
		return mount(getElementDefinition(element), container, callback, signature)

	if (!isValidClientNode(container))
		invariant(SharedSiteRender, 'Target container is not a DOM element')

	mountComponentAtNode(element, createElementIntermediate(element), container, signature)

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} callback
 */
function update (element, snapshot, callback) {
	reconcileElement(element, snapshot)

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {Node} container
 * @param {number} signature
 */
function mountComponentAtNode (element, parent, container, signature) {
	setClientNode(parent, container)
	setClientHost(parent, container)

	if (signature === SharedMountCommit)
		setClientContent(parent)

	commitMount(element, element, parent, parent, SharedMountAppend, signature)
}

/**
 * @param {Node} container
 * @return {boolean}
 */
function unmountComponentAtNode (container) {
	return isValidClientHost(container) && !render(null, container)
}
