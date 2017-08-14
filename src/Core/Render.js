/**
 * @type {WeakMap}
 */
var roots = new WeakMap()

/**
 * @param {*} subject
 * @param {Node?} target
 * @param {function?} callback
 */
function render (subject, target, callback) {
	if (target == null)
		return render(subject, DOMDocument(), callback)
		
	var element = roots.get(target)
	var parent = null

	if (element)
		patchElement(element, commitElement(subject))
	else {
		element = commitElement(subject)
		parent = new Element(0)
		parent.DOM = {node: target}
		parent.context = {}

		roots.set(target, element)
		commitMount(element, element, parent, parent, 0)
	}

	if (typeof callback === 'function')
		lifecycleCallback(element, callback, target)
}
