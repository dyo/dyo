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
		parent = new Element(ElementIntermediate)
		parent.DOM = {node: target}
		parent.context = {}
		parent.children = element = commitElement(subject)

		roots.set(target, element)
		commitMount(element, element, parent, parent, 0)
	}

	if (typeof callback === 'function')
		lifecycleCallback(element, callback, target)
}
