/**
 * @param {*} subject
 * @param {Node?} target
 */
function render (subject, target) {
	if (!isValidElement(subject))
		return render(commitElement(subject), target)
	if (!target)
		return render(subject, DOMDocument())
		
	if (root.has(target))
		return patchElement(root.get(target), commitElement(subject))

	var parent = elementIntermediate()

	root.set(parent.DOM.node = target, subject)

	commitMount(subject, subject, parent, parent, 0)
}
