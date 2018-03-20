/**
 * @param {Element} element
 * @param {Exception} exception
 * @return {Element}
 */
function getErrorBoundary (element, exception) {
	try {
		delegateErrorBoundary(element, element, exception)
	} finally {
		return createElementEmpty()
	}
}

/**
 * @param {Element} element
 * @param {Element} host
 * @return {Element}
 */
function getComponentChildren (element, host) {
	try {
		return mountComponentElement(element)
	} catch (err) {
		return getErrorBoundary(host, err)
	}
}

/**
 * @param {Element} element
 * @return {Element}
 */
function getCustomElement (element) {
	try {
		commitOwner(element)
	} finally {
		return getCustomProps(createElement('template', element.children), element.owner)
	}
}

/**
 * @param {Element} element
 * @param {object} owner
 * @return {Element}
 */
function getCustomProps (element, owner) {
	if (!owner)
		return element

	if (owner.nodeName)
		element.type = owner.nodeName.toLowerCase()

	if (owner.attributes)
		for (var attributes = owner.attributes, i = attributes.length - 1; i >= 0; --i)
			element.props[attributes[i].name] = attributes[i].value

	if (owner.innerHTML)
		element.props.innerHTML = owner.innerHTML

	return element
}

/**
 * @param {*} value
 * @return {string}
 */
function getTextEscape (value) {
	return (value+'').replace(/[<>&"']/g, getTextEncode)
}

/**
 * @param {string} character
 * @return {string}
 */
function getTextEncode (character) {
	switch (character) {
		case '<':
			return '&lt;'
		case '>':
			return '&gt;'
		case '"':
			return '&quot;'
		case "'":
			return '&#x27;'
		case '&':
			return '&amp;'
	}
}

/**
 * @param {string}
 */
function isVoidType (type) {
	if (typeof type === 'string')
		switch (type.toLowerCase()) {
			case 'area':
			case 'base':
			case 'br':
			case 'meta':
			case 'source':
			case 'keygen':
			case 'img':
			case 'col':
			case 'embed':
			case 'wbr':
			case 'track':
			case 'param':
			case 'link':
			case 'input':
			case 'hr':
			case '!doctype':
				return true
		}

	return false
}

/**
 * @param {Response} response
 */
function setResponseHeader (response) {
	typeof response.setHeader === 'function' && response.setHeader('Content-Type', 'text/html')
}
