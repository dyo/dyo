/**
 * @return {string}
 */
Element.prototype.toString = function toString () {
	switch (this.flag) {
		case ElementComponent:
			return componentMount(this).children.toString()
		case ElementText:
			return escape(this.children)
	}

	var type = this.type
	var children = this.children
	var length = children.length
	var output = '<' + type + toProps(this, this.props) + '>'

	switch (bool(type)) {
		case 0:
			return output
		default:
			if (!this.html)
				while (length-- > 0)
					output += (children = children.next).toString()
			else
				output += this.html
	}

	return output + '</'+type+'>'
}

/**
 * @param  {Object} props
 * @return {String}
 */
function toProps (element, props) {
	var value, output = ''

	for (var key in props) {
		switch (value = props[key], name) {
			case 'defaultValue':
				if (!props.value)
					output += ' value="'+escape(value)+'"'
			case 'key':
			case 'ref':
			case 'children':
				break
			case 'style':
				output += ' style="'
				
				if (typeof value === 'string')
					output += escape(value)
				else if (value)
					for (key in value) {
						if (key !== key.toLowerCase())
							key = key.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase()

						output += key+':'+value[key]+';'
					}

				output += '"'
				break
			case 'className':
				name = 'class'
			default:
				if (value === false || value == null)
					continue
				else if (value === true)
					output += ' '+key
				else
					output += ' '+name+'="'+escape(value)+'"'
		}
	}

	return output
}
