/**
 * @param {*} element
 * @return {object?}
 */
function findDOMNode (element) {
	if (!element)
		invariant(SharedSiteFindDOMNode, 'Expected to receive a component')

	if (getComponentElement(element))
		return findDOMNode(getElementDescription(getComponentElement(element)))

	if (isValidElement(element) && element.active)
		return getNodeOwner(element)

	if (isValidNodeEvent(element))
		return getNodeTarget(element)

	if (isValidNodeTarget(element))
		return element

	invariant(SharedSiteFindDOMNode, 'Called on an unmounted component')
}
