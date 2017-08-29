/**
 * @param {Element} element
 * @param {Node} target
 * @param {function=} callback
 */
function render (element, target, callback) {
	if (!isValidElement(element))
		return render(commitElement(element), target, callback)
	
	if (!target)
		return render(element, DOMRoot(), callback)
		
	if (root.has(target))
		reconcileElement(root.get(target), commitElement(element))
	else
		mount(element, elementIntermediate(DOM(target)), target)

	if (typeof callback === 'function')
		lifecycleCallback(element, callback, findDOMNode(element))
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {Node} target
 */
function mount (element, parent, target) {
	if (!DOMValid(target))
		invariant(LifecycleRender, 'Target container is not a DOM element')

	root.set(target, element)

	commitContent(parent)
	commitMount(element, element, parent, parent, 0)
}
