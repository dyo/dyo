/**
 * @param {(Component|Element|Node|Event)} element
 * @return {Node}
 */
function findDOMNode (element) {
	if (!element)
		invariant(SharedSiteFindDOMNode, 'Expected to receive a component')

	if (isValidElement(getComponentElement(element)))
		return findDOMNode(getComponentElement(element))

	if (isValidElement(element) && element.active)
		return getDOMNode(element)

	if (isValidDOMEvent(element))
		return getDOMTarget(element)

	if (isValidDOMNode(element))
		return element

	invariant(SharedSiteFindDOMNode, 'Called on an unmounted component')
}
