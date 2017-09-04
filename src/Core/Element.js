/**
 * @constructor
 * @param {number} id
 */
function Element (id) {
	this.id = id
	this.work = SharedWorkSync
	this.keyed = false
	this.xmlns = ''
	this.key = null
	this.ref = null
	this.type = null
	this.props = null
	this.state = null
	this.children = null
	this.owner = null
	this.instance = null
	this.event = null
	this.DOM = null
	this.context = null
	this.parent = null
	this.host = null
	this.next = null
	this.prev = null
}

/**
 * @param {*} content
 * @return {Element}
 */
function elementText (content) {
	var element = new Element(SharedElementText)

	element.type = '#text'
	element.children = content

	return element
}

/**
 * @param {DOM} node
 * @return {Element}
 */
function elementIntermediate (node) {
	var element = new Element(SharedElementIntermediate)

	element.DOM = node

	return element
}

/**
 * @param {(Element|Array)} fragment
 * @return {Element}
 */
function elementFragment (fragment) {
	var element = new Element(SharedElementFragment)
	var children = new List()
	var i = 0

	element.type = '#fragment'
	element.children = children

	if (isValidElement(fragment))
		elementChildren(element, children, fragment, i)
	else if (Array.isArray(fragment))
		for (; i < fragment.length; ++i)
			elementChildren(element, children, fragment[i], i)				

	return element
}

/**
 * @param {Iterable} iterable
 * @param {Element} element
 */
function elementIterable (iterable, element) {	
	var index = 0

	each(iterable, function (value, index) {
		return elementChildren(element, element.children, value, index)
	})

	return element
}

/**
 * @param {*} element
 * @return {Element}
 */
function elementUnknown (element) {
	if (typeof element.next === 'function')
		return elementIterable(element, elementFragment(element))
	if (typeof element[SymbolIterator] === 'function')
		return elementUnknown(element[SymbolIterator]())
	else if (typeof element === 'function')
		return elementUnknown(element())
	else if (element instanceof Error)
		return createElement('details', createElement('summary', element+''), h('pre', element.report || element.stack))
	else if (element instanceof Date)
		return elementText(element)

	invariant(SharedSiteRender, 'Invalid element [object '+getDisplayName(element)+']')
}

/**
 * @param {Element} element
 * @param {string} direction
 * @return {Element}
 */
function elementSibling (element, direction) {
	if (isValidElement(element[direction]))
		return element[direction]

	if (getHostElement(element.host) === element)
		return elementSibling(element.host, direction)

	return element
}

/**
 * @param {Element} parent
 * @param {List} children
 * @param {*} element
 * @param {number} index
 */
function elementChildren (parent, children, element, index) {
	if (element == null)
		return elementChildren(parent, children, elementText(''), index)

	switch (element.constructor) {
		case Element:
			if (element.key == null)
				element.key = '0|'+index
			else if (parent.keyed === false)
				parent.keyed = true

			children.push(element)
			break
		case Array:
			for (var i = 0; i < element.length; ++i)
				elementChildren(parent, children, element[i], index + i)

			return index + i
		case String:
		case Number:
			return elementChildren(parent, children, elementText(element), index)
		case Function:
		case Promise:
			return elementChildren(parent, children, createElement(element), index)
		case Boolean:
			return elementChildren(parent, children, null, index)
		default:
			return elementChildren(parent, children, elementUnknown(element), index)
	}

	return index + 1
}

/**
 * @param {Element} element
 * @return {boolean}
 */
function isValidElement (element) {
	return element instanceof Element
}

/**
 * @param {Element}
 * @param {Object=}
 * @param {...}
 * @return {Element}
 */
function cloneElement () {
	return createElement.apply(null, arguments)
}

/**
 * @param {(string|function|Promise)} type
 * @param {Object?=} props
 * @param {...}
 * @return {Element}
 */
function createElement (type, props) {
	var i = props != null ? 1 : 2
	var size = 0
	var index = 0
	var id = typeof type !== 'function' ? SharedElementNode : SharedElementComponent
	var length = arguments.length
	var element = new Element(id)
	var children = id !== SharedElementComponent ? new List() : null
	
	if (i < 2)
		switch (props.constructor) {
			case Object:
				if (props[SymbolIterator] === undefined) {
					if (props.key !== undefined)
						element.key = props.key

					if (props.ref !== undefined)
						element.ref = props.ref

					if (id !== SharedElementComponent) {
						if (props.xmlns !== undefined)
							element.xmlns = props.xmlns

						if (props.children !== undefined)
							props.children = void elementChildren(element, children, props.children, index)
					}

					element.props = props
					i++
					break
				}
			default:
				element.props = {}
		}
	else
		element.props = {}

	if ((size = length - i) > 0) {
		if (id !== SharedElementComponent)
			for (; i < length; ++i)
				index = elementChildren(element, children, arguments[i], index)
		else {
			if (size > 1)
				for (children = Array(size); i < length; ++i)
					children[index++] = arguments[i]
			else
				children = arguments[i]

			element.props.children = children
		}
	}	

	switch ((element.children = children, element.type = type).constructor) {
		case Function:
			if (type.defaultProps)
				element.props = getDefaultProps(element, type.defaultProps, props)
		case String:
			break
		case Element:
			element.id = type.id
			element.type = type.type
			element.props = assign({}, type.props, element.props)						
			break
		case Promise:
			element.id = SharedElementPromise
			break
		default:
			if (DOMValid(type))
				element.id = SharedElementPortal
	}

	return element
}
