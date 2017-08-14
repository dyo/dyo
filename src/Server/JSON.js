/**
 * @return {string}
 */
Element.prototype.toJSON = function toJSON () {
	var flag = this.flag

	switch (flag) {
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

	return flag < ElementFragment ? output : output.children
}
