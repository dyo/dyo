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
	return target instanceof Node
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
 * @param {string} name
 * @param {*} value
 */
function DOMStyle (element, value) {
	for (var key in value)
		if (key.indexOf('-') < 0)
			DOMTarget(element).style[key] = value[key]
		else
			DOMTarget(element).style.setProperty(key, value[key])
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
 * @param {Element} sibling
 * @param {Element} parent
 */
function DOMFind (element, sibling, parent) {
	var target = sibling.type ? DOMTarget(sibling).nextSibling : DOMTarget(parent).firstChild
	var type = element.type.toLowerCase()

	while (target)
		switch (target.nodeName.toLowerCase()) {
			case type:
				if (element.flag === ElementText) {
					if (element.next.flag === ElementText)
						target = target.splitText(element.children.length)

					if (target.nodeValue !== element.children)
						target.nodeValue = element.children
				}

				return DOM(target)
			default:
				target.parentNode.removeChild((target = target.nextSibling).previousSibling)
		}

	return null
}
