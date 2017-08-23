/**
 * @param {Element} subject
 * @param {Node} target
 */
function render (subject, target) {
	if (!isValidElement(subject))
		return render(commitElement(subject), target)
	
	if (!target)
		return render(subject, DOMDocument())
		
	if (root.has(target))
		return reconcileElement(root.get(target), commitElement(subject))

	mount(subject, elementIntermediate({node: target}), target)	
}

/**
 * @param {Element} subject
 * @param {Element} parent
 * @param {Node} target
 */
function mount (subject, parent, target) {
	root.set(target, subject)

	commitContent(parent)
	commitMount(subject, subject, parent, parent, 0)
}
