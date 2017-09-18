/**
 * @param {Node} target
 */
function DOM (target) {
	return {target: target}
}

/**
 * @param {Node} target
 * @param {boolean}
 */
function isValidDOMNode (target) {
	return !!(target && target.ELEMENT_NODE)
}

/**
 * @param {(EventListener|Element)} element
 * @param {string} type
 */
function setDOMEvent (element, type) {
	getDOMNode(element).addEventListener(type, element, false)
}

/**
 * @param {Element} element
 */
function setDOMContent (element) {
	getDOMNode(element).textContent = ''
}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function setDOMValue (element, value) {
	getDOMNode(element).nodeValue = value
}

/**
 * @param {Element} element
 * @param {Object} object
 */
function setDOMStyle (element, object) {
	for (var key in object) {
		var value = object[key]

		if (key.indexOf('-') < 0)
			getDOMNode(element).style[key] = value !== false && value !== undefined ? value : null
		else
			getDOMNode(element).style.setProperty(key, value)
	}
}

/**
 * @param {Element} element
 * @param {string} name 
 * @param {*} value
 */
function setDOMProperty (element, name, value) {
	switch (value) {
		case null:
		case false:
		case undefined:
			return setDOMAttribute(element, name, value, getDOMNode(element)[name] = '')
	}

	getDOMNode(element)[name] = value
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {string} xmlns
 */
function setDOMAttribute (element, name, value, xmlns) {
	switch (value) {
		case null:
		case false:
		case undefined:
			if (!xmlns)
				getDOMNode(element).removeAttribute(name)
			else
				getDOMNode(element).removeAttributeNS(xmlns, name)
			return
		case true:
			return setDOMAttribute(element, name, '', xmlns)
	}

	if (!xmlns)
		getDOMNode(element).setAttribute(name, value)
	else
		getDOMNode(element).setAttributeNS(xmlns, name, value)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {string} xmlns
 */
function setDOMProperties (element, name, value, xmlns) {
	switch (name) {
		case 'className':
			if (!xmlns && value)
				return setDOMProperty(element, name, value)
		case 'class':
			return setDOMAttribute(element, 'class', value, '')
		case 'style':
			if (typeof value === 'object')
				return setDOMStyle(element, value)
			break
		case 'xlink:href':
			return setDOMAttribute(element, name, value, 'http://www.w3.org/1999/xlink')
		case 'dangerouslySetInnerHTML':
			return setDOMProperties(element, 'innerHTML', value ? value.__html : '', '')
		case 'innerHTML':
			if (getDOMNode(element)[name] !== value)
				setDOMProperty(element, name, value)
			return
		case 'width':
		case 'height':
			if (element.type === 'img')
				break
		default:
			if (!xmlns && name in getDOMNode(element))
				return setDOMProperty(element, name, value)
	}

	if (typeof value === 'object')
		setDOMProperty(element, name, value)
	else 
		setDOMAttribute(element, name, value, '')
}

/**
 * @return {Node}
 */
function getDOMDocument () {
	return document.documentElement
}

/**
 * @param {Element} element
 * @return {Node}
 */
function getDOMNode (element) {
	return element.DOM.target
}

/**
 * @param {Element} element
 * @param {string} xmlns
 */
function getDOMType (element, xmlns) {
	switch (element.type) {
		case 'svg':
			return 'http://www.w3.org/2000/svg'
		case 'math':
			return 'http://www.w3.org/1998/Math/MathML'
		case 'foreignObject':
			return ''
	}
	
	return xmlns
}

/**
 * @param {Element} element
 * @return {Object}
 */
function getDOMProps (element) {
	switch (element.type) {
		case 'input':
			return merge({type: null, step: null, min: null, max: null}, element.props)
		default:
			return element.props
	}
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {Element} prev
 * @param {Element} next
 */
function getDOMQuery (element, parent, prev, next) {
	var type = element.type.toLowerCase()
	var xmlns = element.xmlns
	var children = element.children
	var text = '#text'
	var node = null
	var previous = prev.active && getDOMNode(prev)
	var target = previous ? previous.nextSibling : getDOMNode(parent).firstChild 
	var current = target
	var sibling = target

	while (target)
		switch (target.nodeName.toLowerCase()) {
			case type:
				if (type === text) {
					if (element !== next && element.id === next.id)
						target.splitText(children.length)

					if (target.nodeValue !== children)
						target.nodeValue = children
				}

				node = DOM(target)
				type = null

				if (!(target = target.nextSibling))
					break

				if (next.type)
					return node
		default:
			if (type === text && (xmlns === type || children.length === 0))
				if (target.parentNode.insertBefore((node = createDOMText(element)).target, target))
					if (next.type)
						return node
					else
						type = current = null

			target = (sibling = target).nextSibling

			if (!previous || current !== sibling)
				sibling.parentNode.removeChild(sibling)
		}

	return node
}

/**
 * @param {Node} target
 * @return {DOM}
 */
function createDOMObject (target) {
	return DOM(target)
}

/**
 * @param {Element} element
 * @return {DOM}
 */
function createDOMElement (element) {
	if (element.xmlns)
		return DOM(document.createElementNS(element.xmlns, element.type))
	else
		return DOM(document.createElement(element.type))
}

/**
 * @param {Element} element
 * @return {DOM}
 */
function createDOMText (element) {
	return DOM(document.createTextNode(element.children))
}

/**
 * @param {Element} element
 * @return {DOM}
 */
function createDOMPortal (element) {
	if (typeof element.type === 'string')
		return DOM(document.querySelector(element.type))

	if (isValidDOMNode(element.type))
		return DOM(element.type)

	return DOM(getDOMDocument())
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function removeDOMNode (element, parent) {
	getDOMNode(parent).removeChild(getDOMNode(element))
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function insertDOMNode (element, sibling, parent) {
	getDOMNode(parent).insertBefore(getDOMNode(element), getDOMNode(sibling))
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function appendDOMNode (element, parent) {
	getDOMNode(parent).appendChild(getDOMNode(element))
}
