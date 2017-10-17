/**
 * @return {string}
 */
function toString () {
	return getStringElement(this, this.host)
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
			if (element.active)
				return getStringElement(element.children, element)

			return getStringElement(mountComponentElement(element), element)
	}

	var type = element.type
	var children = element.children
	var length = children.length
	var output = element.id === SharedElementNode ? '<' + type + getStringProps(element, element.props) + '>' : ''

	if (isVoidType(type))
		return output

	while (length-- > 0)
		output += getStringElement(children = children.next, host)

	if (element.id !== SharedElementNode)
		return output

	if (element.state)
		element.state = void (output += element.state)

	return output + '</' + type + '>'
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
				value = value && value.__html
			case 'innerHTML':
				element.state = value ? value : ''
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
				break
			case 'tabIndex':
				name = name.toLowerCase()
				break
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

		switch (typeof value) {
			case 'string':
			case 'number':
				if (name !== name.toLowerCase())
					name = name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase()

				output += name + ': ' + value + ';'
		}
	}

	return output
}
