/**
 * @param {Node} target
 */
function DOM (target) {
	return {target: target}
}

/**
 * @param {Element} element
 * @return {Node}
 */
function DOMNode (element) {
	return element.DOM.target
}

/**
 * @param {Node} target
 * @param {boolean}
 */
function DOMValid (target) {
	return target instanceof Node
}

/**
 * @return {Node}
 */
function DOMRoot () {
	return document.documentElement
}

/**
 * @param {string} type
 * @param {EventListener} listener
 * @param {*} options
 */
function DOMEvent (type, listener, options) {
	document.addEventListener(type, listener, options)
}

/**
 * @param {string} type
 * @param {string} xmlns
 * @return {DOM}
 */
function DOMElement (type, xmlns) {
	return DOM(xmlns ? document.createElementNS(xmlns, type) : document.createElement(type))
}

/**
 * @param {(string|number)} value
 * @return {DOM}
 */
function DOMText (value) {
	return DOM(document.createTextNode(value))
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
 * @param {boolean} xmlns
 * @param {number} hash
 * @param {number} signature
 */
function DOMAttribute (element, name, value, xmlns, hash, signature) {
	if (signature > 0) {
		switch (hash) {
			case 1:
				return DOMNode(element).setAttributeNS(NsLink, name, value)
			case 2:
				return DOMProperty(element, name, value)
			case 3:
				if (!xmlns)
					return DOMProperty(element, name, value)
		}

		if (!xmlns && name in DOMNode(element))
			switch (name) {
				case 'width':
				case 'height':
					if (element.type === 'img')
						break
				default:
					return DOMNode(element)[name] = value
			}

		if (value !== false)
			DOMNode(element).setAttribute(name, value)
		else
			DOMAttribute(element, name, value, xmlns, hash, -1)
	} else if (hash !== 1)
			DOMNode(element).removeAttribute(name)
		else
			DOMNode(element).removeAttributeNS(NsLink, name)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {number} signature
 */
function DOMStyle (element, name, value, signature) {
	if (signature > 0) {
		if (name.indexOf('-') < 0)
			DOMNode(element).style[name] = value
		else
			DOMNode(element).style.setProperty(name, value)
	} else
		for (var key in value)
			DOMStyle(element, key, value[key], 1)
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
