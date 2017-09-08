function DOM (target) {
	return {target: target}
}

/**
 * @return {Node}
 */
function DOMDocument () {
	return document.documentElement
}

/**
 * @param {Node} target
 * @param {boolean}
 */
function DOMValid (target) {
	return !!(target && target.ELEMENT_NODE)
}

/**
 * @param {Element} element
 * @return {Node}
 */
function DOMTarget (element) {
	return element.DOM.target
}

/**
 * @param {(EventListener|Element)} element
 * @param {string} type
 */
function DOMEvent (element, type) {
	DOMTarget(element).addEventListener(type, element, false)
}

/**
 * @param {Element} element
 * @return {DOM}
 */
function DOMElement (element) {
	if (element.xmlns)
		return DOM(document.createElementNS(element.xmlns, element.type))
	else
		return DOM(document.createElement(element.type))
}

/**
 * @param {Element} element
 * @return {DOM}
 */
function DOMText (element) {
	return DOM(document.createTextNode(element.children))
}

/**
 * @param {Element} element
 */
function DOMContent (element) {
	DOMTarget(element).textContent = ''
}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function DOMValue (element, value) {
	DOMTarget(element).nodeValue = value
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMRemove (element, parent) {
	DOMTarget(parent).removeChild(DOMTarget(element))
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function DOMInsert (element, sibling, parent) {
	DOMTarget(parent).insertBefore(DOMTarget(element), DOMTarget(sibling))
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMAppend (element, parent) {
	DOMTarget(parent).appendChild(DOMTarget(element))
}

/**
 * @param {Element} element
 * @param {Object} declaration
 */
function DOMStyle (element, declaration) {
	for (var key in declaration) {
		var value = declaration[key]

		if (key.indexOf('-') < 0)
			DOMTarget(element).style[key] = value !== false && value !== undefined ? value : null
		else
			DOMTarget(element).style.setProperty(key, value)
	}
}

/**
 * @param {Element} element
 * @param {string} name 
 * @param {*} value
 */
function DOMProperty (element, name, value) {
	switch (value) {
		case null:
		case false:
		case undefined:
			return DOMProperty(element, name, '')
	}

	DOMTarget(element)[name] = value
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {string} xmlns
 */
function DOMAttribute (element, name, value, xmlns) {
	switch (value) {
		case null:
		case false:
		case undefined:
			if (!xmlns)
				DOMTarget(element).removeAttribute(name)
			else
				DOMTarget(element).removeAttributeNS(xmlns, name)
			return
		case true:
			return DOMAttribute(element, name, '', xmlns)
	}

	if (!xmlns)
		DOMTarget(element).setAttribute(name, value)
	else
		DOMTarget(element).setAttributeNS(xmlns, name, value)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {string} xmlns
 */
function DOMProperties (element, name, value, xmlns) {
	switch (name) {
		case 'className':
			if (!xmlns && value)
				return DOMProperty(element, name, value)
		case 'class':
			return DOMAttribute(element, 'class', value, '')
		case 'style':
			if (typeof value === 'object')
				return DOMStyle(element, value)
			break
		case 'xlink:href':
			return DOMAttribute(element, name, value, 'http://www.w3.org/1999/xlink')
		case 'dangerouslySetInnerHTML':
			return DOMProperties(element, 'innerHTML', value ? value.__html : '', '')
		case 'innerHTML':
			if (DOMTarget(element)[name] !== value)
				DOMProperty(element, name, value)
			return
		case 'width':
		case 'height':
			if (element.type === 'img')
				break
		default:
			if (!xmlns && name in DOMTarget(element))
				return DOMProperty(element, name, value)
	}

	if (typeof value === 'object')
		DOMProperty(element, name, value)
	else
		DOMAttribute(element, name, value, '')
}

/**
 * @param {string} type
 * @param {string} xmlns
 */
function DOMType (type, xmlns) {
	switch (type) {
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
 * @param {Element} parent
 */
function DOMFind (element, parent) {
	var id = element.id
	var type = element.type.toLowerCase()
	var children = element.children
	var length = children.length
	var prev = elementSibling(element, 'prev')
	var next = elementSibling(element, 'next')
	var prevNode = prev.DOM
	var nextNode = null

	if (id === SharedElementText && length === 0)
		return nextNode

	var target = prevNode ? DOMTarget(prev).nextSibling : DOMTarget(parent).firstChild 
	var current = target
	var sibling = target

	while (target)
		switch (target.nodeName.toLowerCase()) {
			case type:
				if (id === SharedElementText) {
					if (next !== element && next.id === SharedElementText)
						target.splitText(length)

					if (target.nodeValue !== children)
						target.nodeValue = children
				}

				nextNode = DOM(target)
				type = ''

				if (!(target = target.nextSibling) || next !== element)
					break
		default:
			target = (sibling = target).nextSibling

			if (!prevNode || current !== sibling)
				sibling.parentNode.removeChild(sibling)
		}

	return nextNode
}
