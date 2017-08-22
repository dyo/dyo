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
		return hash !== 1 ? element.DOM.node.removeAttribute(name) : element.DOM.node.removeAttributeNS(name)

	switch (hash) {
		case 1:
			return element.DOM.node.setAttributeNS('http://www.w3.org/1999/xlink', name, value)
		case 2:
			return DOMProperty(element, name, value)
		case 3:
			if (!xmlns)
				return DOMProperty(element, name, value)
	}

	if (!xmlns && name in element.DOM.node)
		switch (name) {
			case 'width':
			case 'height':
				if (element.type === 'img')
					break
			default:
				return DOMProperty(element, name, value)
		}

	if (value !== false)
		element.DOM.node.setAttribute(name, value)
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
		element.DOM.node[name] = value
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
		if (name.charCodeAt(0) !== 45)
			element.DOM.node.style[name] = value
		else
			element.DOM.node.style.setProperty(name, value)
	} else
		for (var key in value)
			DOMStyle(element, key, value[key], 1)
}


/**
 * @param {Element} element
 * @param {string} type
 * @param {(function|EventListener)} listener
 * @param {number} signature
 */
function DOMEvent (element, type, listener, signature) {
	if (signature > 0)
		element.DOM.node.addEventListener(type, listener, false)
	else
		element.DOM.node.removeEventListener(type, listener, false)
}

/**
 * @param {(string|number)} value
 * @return {Object}
 */
function DOMText (value) {
	return {node: document.createTextNode(value)}
}

/**
 * @param {Element} element
 * @return {Object}
 */
function DOMElement (element) {
	return {node: element.xmlns ? document.createElementNS(xmlns, type) : document.createElement(element.type)}
}

/**
 * @param {Element} element
 */
function DOMContent (element) {
	element.DOM.node.textContent = ''
}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function DOMValue (element, value) {
	element.DOM.node.nodeValue = value
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMRemove (element, parent) {
	parent.DOM.node.removeChild(element.DOM.node)
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function DOMInsert (element, sibling, parent) {
	parent.DOM.node.insertBefore(element.DOM.node, sibling.DOM.node)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMAppend (element, parent) {
	parent.DOM.node.appendChild(element.DOM.node)
}
