/**
 * @return {string}
 */
function toJSON () {
	switch (this.flag) {
		case ElementComponent:
			return (componentMount(this), this.children.toJSON())
		case ElementText:
			return this.children
	}

	var output = {type: this.type, props: this.props, children: []}
	var children = this.children
	var length = children.length

	while (length-- > 0)
		output.children.push((children = children.next).toJSON())

	return this.flag < ElementIntermediate ? output : output.children
}
