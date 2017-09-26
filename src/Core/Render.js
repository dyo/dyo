/**
 * @param {*} element
 * @param {Node} target
 * @param {function=} callback
 */
function render (element, target, callback) {	
	if (!target)
		return render(element, getDOMDocument(), callback)

	if (root.has(target))
		update(root.get(target), commitElement(element), callback)
	else
		mount(element, target, callback, SharedMountCommit)
}

/**
 * @param {*} element
 * @param {Node} target
 * @param {function=} callback
 */
function hydrate (element, target, callback) {
	if (!target)
		return hydrate(element, getDOMDocument(), callback)
	
	mount(element, target, callback, SharedMountQuery)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} callback
 */
function update (element, snapshot, callback) {
	reconcileElement(element, snapshot)

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Element} element
 * @param {(Element|Node)} parent
 * @param {function} callback
 * @param {number} signature
 */
function mount (element, parent, callback, signature) {
	if (!isValidElement(element))
		return mount(commitElement(element), parent, callback, signature)

	if (!isValidElement(parent))
		return mount(element, createElementNode(createDOMObject(parent)), callback, signature)

	if (!isValidDOMNode(getDOMNode(parent)))
		invariant(SharedSiteRender, 'Target container is not a DOM element')

	root.set(getDOMNode(parent), element)

	if (signature === SharedMountCommit)
		setDOMContent(parent)
	
	commitMount(element, element, parent, parent, SharedMountAppend, signature)	

	if (callback)
		getLifecycleCallback(element, callback)
}

/**
 * @param {Node} target
 * @return {boolean}
 */
function unmountComponentAtNode (target) {
	return root.has(target) && !render(null, target)
}
