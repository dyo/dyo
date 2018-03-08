/**
 * @return {string}
 */
function toString () {
	return getStringElement(this, createElementIntermediate(this))
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
		case SharedElementCustom:
			return getStringElement(getCustomElement(element), host)
		case SharedElementComponent:
			return getStringElement(element.active ? element.children : mountComponentElement(element), element)
	}

	var type = element.type
	var children = element.children
	var length = children.length
	var payload = element.id === SharedElementNode ? '<' + type + getStringProps(element, element.props) + '>' : ''

	if (isVoidType(type))
		return payload

	while (length-- > 0)
		payload += getStringElement(children = children.next, host)

	if (element.id !== SharedElementNode)
		return payload

	if (element.context)
		element.context = void (payload += element.context)

	return payload + '</' + type + '>'
}

/**
 * @param {Element} element
 * @param  {Object} props
 * @return {String}
 */
function getStringProps (element, props) {
	var payload = ''

	for (var name in props) {
		var value = props[name]

		switch (name) {
			case 'dangerouslySetInnerHTML':
				value = value && value.__html
			case 'innerHTML':
				element.context = value ? value : ''
				continue
			case 'defaultValue':
				if (!props.value)
					payload += ' value="' + getTextEscape(value) + '"'
			case 'key':
			case 'ref':
			case 'children':
				continue
			case 'style':
				payload += ' style="' + (typeof value === 'string' ? value : getStringStyle(value)) + '"'
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
				name = 'tabindex'
				break
		}

		switch (typeof value) {
			case 'boolean':
				if (value)
					payload += ' ' + name
				break
			case 'string':
			case 'number':
				payload += ' ' + name + '="' + getTextEscape(value) + '"'
		}
	}

	return payload
}

/**
 * @param {Object} props
 * @return {string}
 */
function getStringStyle (props) {
	var payload = ''

	for (var name in props) {
		var value = props[name]

		switch (typeof value) {
			case 'string':
			case 'number':
				if (name !== name.toLowerCase())
					name = name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase()

				payload += name + ': ' + value + ';'
		}
	}

	return payload
}
