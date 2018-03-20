/**
 * @return {object}
 */
function toJSON () {
	return getJSONElement(this, this.host || createElementSnapshot(this))
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
		case SharedElementComment:
			return getJSONObject(element, {}, element.children)
		case SharedElementCustom:
			return getJSONElement(getCustomElement(element), host)
		case SharedElementComponent:
			return getJSONElement(element.active ? element.children : getComponentChildren(element, host), element)
	}

	var payload = getJSONObject(element, element.props, [])
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

/**
 * @param {Element} element
 * @param {object?} props
 * @param {(string|number|object)?}
 * @return {object}
 */
function getJSONObject (element, props, children) {
	return {type: element.type, props: props, children: children}
}
