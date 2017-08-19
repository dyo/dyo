/**
 * @param {*} subject
 * @param {Node?} target
 * @param {function=} callback
 */
function render (subject, target, callback) {
	if (!isValidElement(subject))
		return render(commitElement(subject), target, callback)
	if (!target)
		return render(subject, DOMDocument(), callback)
		
	if (root.has(target))
		return patchElement(root.get(target), commitElement(subject))

	var element = elementIntermediate(subject)

	root.set(element.DOM.node = target, subject)
	commitMount(subject, subject, element, element, (DOMContent(element.DOM), 0))

	if (typeof callback === 'function')
		lifecycleCallback(subject, callback)
}
