/**
 * @param {Element} element
 * @param {Node} node
 */
function setDOMHost (element, node) {
	client.set(node, element)
}

/**
 * @param {Element} element
 * @param {Node} node
 */
function setDOMNode (element, node) {
	element.DOM = {node: node}
}

/**
 * @param {Element} element
 * @param {Element} children
 */
function setDOMContent (element, children) {
	getDOMNode(element).textContent = ''
}

/**
 * @param {Element} element
 * @param {string} value
 */
function setDOMText (element, value) {
	getDOMNode(element).nodeValue = value
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
 * @param {Object} props
 */
function setDOMStyle (element, props) {
	for (var name in props) {
		var value = props[name]

		if (name.indexOf('-') < 0)
			getDOMNode(element).style[name] = value !== false && value !== undefined ? value : ''
		else
			getDOMNode(element).style.setProperty(name, value)
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
		default:
			getDOMNode(element)[name] = value
	}
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
		default:
			if (!xmlns)
				getDOMNode(element).setAttribute(name, value)
			else
				getDOMNode(element).setAttributeNS(xmlns, name, value)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {string} xmlns
 */
function setDOMProps (element, name, value, xmlns) {
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
		case 'innerHTML':
			return setDOMInnerHTML(element, name, value ? value : '', [])
		case 'dangerouslySetInnerHTML':
			return setDOMProps(element, 'innerHTML', value && value.__html, xmlns)
		case 'acceptCharset':
			return setDOMProps(element, 'accept-charset', value, xmlns)
		case 'httpEquiv':
			return setDOMProps(element, 'http-equiv', value, xmlns)
		case 'tabIndex':
			return setDOMProps(element, name.toLowerCase(), value, xmlns)
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
		default:
			setDOMAttribute(element, name, value, '')
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {string} value
 * @param {Array} nodes
 */
function setDOMInnerHTML (element, name, value, nodes) {
	if (getDOMNode(element)[name])
		element.children.forEach(function (children) {
			nodes.push(getDOMNode(children))
		})

	if (getDOMNode(element)[name] = value)
		nodes.push.apply(nodes, getDOMNode(element).childNodes)

	nodes.forEach(function (node) {
		getDOMNode(element).appendChild(node)
	})
}

/**
 * @param {Node} node
 * @return {Element}
 */
function getDOMHost (node) {
	return client.get(node)
}

/**
 * @param {Element} element
 * @return {Node}
 */
function getDOMNode (element) {
	return element.DOM.node
}

/**
 * @return {Node}
 */
function getDOMDocument () {
	return document.documentElement
}

/**
 * @param {Event} event
 * @return {Node}
 */
function getDOMTarget (event) {
	return event.currentTarget
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
 * @return {Node}
 */
function getDOMPortal (element) {
	if (typeof element.type === 'string')
		return getDOMDocument().querySelector(element.type)

	if (isValidDOMNode(element.type))
		return element.type

	return getDOMDocument()
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {Element} previous
 * @param {Element} next
 */
function getDOMQuery (element, parent, previous, next) {
	var id = element.id
	var type = id > SharedElementNode ? '#text' : element.type.toLowerCase()
	var props = element.props
	var children = element.children
	var length = children.length
	var target = previous.active ? getDOMNode(previous).nextSibling : getDOMNode(parent).firstChild
	var sibling = target
	var node = null

	while (target) {
		if (target.nodeName.toLowerCase() === type) {
			if (id > SharedElementNode) {
				if (next.id > SharedElementNode)
					target.splitText(length)

				if (target.nodeValue !== children)
					target.nodeValue = children
			} else if (length === 0 && target.firstChild) {
				target.textContent = ''
			}

			if (parent.id === SharedElementPortal)
				getDOMPortal(parent).appendChild(target)

			node = target
			type = null

			if (!(target = target.nextSibling) || next.type)
				break
		}

		if (id > SharedElementNode && length === 0) {
			target.parentNode.insertBefore((node = createDOMText(element)), target)

			if (!next.type)
				type = null
			else
				break
		}

		target = (sibling = target).nextSibling
		sibling.parentNode.removeChild(sibling)
	}

	if (node && !node.splitText)
		for (var attributes = node.attributes, i = attributes.length - 1; i >= 0; --i) {
			var name = attributes[i].name

			if (props[name] === undefined)
				node.removeAttribute(name)
		}

	return node
}

/**
 * @param {Node} node
 * @return {boolean}
 */
function isValidDOMHost (node) {
	return client.has(node)
}

/**
 * @param {Node} node
 * @param {boolean}
 */
function isValidDOMNode (node) {
	return !!(node && node.ELEMENT_NODE)
}

/**
 * @param {Event} event
 * @return {boolean}
 */
function isValidDOMEvent (event) {
	return !!(event && event.BUBBLING_PHASE)
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

/**
 * @param {Element} element
 * @return {Node}
 */
function createDOMElement (element) {
	if (element.xmlns)
		return document.createElementNS(element.xmlns, element.type)

	return document.createElement(element.type)
}

/**
 * @param {Element} element
 * @return {Node}
 */
function createDOMText (element) {
	return document.createTextNode(element.children)
}

/**
 * @param {Element} element
 * @return {Node}
 */
function createDOMEmpty (element) {
	return document.createTextNode('')
}
