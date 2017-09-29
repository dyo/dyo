/**
 * @return {Object}
 */
function toJSON () {
	var element = this
	
	switch (element.id) {
		case SharedElementText:
		case SharedElementEmpty:
			return element.children
		case SharedElementComponent:
			return mountComponentElement(element).toJSON()
	}

	var output = {type: element.type, props: element.props, children: []}
	var children = element.children
	var length = children.length

	if (element.id < SharedElementIntermediate)
		children = (length--, children.next)

	while (length-- > 0)
		output.children.push((children = children.next).toJSON())

	if (element.id < SharedElementIntermediate)
		(output = output.children).pop()

	return output
}
