/**
 * @return {Object}
 */
function toJSON () {
	return getJSONElement(this, null)
}

function getJSONElement (element, host) {
	switch (element.host = host, element.id) {
		case SharedElementText:
		case SharedElementEmpty:
			return element.children
		case SharedElementComponent:
			return getJSONElement(mountComponentElement(element), element)
	}

	var output = {type: element.type, props: element.props, children: []}
	var children = element.children
	var length = children.length

	if (element.id !== SharedElementNode)
		children = (length--, children.next)

	while (length-- > 0)
		output.children.push(getJSONElement(children = children.next, host))

	if (element.id !== SharedElementNode)
		(output = output.children).pop()

	return output
}
