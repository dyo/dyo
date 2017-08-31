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
		mount(element, target, callback, 1)
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
		mount(element, target, callback, 0)
}

/**
 * @param {Element} element
 * @param {Node?} parent
 * @param {number} mode
 */
function mount (element, parent, callback, mode) {
	if (!isValidElement(element))
		return mount(commitElement(element), parent, callback, mode)

	if (!isValidElement(parent))
		return mount(element, elementIntermediate({target: parent}), callback, mode)

	if (!DOMValid(DOMTarget(parent)))
		invariant(LifecycleRender, 'Target container is not a DOM element')

	root.set(DOMTarget(parent), element)

	if (mode > 0)
		commitContent(parent)
	
	commitMount(element, element, parent, parent, mode, 0)

	if (typeof callback === 'function')
		lifecycleCallback(element, callback, findDOMNode(element))
}
