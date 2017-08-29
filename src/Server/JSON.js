/**
 * @return {string}
 */
function toJSON () {
	var element = this
	
	switch (element.flag) {
		case ElementComponent:
			return elementComponent(element).toJSON()
		case ElementText:
			return element.children
	}

	var output = {type: element.type, props: element.props, children: []}
	var children = element.children
	var length = children.length

	while (length-- > 0)
		output.children.push((children = children.next).toJSON())

	return element.flag < ElementIntermediate ? output.children : output
}
