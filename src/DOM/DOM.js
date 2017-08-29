/**
 * @param {Node} target
 */
function DOM (target) {
	return {target: target}
}

/**
 * @return {Node}
 */
function DOMRoot () {
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
function DOMNode (element) {
	return element.DOM.target
}

/**
 * @param {(EventListener|Element)} element
 * @param {string} type
 */
function DOMEvent (element, type) {
	DOMNode(element).addEventListener(type, element, false)
}

/**
 * @param {Element} element
 * @return {DOM}
 */
function DOMElement (element) {
	if (element.xmlns) 
		return DOM(document.createElementNS(element.xmlns, element.type))

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
	DOMNode(element).textContent = ''
}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function DOMValue (element, value) {
	DOMNode(element).nodeValue = value
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMRemove (element, parent) {
	DOMNode(parent).removeChild(DOMNode(element))
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function DOMInsert (element, sibling, parent) {
	DOMNode(parent).insertBefore(DOMNode(element), DOMNode(sibling))
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMAppend (element, parent) {
	DOMNode(parent).appendChild(DOMNode(element))
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 */
function DOMStyle (element, value) {
	for (var key in value)
		if (key.indexOf('-') < 0)
			DOMNode(element).style[key] = value[key]
		else
			DOMNode(element).style.setProperty(key, value[key])
}

/**
 * @param {Element} element
 * @param {string} name 
 * @param {*} value
 */
function DOMProperty (element, name, value) {
	DOMNode(element)[name] = value
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {string} xmlns
 */
function DOMAttribute (element, name, value, xmlns) {
	if (value !== false && value != null) {
		if (!xmlns)
			DOMNode(element).setAttribute(name, value)
		else
			DOMNode(element).setAttributeNS(xmlns, name, value)
	} else {
		if (!xmlns)
			DOMNode(element).setAttribute(name, value)
		else
			DOMNode(element).removeAttributeNS(xmlns, name)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {string} xmlns
 */
function DOMProperties (element, name, value, xmlns) {
	switch (name) {
		case 'xlink:href':
			return DOMAttribute(element, name, value, 'http://www.w3.org/1999/xlink')
		case 'key':
		case 'xmlns':
		case 'children':
			return
		case 'dangerouslySetInnerHTML':
			return DOMProperty(element, 'innerHTML', value ? value.__html : '')
		case 'style':
			if (typeof value === 'object')
				return DOMStyle(element, value)
			
			break
		case 'className':
			if (xmlns || value === false || value == null)
				return DOMAttribute(element, 'class', value, xmlns)
			
			return DOMProperty(element, name, value)
		case 'width':
		case 'height':
			if (element.type === 'img')
				break
		default:
			if (!xmlns && name in DOMNode(element))
				return DOMProperty(element, name, value)
	}

	if (typeof value === 'object')
		DOMProperty(element, name, value)
	else
		DOMAttribute(element, name, value, xmlns)
}

/**
 * @param {string} type
 * @param {string} xmlns
 */
function DOMScope (type, xmlns) {
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
