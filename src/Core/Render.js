/**
 * @param {Element} element
 * @param {Node} target
 * @param {function=} callback
 */
function render (element, target, callback) {	
	if (!target)
		return render(element, DOMDocument(), callback)

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
		return hydrate(element, DOMDocument(), callback)
	
	if (root.has(target))
		render(element, target, callback)
	else
		mount(element, target, callback, SharedMountClone)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {function} callback
 * @param {number} mode
 */
function mount (element, parent, callback, mode) {
	if (!isValidElement(element))
		return mount(commitElement(element), parent, callback, mode)

	if (!isValidElement(parent))
		return mount(element, elementEmpty(DOM(parent)), callback, mode)

	if (!DOMValid(DOMTarget(parent)))
		invariant(SharedSiteRender, 'Target container is not a DOM element')

	root.set(DOMTarget(parent), element)

	if (mode === SharedMountCommit)
		commitContent(parent)
	
	commitMount(element, element, parent, parent, SharedMountAppend, mode)

	if (typeof callback === 'function')
		getLifecycleCallback(element, callback, findDOMNode(element))
}
