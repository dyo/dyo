/**
 * @param {(Component|Element|DOM|Node)} element
 * @return {Node?}
 */
function findDOMNode (element) {
	if (element) {
		if (isValidElement(element))
			return findDOMNode(element.DOM)
		
		if (isValidElement(element.children))
			return findDOMNode(element.children)
		
		if (isValidPortal(element.target))
			return element.flag > ElementFragment ? element.target : findDOMNode(elementSibling(element, 1))

		if (isValidPortal(element))
			return element
	}

	return null
}
