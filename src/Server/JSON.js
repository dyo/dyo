/**
 * @return {string}
 */
function toJSON () {
	var element = this
	
	switch (element.id) {
		case SharedElementComponent:
			return componentMount(element).toJSON()
		case SharedElementText:
			return element.children
	}

	var output = {type: element.type, props: element.props, children: []}
	var children = element.children
	var length = children.length

	while (length-- > 0)
		output.children.push((children = children.next).toJSON())

	return element.id < SharedElementIntermediate ? output.children : output
}
