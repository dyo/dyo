/**
 * @constructor
 * @param {number} flag
 */
function Element (flag) {
	this.flag = flag
	this.sync = 0
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
	this.host = null
	this.parent = null
	this.event = null
	this.style = null
	this.DOM = null
	this.context = null
	this.next = null
	this.prev = null
}
Element.prototype = Object.create(null, {
	constructor: {value: Element}
})

/**
 * @param {*} content
 * @return {Element}
 */
function elementText (content) {
	var element = new Element(ElementText)

	element.type = TypeText
	element.children = content

	return element
}

/**
 * @return {Element} children
 */
function elementIntermediate (children) {
	var element = new Element(ElementIntermediate)

	element.children = children
	element.context = {}
	element.DOM = {node: null}

	return element
}

/**
 * @param {(Element|Array|List)} fragment
 * @return {Element}
 */
function elementFragment (fragment) {
	var element = new Element(ElementFragment)
	var children = new List()
	
	element.type = TypeFragment
	element.children = children

	switch (fragment.constructor) {
		case Element:
			elementChildren(element, children, fragment, 0)
			break
		case Array:
			for (var i = 0; i < fragment.length; i++)
				elementChildren(element, children, fragment[i], i)
			break
		case List:
			fragment.forEach(function (fragment, i) {
				elementChildren(element, children, fragment, i)
			})
	}

	return element
}

/**
 * @param {Iterable} iterable
 * @param {Element} element
 */
function elementIterable (iterable, element) {	
	var index = 0
	var children = element.children
	var value = iterable.next()

	while (value.done !== true) {
		index = elementChildren(element, children, value.value, index)
		value = iterable.next(value.value)
	}

	return element
}

/**
 * @param {*} child
 * @return {Element}
 */
function elementUnknown (child) {
	if (typeof child.next === 'function')
		return elementIterable(child, elementFragment(child))
	else if (typeof child[Iterator] === 'function')
		return elementUnknown(child[Iterator]())
	else if (typeof child === 'function')
		return elementUnknown(child())
	else
		return createElement('pre', JSON.stringify(child, null, 2))
}

/**
 * @param {Element} element
 * @param {number} signature
 * @return {Element}
 */
function elementSibling (element, signature) {
	if (signature > 0 && element.flag !== ElementPortal && isValidElement(element.children.next))
		return element.children.next
	else if (isValidElement(element.next))
		return element.next
	else
		return elementIntermediate(element)
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
	else
		switch (child.constructor) {
			case Element:
				if (child.key !== null && element.keyed === false)
					element.keyed = true

				children.push(child)
				break
			case List:
			case Array:
				for (var i = 0; i < child.length; i++)
					elementChildren(element, children, child[i], index+i)

				return index+i
			case String:
			case Number:
			case Error:
			case Date:
				return elementChildren(element, children, elementText(child), index)
			case Function:
			case Promise:
				return elementChildren(element, children, createElement(child), index)
			case Boolean:
			case Symbol:
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
 * @param {Object}
 * @return {boolean}
 */
function isValidPortal (element) {
	return element instanceof Node
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
	var flag = typeof type !== 'function' ? ElementNode : ElementComponent
	var children = null
	var length = arguments.length
	var element = new Element(flag)

	if (i < 2)
		switch (props.constructor) {
			case Object:
				if (props[Iterator] === undefined) {
					if (props.key != null)
						element.key = props.key

					if (props.xmlns != null)
						element.xmlns = props.xmlns

					if (props.ref != null)
						element.ref = props.ref

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
		if (flag !== ElementComponent)
			for (children = element.children = new List(); i < length; i++)
				index = elementChildren(element, children, arguments[i], index)
		else {
			if (size > 1)
				for (children = Array(size); i < length; i++)
					children[index++] = arguments[i]
			else
				children = arguments[i]

			element.props.children = children
		}
	} else if (flag === ElementNode)
		element.children = new List()

	switch ((element.type = type).constructor) {
		case Function:
			if (type.defaultProps != null)
				element.props = getDefaultProps(element, type.defaultProps, props)
		case String:
			break
		case Element:
			element.flag = type.flag
			element.type = type.type
			element.props = assign({}, type.props, element.props)						
			break
		case Promise:
			element.flag = ElementPromise
			break
		default:
			if (isValidPortal(type))
				element.flag = ElementPortal
	}

	return element
}
