/**
 * @param {*} element
 * @param {Node} container
 * @param {function=} callback
 */
function render (element, container, callback) {
	if (!container)
		return render(element, getDOMDocument(), callback)

	if (DOMMap.has(container))
		update(DOMMap.get(container), getElementDefinition(element), callback)
	else
		mount(element, createElementDescription(SharedElementContainer), container, callback, SharedMountCommit)
}

/**
 * @param {*} element
 * @param {Node} container
 * @param {function=} callback
 */
function hydrate (element, container, callback) {
	if (!container)
		return hydrate(element, getDOMDocument(), callback)

	mount(element, createElementDescription(SharedElementContainer), container, callback, SharedMountQuery)
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

	if (!isValidDOMNode(container))
		invariant(SharedSiteRender, 'Target container is not a DOM element')

	DOMMap.set(container, element)

	setDOMNode(parent, container)

	if (signature === SharedMountCommit)
		initDOMRoot(parent)

	commitMount(element, element, parent, parent, SharedMountAppend, signature)

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Node} container
 * @return {boolean}
 */
function unmountComponentAtNode (container) {
	return DOMMap.has(container) && !render(null, container)
}
