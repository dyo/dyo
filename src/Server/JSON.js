/**
 * @return {Object}
 */
function toJSON () {
	return getJSONElement(this, createElementIntermediate(this))
}

/**
 * @param {Element} element
 * @param {Element} host
 * @return {object}
 */
function getJSONElement (element, host) {
	switch (element.host = host, element.id) {
		case SharedElementText:
		case SharedElementEmpty:
			return element.children
		case SharedElementComponent:
			return getJSONElement(element.active ? element.children : mountComponentElement(element), element)
	}

	var payload = {type: element.type, props: element.props, children: []}
	var children = element.children
	var length = children.length

	if (element.id !== SharedElementNode)
		children = (length--, children.next)

	while (length-- > 0)
		payload.children.push(getJSONElement(children = children.next, host))

	if (element.id !== SharedElementNode)
		(payload = payload.children).pop()

	return payload
}
