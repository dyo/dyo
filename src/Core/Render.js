/**
 * @param {*} element
 * @param {Node} container
 * @param {function=} callback
 */
function render (element, container, callback) {
	if (!container)
		return render(element, getClientDocument(), callback)

	if (isValidClientHost(container))
		update(getClientHost(container), getElementDefinition(element), callback)
	else
		mount(element, createElementIntermediate(), container, callback, SharedMountCommit)
}

/**
 * @param {*} element
 * @param {Node} container
 * @param {function=} callback
 */
function hydrate (element, container, callback) {
	if (!container)
		return hydrate(element, getClientDocument(), callback)

	mount(element, createElementIntermediate(), container, callback, SharedMountQuery)
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
 * @param {function} callback
 * @param {number} signature
 */
function mount (element, parent, container, callback, signature) {
	if (!isValidElement(element))
		return mount(getElementDefinition(element), parent, container, callback, signature)

	if (!isValidClientNode(container))
		invariant(SharedSiteRender, 'Target container is not a DOM element')

	setClientContext(parent)
	setClientNode(parent, container)
	setClientHost(element, container)

	if (signature === SharedMountCommit)
		setClientContent(parent, element)

	commitMount(element, element, parent, parent, SharedMountAppend, signature)

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Node} container
 * @return {boolean}
 */
function unmountComponentAtNode (container) {
	return isValidClientHost(container) && !render(null, container)
}
