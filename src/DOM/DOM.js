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
 * @param {Object} props
 */
function setDOMStyle (element, props) {
	for (var key in props) {
		var value = props[key]

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
			if (xmlns)
				getDOMNode(element).removeAttributeNS(xmlns, name)

			return getDOMNode(element).removeAttribute(name)				
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
		case 'acceptCharset':
			return setDOMProperties(element, 'accept-charset', value, xmlns)
		case 'httpEquiv':
			return setDOMProperties(element, 'http-equiv', value, xmlns)
		case 'autofocus':
		case 'autoFocus':
			return getDOMNode(element)[value ? 'focus' : 'blur']()
		case 'width':
		case 'height':
			if (element.type === 'img')
				break
		default:
			if (!xmlns && name in getDOMNode(element))
				return setDOMProperty(element, name, value)
	}

	switch (typeof value) {
		case 'object':
		case 'function':
			return setDOMProperty(element, name, value)						
	}

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
 * @param {Element} previous
 * @param {Element} next
 */
function getDOMQuery (element, parent, previous, next) {
	var id = element.id
	var type = element.type.toLowerCase()
	var xmlns = element.xmlns
	var props = element.props
	var children = element.children
	var length = children.length
	var target = previous.active ? getDOMNode(previous).nextSibling : getDOMNode(parent).firstChild 
	var sibling = target
	var node = null

	while (target) {
		if (target.nodeName.toLowerCase() === type) {
			if (id === SharedElementText) {
				if (next.id === SharedElementText)
					target.splitText(length)

				if (target.nodeValue !== children)
					target.nodeValue = children
			} else if (length === 0 && target.firstChild) {
				target.textContent = ''
			}

			if (parent.id === SharedElementPortal)
				createDOMPortal(parent).target.appendChild(target)

			node = createDOMObject(target)			
			type = ''

			if (!(target = target.nextSibling) || next.type)
				break
		}

		if (id === SharedElementText && (length === 0 || xmlns === '#text')) {
			if (target.parentNode.insertBefore((node = createDOMText(element)).target, target)) {				
				if (next.type)
					break
				else
					type = ''
			}
		}

		target = (sibling = target).nextSibling
		sibling.parentNode.removeChild(sibling)
	}

	if (node && (target = node.target).nodeName.toLowerCase() !== '#text')
		for (var attributes = target.attributes, i = attributes.length - 1; i >= 0; --i) {
			var attr = attributes[i]
			var name = attr.name

			if (attr.value !== props[name] + '')
				target.removeAttribute(name)
		}

	return node
}

/**
 * @param {Node} target
 * @param {Object}
 */
function createDOMObject (target) {
	return {target: target}
}

/**
 * @param {Element} element
 * @return {Object}
 */
function createDOMElement (element) {
	if (element.xmlns)
		return createDOMObject(document.createElementNS(element.xmlns, element.type))
	else
		return createDOMObject(document.createElement(element.type))
}

/**
 * @param {Element} element
 * @return {Object}
 */
function createDOMText (element) {
	return createDOMObject(document.createTextNode(element.children))
}

/**
 * @param {Element} element
 * @return {Object}
 */
function createDOMPortal (element) {
	if (typeof element.type === 'string')
		return createDOMObject(getDOMDocument().querySelector(element.type))

	if (isValidDOMNode(element.type))
		return createDOMObject(element.type)

	return createDOMObject(getDOMDocument())
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
