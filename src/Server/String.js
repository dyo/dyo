/**
 * @return {string}
 */
function toString () {
	var element = this
	var id = element.id

	switch (id) {
		case SharedElementText:
			return getTextEscape(element.children)
		case SharedElementComponent:
			return mountComponent(element).toString()
	}

	var type = element.type
	var children = element.children
	var length = children.length
	var output = id === SharedElementNode ? '<' + type + getStringProps(element, element.props) + '>' : ''

	if (getElementType(type) === SharedElementEmpty)
		return output

	if (typeof element.DOM !== 'string')
		while (length-- > 0)
			output += (children = children.next).toString()
	else {
		output += element.DOM
		element.DOM = null
	}

	return id === SharedElementNode ? output + '</'+type+'>' : output
}

/**
 * @param {Element} element
 * @param  {Object} props
 * @return {String}
 */
function getStringProps (element, props) {
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
				element.DOM = value+''
				break
			case 'defaultValue':
				if (!props.value)
					output += ' value="'+getTextEscape(value)+'"'
			case 'key':
			case 'ref':
			case 'children':
				break
			case 'style':
				output += ' style="' + (typeof value === 'string' ? value : getStringStyle(value)) + '"'				
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
						output += ' '+ key + (value !== true ? '="'+getTextEscape(value)+'"' : '')
				}
		}
	}

	return output
}

/**
 * @param {Object} obj
 * @return {string}
 */
function getStringStyle (obj) {
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
