/**
 * @return {string}
 */
function toString () {
	var element = this

	switch (element.flag) {
		case ElementComponent:
			return elementComponent(element).toString()
		case ElementText:
			return escapeText(element.children)
	}

	var type = element.type
	var children = element.children
	var length = children.length
	var output = element.flag > ElementIntermediate ? '<' + type + toProps(element, element.props) + '>' : ''

	switch (elementType(type)) {
		case 0:
			return output
		default:
			if (!element.html)
				while (length-- > 0)
					output += (children = children.next).toString()
			else {
				output += element.html
				element.html = ''
			}
	}

	return element.flag > ElementIntermediate ? output + '</'+type+'>' : output
}

/**
 * @param {Element} element
 * @param  {Object} props
 * @return {String}
 */
function toProps (element, props) {
	var output = ''

	for (var key in props) {
		var value = props[key]
		
		switch (key) {
			case 'dangerouslySetInnerHTML':
				if (value && value.__html)
					value = value.__html
				else
					break
			case 'innerHTML':
				element.html = value
				break
			case 'defaultValue':
				if (!props.value)
					output += ' value="'+escapeText(value)+'"'
			case 'key':
			case 'ref':
			case 'children':
				break
			case 'style':
				output += ' style="' + (typeof value === 'string' ? value : toStyle(value)) + '"'				
				break
			case 'className':
				key = 'class'
			default:
				switch (typeof value) {
					case 'boolean':
						if (value === false)
							break
					case 'string':
					case 'number':
						output += ' '+ key + (value !== true ? '="'+escapeText(value)+'"' : '')
				}
		}
	}

	return output
}

/**
 * @param {Object} obj
 * @return {string}
 */
function toStyle (obj) {
	var name, output = ''

	for (var key in obj) {
		if (key !== key.toLowerCase())
			name = key.replace(RegExpDashCase, '$1-').replace(RegExpVendor, '-$1').toLowerCase()
		else
			name = key
		
		output += name+':'+obj[key]+';'
	}

	return output
}
