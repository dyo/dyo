/**
 * @param {*} element
 * @return {object?}
 */
function findDOMNode (element) {
	if (!element)
		return element

	if (getComponentElement(element))
		return findDOMNode(getComponentElement(element))

	if (isValidElement(element))
		return element.active && getNodeOwner(getElementDescription(element))

	if (isValidNodeEvent(element))
		return getNodeTarget(element)

	if (isValidNodeTarget(element))
		return element
}
