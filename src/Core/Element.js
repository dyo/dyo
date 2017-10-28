/**
 * @constructor
 * @param {number} id
 */
function Element (id) {
	this.id = id
	this.work = SharedWorkIdle
	this.active = false
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
 * @type {Object}
 */
merge(Element.prototype, {
	UUID: SymbolElement,
	handleEvent: handleEvent
})

/**
 * @param {Element} element
 * @return {Element}
 */
function createElementImmutable (snapshot) {
	var element = new Element(snapshot.id)

	element.type = snapshot.type
	element.props = snapshot.props
	element.xmlns = snapshot.xmlns
	element.key = snapshot.key
	element.ref = snapshot.ref
	element.children = snapshot.children

	return element
}

/**
 * @return {Element}
 */
function createElementIntermediate () {
	return new Element(SharedElementIntermediate)
}

/**
 * @param {(string|number|Date)} content
 * @param {*} key
 * @return {Element}
 */
function createElementText (content, key) {
	var element = new Element(SharedElementText)

	element.type = SharedTypeText
	element.key = SharedKeySigil + key
	element.children = content + ''

	return element
}

/**
 * @param {*} key
 * @return {Element}
 */
function createElementEmpty (key) {
	var element = new Element(SharedElementEmpty)

	element.type = SharedTypeEmpty
	element.key = SharedKeySigil + key
	element.children = ''

	return element
}

/**
 * @param {(Element|Array)} fragment
 * @return {Element}
 */
function createElementFragment (iterable) {
	var element = new Element(SharedElementFragment)
	var children = new List()
	var i = 0

	element.type = SymbolFragment
	element.children = children

	if (isValidElement(iterable))
		setElementChildren(children, iterable, i)
	else
		for (; i < iterable.length; ++i)
			setElementChildren(children, iterable[i], i)

	setElementBoundary(children)

	return element
}

/**
 * @param {*} element
 * @param {*} key
 * @return {Element?}
 */
function createElementUnknown (element, key) {
	switch (element.constructor) {
		case Boolean:
			return createElementEmpty(key)
		case Date:
			return createElementText(element, key)
		case Promise:
		case Function:
			return createElement(element)
	}

	if (typeof element.next === 'function')
		return createElementFragment(childrenArray(element))
	if (typeof element[SymbolIterator] === 'function')
		return createElementUnknown(element[SymbolIterator](), key)
	if (typeof element === 'function')
		return createElementUnknown(element(), key)

	invariant(SharedSiteRender, 'Invalid element [object ' + getDisplayName(element) + ']')
}

/**
 * @param {Element} element
 * @return {boolean}
 */
function isValidElement (element) {
	return element != null && element.UUID === SymbolElement
}

/**
 * @param {Element} element
 * @param {Object=} props
 * @param {...} children
 * @return {Element}
 */
function cloneElement () {
	return createElement.apply(null, arguments)
}

/**
 * @param {(Element|Array)} element
 * @param {Object} container
 * @param {(string|number|Symbol)=} key
 * @return {Element}
 */
function createPortal (element, container, key) {
	var portal = new Element(SharedElementPortal)
	var children = portal.children = new List()

	setElementChildren(children, element, 0)
	setElementBoundary(children)

	portal.type = container

	if (key !== undefined)
		portal.key = key

	return portal
}

/**
 * @param {(string|function|Promise)} type
 * @param {Object?=} properties
 * @param {...} children
 * @return {Element}
 */
function createElement (type, properties) {
	var props = properties
	var i = props != null ? 1 : 2
	var size = 0
	var index = 0
	var id = typeof type !== 'function' ? SharedElementNode : SharedElementComponent
	var length = arguments.length
	var element = new Element(id)
	var children = id !== SharedElementComponent ? new List() : null

	if (i === 1)
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
							props.children = void (index = setElementChildren(children, props.children, index))
					}

					i++
					break
				}
			default:
				props = {}
		}
	else
		props = {}

	if ((size = length - i) > 0)
		if (id !== SharedElementComponent) {
			for (; i < length; ++i)
				index = setElementChildren(children, arguments[i], index)
		} else {
			if (size > 1)
				for (children = []; i < length; ++i)
					children.push(arguments[i])
			else
				children = arguments[i]

			props.children = children
		}

	switch (type.constructor) {
		case String:
			break
		case Function:
			if (type.defaultProps)
				props = getDefaultProps(element, type, type.defaultProps, props)
			break
		case Promise:
			element.id = SharedElementPromise
			setElementBoundary(children)
			break
		case Number:
		case Symbol:
			if (type === SymbolFragment) {
				element.id = SharedElementFragment
				setElementBoundary(children)
			}
			break
		default:
			if (type.UUID === SymbolElement) {
				props = assign({}, type.props, (element.id = type.id, props))
				type = type.type
			}
	}

	element.type = type
	element.props = props
	element.children = children

	return element
}

/**
 * @param {List} children
 * @param {*} element
 * @param {number} index
 */
function setElementChildren (children, element, index) {
	if (element != null) {
		if (element.UUID === SymbolElement) {
			if (element.key === null)
				element.key = SharedKeySigil + index

			children.insert(element.active === false ? element : createElementImmutable(element), children)
		} else {
			switch (element.constructor) {
				case String:
				case Number:
					children.insert(createElementText(element, index), children)
					break
				case Array:
					for (var i = 0; i < element.length; ++i)
						setElementChildren(children, element[i], index + i)

					return index + i
				default:
					return setElementChildren(children, createElementUnknown(element, index), index)
			}
		}
	} else {
		children.insert(createElementEmpty(index), children)
	}

	return index + 1
}

/**
 * @param {List} children
 */
function setElementBoundary (children) {
	children.insert(createElementEmpty(SharedKeyHead), children.next)
	children.insert(createElementEmpty(SharedKeyTail), children)
}

/**
 * @param {Element} element
 * @param {function} type
 * @param {(Object|function)} defaultProps
 * @param {Object} props
 */
function getDefaultProps (element, type, defaultProps, props) {
	if (typeof defaultProps !== 'function')
		return assign({}, defaultProps, props)

	defineProperty(type, 'defaultProps', {
		value: getDefaultProps(element, type, getLifecycleCallback(element, defaultProps), props)
	})

	return type.defaultProps
}

/**
 * @param {(function|string|number|symbol)} type
 * @return {string}
 */
function getDisplayName (type) {
	switch (typeof type) {
		case 'function':
			return getDisplayName(type.displayName || type.name)
		case 'number':
		case 'symbol':
			return getDisplayName(type.toString())
		case 'string':
			if (type)
				return type
		default:
			return (type && type.constructor.name) || 'anonymous'
	}
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {string} direction
 * @return {Element}
 */
function getElementSibling (element, parent, direction) {
	if (isValidElement(element[direction]))
		if (element[direction].id === SharedElementPortal)
			return getElementSibling(element[direction], parent, direction)
		else
			return element[direction]

	if (element.host && getElementDescription(element.host) === element)
		return getElementSibling(element.host, parent, direction)

	if (parent.id < SharedElementIntermediate)
		return getElementSibling(parent, parent.parent, direction)

	return createElementIntermediate()
}

/**
 * @param {Element} element
 * @param {Element}
 */
function getElementParent (element) {
	if (element.id < SharedElementPortal)
		return getElementParent(element.parent)

	return element
}

/**
 * @param {Element} element
 * @param {string} direction
 * @return {Element}
 */
function getElementBoundary (element, direction) {
	if (element.id < SharedElementIntermediate)
		return getElementBoundary(element.children[direction])

	return element
}

/**
 * @param {Element} element
 * @return {Element}
 */
function getElementDescription (element) {
	if (element.id === SharedElementComponent)
		return getElementDescription(element.children)

	return element
}

/**
 * @param {*} element
 * @return {Element}
 */
function getElementDefinition (element) {
	if (element == null)
		return createElementEmpty(SharedKeySigil)

	if (element.UUID === SymbolElement)
		return element

	switch (element.constructor) {
		case String:
		case Number:
			return createElementText(element, SharedKeySigil)
		case Array:
			return createElementFragment(element)
		default:
			return createElementUnknown(element, SharedKeySigil)
	}
}

/**
 * @param {*} element
 * @return {Element}
 */
function getElementModule (element) {
	if (!isValidElement(element) && typeof element === 'object' && element && hasOwnProperty.call(element, 'default'))
		return getElementModule(element.default)

	return createElementFragment(getElementDefinition(element))
}
