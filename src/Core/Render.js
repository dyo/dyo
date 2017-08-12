var rootElements = []
var rootContainers = []

/**
 * @param {*} subject
 * @param {Node?} container
 * @param {function?} callback
 */
function render (subject, container, callback) {
	var target = container != null ? container : DOMDocument()
	var element = rootElements[rootContainers.indexOf(target)]
	var parent = null

	if (element)
		return patchElement(element, commitElement(subject))

	element = commitElement(subject)
	parent = new Element(0)
	parent.DOM = {node: target}
	parent.context = {}

	rootElements.push(element)
	rootContainers.push(target)

	commitMount(element, element, parent, parent, 0)

	if (typeof callback === 'function')
		lifecycleCallback(element, callback, target)
}
