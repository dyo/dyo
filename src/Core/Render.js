/**
 * @param {Element} subject
 * @param {Node} target
 * @param {function=} callback
 */
function render (subject, target, callback) {
	if (!isValidElement(subject))
		return render(commitElement(subject), target, callback)
	
	if (!target)
		return render(subject, DOMRoot(), callback)
		
	if (root.has(target))
		reconcileElement(root.get(target), commitElement(subject))
	else
		mount(subject, elementIntermediate(DOM(target)), target)

	if (typeof callback === 'function')
		lifecycleCallback(subject, callback, findDOMNode(subject))
}

/**
 * @param {Element} subject
 * @param {Element} parent
 * @param {Node} target
 */
function mount (subject, parent, target) {
	if (!DOMValid(target))
		invariant('render', 'Target container is not a DOM element')

	root.set(target, subject)

	commitContent(parent)
	commitMount(subject, subject, parent, parent, 0)
}
