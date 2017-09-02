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
 * @param {*} node
 * @return {Element}
 */
function elementIntermediate (node) {
	var element = new Element(SharedElementIntermediate)

	element.context = {}
	element.DOM = node

	return element
}

/**
 * @param {(Element|Array|List)} fragment
 * @return {Element}
 */
function elementFragment (fragment) {
	var element = new Element(SharedElementFragment)
	var children = new List()
	
	element.type = '#fragment'
	element.children = children

	switch (fragment.constructor) {
		case Element:
			elementChildren(element, children, fragment, 0)
			break
		case Array:
			for (var i = 0; i < fragment.length; ++i)
				elementChildren(element, children, fragment[i], i)
	}

	return element
}

/**
 * @param {Iterable} iterable
 * @param {Element} element
 */
function elementIterable (iterable, element) {	
	var index = 0

	each(iterable, function (value) {
		index = elementChildren(element, element.children, value, index)
	})

	return element
}

/**
 * @param {*} child
 * @return {Element}
 */
function elementUnknown (child) {
	if (typeof child.next === 'function')
		return elementIterable(child, elementFragment(child))
	if (typeof child[SymbolIterator] === 'function')
		return elementUnknown(child[SymbolIterator]())
	else if (typeof child === 'function')
		return elementUnknown(child())
	else if (child instanceof Error)
		return createElement('details', createElement('summary', child+''), h('pre', child.report || child.stack))
	else if (child instanceof Date)
		return elementText(child)

	invariant(SharedSiteRender, 'Invalid element [object '+getDisplayName(child)+']')
}

/**
 * @param {Element} element
 * @param {number} signature
 * @return {Element}
 */
function elementPrev (element, signature) {
	return elementSibling(element, 'prev', signature)
}

/**
 * @param {Element} element
 * @param {number} signature
 * @return {Element}
 */
function elementNext (element, signature) {
	return elementSibling(element, 'next', signature)
}

/**
 * @param {Element} element
 * @param {string} direction
 * @param {number} signature
 * @return {Element}
 */
function elementSibling (element, direction, signature) {
	if (signature < SharedElementIntermediate)
		return element.id < SharedElementIntermediate ? elementSibling(element, direction, -signature) : element

	if (signature === SharedMountInsert && element.id < SharedElementPortal && isValidElement(element.children[direction]))
		return elementSibling(element.children[direction], direction, -signature)
	
	if (isValidElement(element[direction]))
		return elementSibling(element[direction], direction, -signature)

	return elementIntermediate(DOM(null))
}

/**
 * @param {Element} element
 * @param {List} children
 * @param {*} child
 * @param {number} index
 */
function elementChildren (element, children, child, index) {
	if (child == null)
		return elementChildren(element, children, elementText(''), index)

	switch (child.constructor) {
		case Element:
			if (child.key == null)
				child.key = '0|'+index
			else if (element.keyed === false)
				element.keyed = true

			children.push(child)
			break
		case Array:
			for (var i = 0; i < child.length; ++i)
				elementChildren(element, children, child[i], index + i)

			return index + i
		case String:
		case Number:
			return elementChildren(element, children, elementText(child), index)
		case Function:
		case Promise:
			return elementChildren(element, children, createElement(child), index)
		case Boolean:
			return elementChildren(element, children, null, index)
		default:
			return elementChildren(element, children, elementUnknown(child), index)
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
