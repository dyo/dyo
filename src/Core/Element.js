/**
 * @constructor
 * @param {number} id
 */
function Element (id) {
	this.id = id
	this.active = false
	this.work = SharedWorkIdle
	this.xmlns = null
	this.key = null
	this.ref = null
	this.type = null
	this.props = null
	this.cache = null
	this.children = null
	this.owner = null
	this.context = null
	this.parent = null
	this.host = null
	this.next = null
	this.prev = null
}
/**
 * @type {Object}
 */
Element[SharedSitePrototype] = {
	constructor: SymbolElement,
	handleEvent: handleEvent
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @return {Element}
 */
function createElementRebase (element, snapshot) {
	element.key = snapshot.key
	element.prev = snapshot.prev
	element.next = snapshot.next
	element.host = snapshot.host
	element.parent = snapshot.parent

	return element
}

/**
 * @param {Element} element
 * @return {Element}
 */
function createElementImmutable (snapshot) {
	var element = new Element(snapshot.id)
	var children = snapshot.children

	if (typeof children === 'object' && snapshot.id !== SharedElementComponent)
		children = createChildrenImmutable(children)

	element.type = snapshot.type
	element.props = snapshot.props
	element.xmlns = snapshot.xmlns
	element.key = snapshot.key
	element.ref = snapshot.ref
	element.children = typeof children === 'object' ? createElementChildren(children) : children

	return element
}

/**
 * @param {List} iterable
 * @return {List}
 */
function createElementChildren (iterable) {
	var children = new List()
	var length = iterable.length
	var element = iterable.next

	while (length-- > 0) {
		children.insert(createElementImmutable(element), children)
		element = element.next
	}

	return children
}

/**
 * @param {Element} snapshot
 * @return {Element}
 */
function createElementIntermediate (snapshot) {
	var element = new Element(SharedElementIntermediate)

	element.children = snapshot

	return element
}

/**
 * @param {(string|number)} content
 * @param {*} key
 * @return {Element}
 */
function createElementText (content, key) {
	var element = new Element(SharedElementText)

	element.type = SharedLocalNameText
	element.key = SharedKeyBody + key
	element.children = content + ''

	return element
}

/**
 * @param {*} key
 * @return {Element}
 */
function createElementEmpty (key) {
	var element = new Element(SharedElementEmpty)

	element.type = SharedLocalNameEmpty
	element.key = SharedKeyBody + key
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
 * @param {function} callback
 * @return {Element}
 */
function createElementPromise (callback) {
	return createElement({then: callback})
}

/**
 * @param {*} element
 * @param {*} key
 * @return {Element?}
 */
function createElementUnknown (element, key) {
	if (typeof element[SymbolIterator] === 'function')
		return createElementFragment(arrayChildren(element))

	if (typeof element[SymbolAsyncIterator] === 'function')
		return createElementPromise(createComponentGenerator(element))

	switch (typeof element) {
		case 'boolean':
			return createElementEmpty(key)
		case 'object':
			if (!thenable(element))
				break
		case 'function':
			return createElement(element)
	}

	invariant(SharedSiteRender, 'Invalid element [object ' + getDisplayName(element) + ']')
}

/**
 * @param {Element} element
 * @return {boolean}
 */
function isValidElement (element) {
	return element != null && element.constructor === SymbolElement
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
	var children = new List()

	portal.type = container
	portal.children = children
	portal.key = key === undefined ? null : key

	setElementChildren(children, element, 0)
	setElementBoundary(children)

	return portal
}

/**
 * @param {(string|function|Promise|Symbol)} type
 * @param {Object?=} config
 * @param {...} children
 * @return {Element}
 */
function createElement (type, config) {
	var i = config != null ? 1 : 2
	var size = 0
	var index = 0
	var id = typeof type !== 'function' ? SharedElementNode : SharedElementComponent
	var length = arguments.length
	var element = new Element(id)
	var props = {}
	var children = id !== SharedElementComponent ? new List() : undefined

	if (i === 1 && typeof config === 'object' && config[SymbolIterator] === undefined) {
		switch (config.constructor) {
			case SymbolElement:
				break
			default:
				if (isArray(config))
					break
			case Object:
				if (thenable(config))
					break

				setElementProps(element, (++i, props = config))

				if (props.children !== undefined && id !== SharedElementComponent)
					props.children = void (length - i < 1 ? (index = setElementChildren(children, props.children, index)) : 0)
		}
	}

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

	switch (typeof type) {
		case 'function':
			if (type.defaultProps)
				props = assign({}, getDefaultProps(element, type), props)
			break
		case 'number':
		case 'symbol':
			if (type === SymbolFragment)
				setElementBoundary((element.id = SharedElementFragment, children))
			break
		case 'object':
			if (isValidElement(type))
				type = (setElementProps(element, props = assign({}, type.props, props)), element.id = type.id, type.type)
			else if (thenable(type))
				setElementBoundary((element.id = SharedElementPromise, children))
	}

	element.type = type
	element.props = props
	element.children = children

	return element
}

/**
 * @param {Element} element
 * @param {*} props
 */
function setElementProps (element, props) {
	if (props.key !== undefined)
		element.key = props.key

	if (props.ref !== undefined)
		element.ref = props.ref

	if (props.xmlns !== undefined)
		element.xmlns = props.xmlns
}

/**
 * @param {List} children
 * @param {*} element
 * @param {number} index
 * @param {number}
 */
function setElementChildren (children, element, index) {
	if (element != null) {
		if (element.constructor === SymbolElement) {
			if (element.key === null)
				element.key = SharedKeyBody + index

			children.insert(element.next === null ? element : createElementImmutable(element), children)
		} else {
			switch (typeof element) {
				case 'string':
				case 'number':
					children.insert(createElementText(element, index), children)
					break
				case 'object':
					if (isArray(element)) {
						for (var i = 0; i < element.length; ++i)
							setElementChildren(children, element[i], index + i)

						return index + i
					}
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
 * @param {Element} snapshot
 * @param {List} children
 */
function setElementSibling (element, snapshot, children) {
	children.insert(snapshot, element)
	children.remove(element)
}

/**
 * @param {Element} element
 * @param {function} type
 * @return {Object}
 */
function getDefaultProps (element, type) {
	return typeof type.defaultProps === 'function' ? getLifecycleCallback(element, type.defaultProps) : type.defaultProps
}

/**
 * @param {(function|string|number|symbol)} type
 * @return {string}
 */
function getDisplayName (type) {
	switch (typeof type) {
		case 'number':
		case 'symbol':
			return getDisplayName(type.toString())
		case 'function':
			return getDisplayName(type.displayName || type.name)
		case 'object':
			if (type)
				if (isValidElement(type))
					return getDisplayName(type.type)
				else if (thenable(type))
					return '#promise'
		case 'string':
			if (type)
				return type
		default:
			return '#anonymous'
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

	if (element.host && element.host.children === element)
		return getElementSibling(element.host, parent, direction)

	if (parent.id < SharedElementIntermediate)
		return getElementSibling(parent, parent.parent, direction)

	return createElementIntermediate(element)
}

/**
 * @param {Element} element
 * @param {Element}
 */
function getElementParent (element) {
	return element.id < SharedElementPortal ? getElementParent(element.parent) : element
}

/**
 * @param {Element} element
 * @param {string} direction
 * @return {Element}
 */
function getElementBoundary (element, direction) {
	return element.id < SharedElementIntermediate ? getElementBoundary(element.children[direction]) : element
}

/**
 * @param {Element} element
 * @return {Element}
 */
function getElementDescription (element) {
	return element.id === SharedElementComponent ? getElementDescription(element.children) : element
}

/**
 * @param {*} element
 * @return {Element}
 */
function getElementDefinition (element) {
	if (element == null)
		return createElementEmpty(SharedKeyBody)

	if (element.constructor === SymbolElement)
		return element

	switch (typeof element) {
		case 'string':
		case 'number':
			return createElementText(element, SharedKeyBody)
		case 'object':
			if (isArray(element))
				return createElementFragment(element)
		default:
			return createElementUnknown(element, SharedKeyBody)
	}
}

/**
 * @param {*} element
 * @return {Element}
 */
function getElementModule (element) {
	if (!isValidElement(element) && hasOwnProperty.call(Object(element), 'default'))
		return getElementModule(element.default)

	return createElementFragment(getElementDefinition(element))
}
