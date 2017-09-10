/**
 * @return {string}
 */
function toJSON () {
	var element = this
	var id = element.id
	
	switch (element.id) {
		case SharedElementComponent:
			return mountComponent(element).toJSON()
		case SharedElementText:
			return element.children
	}

	var output = {type: element.type, props: element.props, children: []}
	var children = element.children
	var length = children.length

	if (id < SharedElementEmpty)
		children = (length--, children.next)

	while (length-- > 0)
		output.children.push((children = children.next).toJSON())

	if (id < SharedElementEmpty)
		if (output = output.children)
			output.pop()

	return output
}
