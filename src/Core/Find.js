/**
 * @param {any} element
 * @return {(object|boolean)?}
 * @public
 */
function findDOMNode (element) {
	if (!element)
		return

	if (isValidElement(element[SymbolForElement]))
		return findDOMNode(element[SymbolForElement])

	if (isValidElement(element))
		return element.active && getNodeOwner(getElementDescription(element))

	if (isValidNodeEvent(element))
		return getNodeTarget(element)

	if (isValidNodeTarget(element))
		return element
}
