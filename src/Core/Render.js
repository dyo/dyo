/**
 * @param {Element} element
 * @param {Node} target
 * @param {function=} callback
 */
function render (element, target, callback) {	
	if (!target)
		return render(element, getDOMDocument(), callback)

	if (root.has(target))
		reconcileElement(root.get(target), commitElement(element))
	else
		mount(element, target, callback, SharedMountCommit)
}

/**
 * @param {Element} element
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

	if (typeof callback === 'function')
		getLifecycleCallback(element, callback, findDOMNode(element))
}

/**
 * @param {Node} target
 * @return {boolean}
 */
function unmountComponentAtNode (target) {
	return root.has(target) && !render(null, target)
}

/**
 * @param {(Component|Element|Node)} element
 * @return {Node}
 */
function findDOMNode (element) {
	if (!element)
		invariant(SharedSiteFindDOMNode, 'Expected to receive a component')

	if (isValidElement(element[SymbolElement]))
		return findDOMNode(element[SymbolElement])

	if (element.active && isValidElement(element))
		return getDOMNode(element)

	if (isValidDOMNode(element))
		return element

	invariant(SharedSiteFindDOMNode, 'Called on an unmounted component')
}
