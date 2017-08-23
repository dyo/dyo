/**
 * @return {Node}
 */
function DOMDocument () {
	return document.documentElement
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
	if (signature < 1)
		return hash !== 1 ? element.DOM.target.removeAttribute(name) : element.DOM.target.removeAttributeNS(name)

	switch (hash) {
		case 1:
			return element.DOM.target.setAttributeNS('http://www.w3.org/1999/xlink', name, value)
		case 2:
			return DOMProperty(element, name, value)
		case 3:
			if (!xmlns)
				return DOMProperty(element, name, value)
	}

	if (!xmlns && name in element.DOM.target)
		switch (name) {
			case 'width':
			case 'height':
				if (element.type === 'img')
					break
			default:
				return DOMProperty(element, name, value)
		}

	if (value !== false)
		element.DOM.target.setAttribute(name, value)
	else
		DOMAttribute(element, name, value, xmlns, hash, -1)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 */
function DOMProperty (element, name, value) {
	try {
		element.DOM.target[name] = value
	} catch (e) {}
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
			element.DOM.target.style[name] = value
		else
			element.DOM.target.style[value != null ? 'setProperty' : 'removeProperty'](name, value)
	} else
		for (var key in value)
			DOMStyle(element, key, value[key], 1)
}

/**
 * @param {(string|number)} value
 * @return {Object}
 */
function DOMText (value) {
	return {target: document.createTextNode(value)}
}

/**
 * @param {Element} element
 * @return {Object}
 */
function DOMElement (element) {
	return {target: element.xmlns ? document.createElementNS(xmlns, type) : document.createElement(element.type)}
}

/**
 * @param {Element} element
 */
function DOMContent (element) {
	element.DOM.target.textContent = ''
}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function DOMValue (element, value) {
	element.DOM.target.nodeValue = value
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMRemove (element, parent) {
	parent.DOM.target.removeChild(element.DOM.target)
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function DOMInsert (element, sibling, parent) {
	parent.DOM.target.insertBefore(element.DOM.target, sibling.DOM.target)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMAppend (element, parent) {
	parent.DOM.target.appendChild(element.DOM.target)
}
