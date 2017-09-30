/**
 * @param {*} element
 * @param {Node} container
 * @param {function=} callback
 */
function render (element, container, callback) {	
	if (!container)
		return render(element, getDOMDocument(), callback)

	if (root.has(container))
		update(root.get(container), getElementDefinition(element), callback)
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

	commitNode(parent, container)
	
	root.set(container, element)

	if (signature === SharedMountCommit)
		commitContent(parent, null)
	
	commitMount(element, element, parent, parent, SharedMountAppend, signature)	

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Node} container
 * @return {boolean}
 */
function unmountComponentAtNode (container) {
	return root.has(container) && !render(null, container)
}

/**
 * @param {(Component|Element|Node|Event)} element
 * @return {Node}
 */
function findDOMNode (element) {
	if (!element)
		invariant(SharedSiteFindDOMNode, 'Expected to receive a component')

	if (isValidElement(getComponentElement(element)))
		return findDOMNode(getComponentElement(element))

	if (isValidElement(element))
		if (element.active)
			return findDOMNode(element.DOM.node)

	if (isValidDOMNode(element))
		return element

	if (isValidDOMEvent(element))
		return element.currentTarget

	invariant(SharedSiteFindDOMNode, 'Called on an unmounted component')
}
