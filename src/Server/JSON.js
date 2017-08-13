/**
 * @return {string}
 */
Element.prototype.toJSON = function toJSON () {
	switch (this.flag) {
		case ElementComponent:
			return componentMount(this).children.toJSON()
		case ElementText:
			return '"'+escape(this.children)+'"'
	}

	var children = this.children
	var length = children.length
	var output = '{type:"' + this.type + '",props:' + JSON.stringify(this.props) + ',children:['
	var next = children

	while (length-- > 0)
		output += (next = next.next).toJSON()

	return output + ']}'
}
