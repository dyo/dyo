/**
 * @param {Element} element
 */
function setDOMDocument (element) {
	element.owner.textContent = ''
}

/**
 * @param {Element} element
 * @param {string} value
 */
function setDOMText (element, value) {
	element.owner.nodeValue = value
}

/**
 * @param {Element} element
 * @param {string} value
 */
function setDOMComment (element, value) {
	element.owner.nodeValue = value
}

/**
 * @param {Element} element
 * @param {string} type
 * @param {(function|EventListener)?} callback
 */
function setDOMEvent (element, type, callback) {
	if (!element.cache)
		element.cache = {}

	if (!element.cache[type])
		element.owner.addEventListener(type, element, false)

	element.cache[type] = callback
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {(object|string)?} value
 */
function setDOMStyle (element, name, value) {
	if (typeof value !== 'object')
		return setDOMAttribute(element, name, value, '')

	for (var property in value) {
		var declaration = value[property]

		if (property.indexOf('-') === -1)
			element.owner.style[property] = declaration !== false && declaration !== undefined ? declaration : ''
		else
			element.owner.style.setProperty(property, declaration)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {any} value
 */
function setDOMProperty (element, name, value) {
	switch (value) {
		case null:
		case false:
		case undefined:
			return setDOMAttribute(element, name, value, element.owner[name] = '')
		default:
			element.owner[name] = value
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {any} value
 * @param {string?} xmlns
 */
function setDOMAttribute (element, name, value, xmlns) {
	switch (value) {
		case null:
		case false:
		case undefined:
			if (xmlns)
				element.owner.removeAttributeNS(xmlns, name)

			return element.owner.removeAttribute(name)
		case true:
			return setDOMAttribute(element, name, '', xmlns)
		default:
			if (!xmlns)
				element.owner.setAttribute(name, value)
			else
				element.owner.setAttributeNS(xmlns, name, value)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {any} value
 * @param {string?} xmlns
 * @param {number} signature
 */
function setDOMProps (element, name, value, xmlns, signature) {
	switch (name) {
		case 'style':
			return setDOMStyle(element, name, value)
		case 'className':
			if (!xmlns && value)
				return setDOMProperty(element, name, value)
		case 'class':
			return setDOMAttribute(element, 'class', value, '')
		case 'xlink:href':
			return setDOMAttribute(element, name, value, 'http://www.w3.org/1999/xlink')
		case 'innerHTML':
			return setDOMInnerHTML(element, name, value ? value : '', [])
		case 'dangerouslySetInnerHTML':
			return setDOMProps(element, 'innerHTML', value && value.__html, xmlns, signature)
		case 'acceptCharset':
			return setDOMProps(element, 'accept-charset', value, xmlns, signature)
		case 'httpEquiv':
			return setDOMProps(element, 'http-equiv', value, xmlns, signature)
		case 'tabIndex':
			return setDOMProps(element, name.toLowerCase(), value, xmlns, signature)
		case 'autofocus':
		case 'autoFocus':
			return element.owner[value ? 'focus' : 'blur']()
		case 'defaultValue':
			if (element.type === 'select')
				return
			break
		case 'width':
		case 'height':
			if (element.type === 'img')
				return setDOMAttribute(element, name, value, '')
	}

	if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 2)
		return setDOMEvent(element, name.substring(2).toLowerCase(), value)

	switch (typeof value) {
		case 'object':
			return setDOMProperty(element, name, value && element.props[name])
		case 'string':
		case 'number':
		case 'boolean':
			if (xmlns || !(name in element.owner))
				return setDOMAttribute(element, name, value, '')
		default:
			setDOMProperty(element, name, value)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {string} value
 * @param {Array<Node>} nodes
 */
function setDOMInnerHTML (element, name, value, nodes) {
	if (element.owner[name])
		element.children.forEach(function (children) {
			nodes.push(children.owner)
		})

	if (element.owner[name] = value)
		nodes.push.apply(nodes, element.owner.childNodes)

	nodes.forEach(function (node) {
		element.owner.appendChild(node)
	})
}

/**
 * @param {Element} element
 * @return {object}
 */
function getDOMContext (element) {
	return {}
}

/**
 * @param {Element} element
 * @return {Node}
 */
function getDOMOwner (element) {
	return element.owner
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
 * @param {Event} event
 * @return {function}
 */
function getDOMListener (element, event) {
	return element.cache[event.type]
}

/**
 * @param {Element} element
 * @param {string?} xmlns
 */
function getDOMType (element, xmlns) {
	switch (element.type) {
		case 'svg':
			return 'http://www.w3.org/2000/svg'
		case 'math':
			return 'http://www.w3.org/1998/Math/MathML'
		case 'foreignObject':
			return
	}

	return xmlns
}

/**
 * @param {Element} element
 * @param {object} props
 * @return {object?}
 */
function getDOMInitialProps (element, props) {
	switch (element.type) {
		case 'input':
			return merge({type: null, step: null, min: null, max: null}, props)
		case 'select':
			if (props.defaultValue != null || props.multiple)
				return merge({value: props.defaultValue}, props)
	}

	return props
}

/**
 * @param {Element} element
 * @param {object} props
 * @return {object?}
 */
function getDOMUpdatedProps (element, props) {
	return props
}

/**
 * @param {Element} element
 * @param {any?} container
 * @return {Node}
 */
function getDOMPortal (element, container) {
	if (typeof container === 'string')
		return getDOMDocument().querySelector(container)

	if (isValidDOMTarget(container))
		return container

	return getDOMDocument()
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {Element} previousSibling
 * @param {Element} nextSibling
 * @return {Node?}
 */
function getDOMQuery (element, parent, previousSibling, nextSibling) {
	var id = element.id
	var type = id > SharedElementComment ? '#text' : element.type.toLowerCase()
	var children = element.children
	var length = children.length
	var target = previousSibling.active ? previousSibling.owner.nextSibling : parent.owner.firstChild
	var sibling = target
	var node = null

	while (target) {
		if (target.nodeName.toLowerCase() === type) {
			if (id > SharedElementNode) {
				if (id > SharedElementComment)
					if (nextSibling.id > SharedElementNode)
						target.splitText(0)

				if (target.nodeValue !== children)
					target.nodeValue = children
			} else if (length === 0 && target.firstChild) {
				target.textContent = ''
			}

			if (parent.id === SharedElementPortal)
				getDOMPortal(parent, parent.type).appendChild(target)

			node = target
			type = null

			if (!(target = target.nextSibling) || nextSibling.type)
				break
		}

		if (id > SharedElementComment && length === 0) {
			target.parentNode.insertBefore(node = createDOMText(element), target)

			if (!nextSibling.type)
				type = null
			else
				break
		}

		target = (sibling = target).nextSibling
		sibling.parentNode.removeChild(sibling)
	}

	if (node && node.attributes)
		for (var props = element.props, attributes = node.attributes, i = attributes.length - 1; i >= 0; --i)
			if (props[type = attributes[i].name] == null)
				node.removeAttribute(type)

	return node
}

/**
 * @param {function} constructor
 * @return {boolean}
 */
function isValidDOMComponent (constructor) {
	return isValidDOMTarget(constructor[SharedSitePrototype])
}

/**
 * @param {object?} target
 * @param {boolean}
 */
function isValidDOMTarget (target) {
	return target != null && target.ELEMENT_NODE === 1
}

/**
 * @param {object?} event
 * @return {boolean}
 */
function isValidDOMEvent (event) {
	return event != null && event.BUBBLING_PHASE === 3
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {Element} host
 */
function willDOMUnmount (element, parent, host) {}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function insertDOMChild (element, sibling, parent) {
	parent.owner.insertBefore(element.owner, sibling.owner)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function appendDOMChild (element, parent) {
	parent.owner.appendChild(element.owner)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function removeDOMChild (element, parent) {
	parent.owner.removeChild(element.owner)
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

/**
 * @param {Element} element
 * @return {Node}
 */
function createDOMComment (element) {
	return document.createComment(element.children)
}

/**
 * @param {Element} element
 * @return {Node}
 */
function createDOMElement (element) {
	return element.xmlns ? document.createElementNS(element.xmlns, element.type) : document.createElement(element.type)
}

/**
 * @param {Element} element
 * @return {Node}
 */
function createDOMComponent (element) {
	return new element.type(element.props)
}
