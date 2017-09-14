/**
 * @param {Element} element
 * @param {Node} target
 * @param {function=} callback
 */
function render (element, target, callback) {	
	if (!target)
		return render(element, getDOMDocument(), callback)

	if (root.has(target))
		reconcileElement(root.get(target), commitElement(element))
	else
		mount(element, target, callback, SharedMountCommit)
}

/**
 * @param {Element} element
 * @param {Node} target
 * @param {function=} callback
 */
function hydrate (element, target, callback) {
	if (!target)
		return hydrate(element, getDOMDocument(), callback)
	
	if (root.has(target))
		render(element, target, callback)
	else
		mount(element, target, callback, SharedMountClone)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {function} callback
 * @param {number} signature
 */
function mount (element, parent, callback, signature) {
	if (!isValidElement(element))
		return mount(commitElement(element), parent, callback, signature)

	if (!isValidElement(parent))
		return mount(element, createElementNode(createDOMObject(parent)), callback, signature)

	if (!isValidDOMNode(getDOMNode(parent)))
		invariant(SharedSiteRender, 'Target container is not a DOM element')

	root.set(getDOMNode(parent), element)

	if (signature === SharedMountCommit)
		setDOMContent(parent)
	
	commitMount(element, element, parent, parent, SharedMountAppend, signature)

	if (typeof callback === 'function')
		getLifecycleCallback(element, callback, findDOMNode(element))
}
