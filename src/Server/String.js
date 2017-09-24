/**
 * @return {string}
 */
function toString () {
	return getStringElement(this, null)
}

/**
 * @param {Element} element
 * @param {Element?} host
 * @return {string}
 */
function getStringElement (element, host) {
	switch (element.host = host, element.id) {
		case SharedElementText:
			return getTextEscape(element.children)
		case SharedElementComponent:
			return getStringElement(mountComponent(element), element)
	}

	var type = element.type
	var children = element.children
	var length = children.length
	var output = element.id === SharedElementNode ? '<' + type + getStringProps(element, element.props) + '>' : ''
	
	if (getElementType(type) === SharedElementEmpty)
		return output

	if (!element.DOM)
		while (length-- > 0)
			output += getStringElement(children = children.next, host)
	else (output += element.DOM)
		element.DOM = null

	if (element.id === SharedElementNode)
		return output + '</' + type + '>'
	else
		return output
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
				element.DOM = value + ''
				break
			case 'defaultValue':
				if (!props.value)
					output += ' value="' + getTextEscape(value) + '"'
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
						output += ' ' + key + (value !== true ? '="'+getTextEscape(value) + '"' : '')
				}
		}
	}

	return output
}

/**
 * @param {Object} object
 * @return {string}
 */
function getStringStyle (object) {
	var output = ''

	for (var key in object) {
		var value = object[key]

		if (key !== key.toLowerCase())
			key = key.replace(RegExpDashCase, '$1-').replace(RegExpVendor, '-$1').toLowerCase()

		output += key + ':' + value + ';'
	}

	return output
}
