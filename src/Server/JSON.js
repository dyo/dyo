/**
 * @return {Object}
 */
function toJSON () {
	var element = this
	
	switch (element.id) {
		case SharedElementText:
			return element.children
		case SharedElementComponent:
			return mountComponent(element).toJSON()
	}

	var output = {type: element.type, props: element.props, children: []}
	var children = element.children
	var length = children.length

	if (element.id < SharedElementEmpty)
		children = (length--, children.next)

	while (length-- > 0)
		output.children.push((children = children.next).toJSON())

	if (element.id < SharedElementEmpty)
		if (output = output.children)
			output.pop()

	return output
}
