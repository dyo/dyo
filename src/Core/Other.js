/**
 * @param {(Component|Element|DOM|Node)} element
 * @return {Node?}
 */
function findDOMNode (element) {
	if (element) {
		if (isValidElement(element[SymbolElement]))
			return findDOMNode(element[SymbolElement])

		if (isValidElement(element)) {
			if (element.flag < ElementPortal)
				return findDOMNode(elementSibling(element, 1))
			else if (element.DOM)
				return DOMNode(element)
		}
	}

	return null
}
