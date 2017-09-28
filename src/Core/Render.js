/**
 * @param {*} element
 * @param {Node} target
 * @param {function=} callback
 */
function render (element, target, callback) {	
	if (!target)
		return render(element, getDOMDocument(), callback)

	if (root.has(target))
		update(root.get(target), getElementDefinition(element), callback)
	else
		mount(element, null, target, callback, SharedMountCommit)
}

/**
 * @param {*} element
 * @param {Node} target
 * @param {function=} callback
 */
function hydrate (element, target, callback) {
	if (!target)
		return hydrate(element, getDOMDocument(), callback)
	
	mount(element, null, target, callback, SharedMountQuery)
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
 * @param {Element?} parent
 * @param {Node} target
 * @param {function} callback
 * @param {number} signature
 */
function mount (element, parent, target, callback, signature) {
	if (parent === null)
		return mount(element, createElementDescription(), target, callback, signature)

	if (!isValidElement(element))
		return mount(getElementDefinition(element), parent, target, callback, signature)

	if (!isValidDOMNode(target))
		invariant(SharedSiteRender, 'Target container is not a DOM element')

	root.set((setDOMNode(parent, target), target), element)

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
