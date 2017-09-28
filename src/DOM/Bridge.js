/**
 * @param {Object|function} renderer
 */
function createDOMBridge (renderer) {
	if (!renderer)
		return

	setDOMNode = renderer.setDOMNode || noop
	setDOMContent = renderer.setDOMContent || noop
	setDOMValue = renderer.setDOMValue || noop
	setDOMEvent = renderer.setDOMEvent || noop
	setDOMProperties = renderer.setDOMProperties || noop
	getDOMDocument = renderer.getDOMDocument || noop
	getDOMType = renderer.getDOMType || noop
	getDOMProps = renderer.getDOMProps || noop
	getDOMNode = renderer.getDOMNode || noop
	getDOMPortal = renderer.getDOMPortal || noop
	getDOMQuery = renderer.getDOMQuery || noop
	createDOMElement = renderer.createDOMElement || noop
	createDOMText = renderer.createDOMText || noop
	createDOMEmpty = renderer.createDOMEmpty || noop
	removeDOMNode = renderer.removeDOMNode  || noop
	insertDOMNode = renderer.insertDOMNode || noop
	findDOMNode = renderer.findDOMNode || noop
	isValidDOMNode = renderer.isValidDOMNode || noop
	removeDOMNode = renderer.removeDOMNode || noop
	insertDOMNode = renderer.insertDOMNode || noop
	appendDOMNode = renderer.appendDOMNode || noop
}
