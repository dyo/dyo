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
		reconcileElement(root.get(target), commitElement(subject))
	else
		mount(subject, elementIntermediate(subject), target, 1)	
}

/**
 * @param {*} subject
 * @param {*} parent
 * @param {Node?} target
 * @param {number} signature
 */
function mount (subject, parent, target, signature) {
	root.set(parent.DOM.node = target, subject)

	if (signature > 0) {
		commitContent(parent)
		commitMount(subject, subject, parent, parent, 0)
	}
}
