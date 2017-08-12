/**
 * @constructor
 * @param {Node} node
 */
function DOM (node) {
	this.node = node
}
/**
 * @type {Object}
 */
DOM.prototype = Object.create(null)


/**
 * @param {DOM} element
 * @param {string} name
 * @param {*} value
 */
function DOMProperty (element, name, value) {
	try {
		element.node[name] = value
	} catch (e) {}
}

/**
 * @param {DOM} element
 * @param {string} name
 * @param {*} value
 * @param {number} signature
 * @param {boolean} xmlns
 * @param {number} type
 */
function DOMAttribute (element, name, value, signature, xmlns, type) {
	if (signature > 0)
		switch (type) {
			case 0:
				return merge(element.node[name], value)
			case 1:
				return element.node.setAttributeNS(NSXlink, name, value)
			case 2:
				return DOMProperty(element, name, value)
			case 3:
				if (xmlns === false)
					return DOMProperty(element, name, value)
			default:
				if (xmlns === false && name in element.node)
					switch (name) {
						case 'width':
						case 'height':
							if (typeof value === 'string')
								break
						default:
							return DOMProperty(element, name, value)
					}

				if (value !== false)
					element.node.setAttribute(name, value)
				else
					DOMAttribute(element, name, value, -1, xmlns, type)
		}
	else if (type !== 1)
		element.node.removeAttribute(name)
	else
		element.node.removeAttributeNS(name)
}


/**
 * @param {DOM} element
 * @param {string} type
 * @param {(function|EventListener)} listener
 * @param {number} signature
 */
function DOMEvent (element, type, listener, signature) {
	if (signature > 0)
		element.node.addEventListener(type, listener, false)
	else
		element.node.removeEventListener(type, listener, false)
}


/**
 * @param {DOM} element
 * @param {(string|number)} value
 */
function DOMContent (element, value) {
	element.node.nodeValue = value
}

/**
 * @param {(string|number)} value
 * @return {DOM}
 */
function DOMText (value) {
	return {
		node: document.createTextNode(value)
	}
}

/**
 * @param {string} type
 * @param {string?} xmlns
 * @return {DOM}
 */
function DOMElement (type, xmlns) {
	return {
		node: xmlns === null ? document.createElement(type) : document.createElementNS(xmlns, type)
	}
}

/**
 * @param {DOM} element
 * @param {DOM} sibling
 * @param {DOM} parent
 */
function DOMReplace (element, sibling, parent) {
	parent.node.replaceChild(element.node, sibling.node)
}

/**
 * @param {DOM} element
 * @param {DOM} parent
 */
function DOMRemove (element, parent) {
	parent.node.removeChild(element.node)
}

/**
 * @param {DOM} element
 * @param {DOM} sibling
 * @param {DOM} parent
 */
function DOMInsert (element, sibling, parent) {
	parent.node.insertBefore(element.node, sibling.node)
}

/**
 * @param {DOM} element
 * @param {DOM} parent
 */
function DOMAppend (element, parent) {
	parent.node.appendChild(element.node)
}
