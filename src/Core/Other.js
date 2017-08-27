/**
 * @param {(Component|Element|DOM|Node)} element
 * @return {Node?}
 */
function findDOMNode (element) {
	if (element) {
		if (DOMValid(element))
			return element

		if (DOMValid(element.target))
			return element.target

		if (isValidElement(element[SymbolElement]))
			return findDOMNode(element[SymbolElement])

		if (isValidElement(element))
			return findDOMNode(element.flag > ElementFragment ? element.DOM : elementSibling(element, 1))
	}

	return null
}
