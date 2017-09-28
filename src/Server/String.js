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
		case SharedElementEmpty:
			return getTextEscape(element.children)
		case SharedElementComponent:
			return getStringElement(mountComponentElement(element), element)
	}

	var type = element.type
	var children = element.children
	var length = children.length
	var output = element.id === SharedElementNode ? '<' + type + getStringProps(element, element.props) + '>' : ''
	
	if (voidElementType(type))
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
	var xmlns = element.xmlns

	for (var name in props) {
		var value = props[name]
		
		switch (name) {
			case 'dangerouslySetInnerHTML':
				if (value && value.__html)
					value = value.__html
				else
					continue
			case 'innerHTML':
				element.DOM = value + ''
				continue
			case 'defaultValue':
				if (!props.value)
					output += ' value="' + getTextEscape(value) + '"'
			case 'key':
			case 'ref':
			case 'children':
				continue
			case 'style':
				output += ' style="' + (typeof value === 'string' ? value : getStringStyle(value)) + '"'				
				continue
			case 'className':
				name = 'class'
				break
			case 'acceptCharset':
				name = 'accept-charset'
				break
			case 'httpEquiv':
				name = 'http-equiv'
		}

		switch (typeof value) {
			case 'boolean':
				if (value)
					output += ' ' + name
				break
			case 'string':
			case 'number':
				output += ' ' + name + '="' + getTextEscape(value) + '"'
		}
	}

	return output
}

/**
 * @param {Object} props
 * @return {string}
 */
function getStringStyle (props) {
	var output = ''

	for (var name in props) {
		var value = props[name]

		if (name !== name.toLowerCase())
			name = name.replace(RegExpDashCase, '$1-').replace(RegExpVendor, '-$1').toLowerCase()

		output += name + ':' + value + ';'
	}

	return output
}
