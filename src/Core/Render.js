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

	var element = elementIntermediate(subject)

	root.set(element.DOM.node = target, subject)
	commitMount(subject, subject, element, element, (DOMContent(element.DOM), 0))
}
