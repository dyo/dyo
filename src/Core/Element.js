/**
 * @constructor
 * @param {number} id
 */
function Element (id) {
	this.id = id
	this.work = SharedWorkSync
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
 * @param {Element} element
 * @return {Element}
 */
function createElementImmutable (element) {
	return assign(new Element(SharedElementNode), element, SharedElementObject)
}

/**
 * @param {*} content
 * @param {*} key
 * @return {Element}
 */
function createElementText (content, key) {
	var element = new Element(SharedElementText)

	element.type = SharedTypeText
	element.key = SharedTypeKey+key
	element.children = content+''

	return element
}

/**
 * @param {DOM?} node
 * @return {Element}
 */
function createElementNode (node) {
	var element = new Element(SharedElementEmpty)

	element.DOM = node

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

	element.type = SharedTypeFragment
	element.children = children

	if (isValidElement(iterable))
		setElementChildren(children, iterable, i)
	else if (isArray(iterable))
		for (; i < iterable.length; ++i)
			setElementChildren(children, iterable[i], i)				

	setElementBoundary(children)

	return element
}

/**
 * @param {Iterable} iterable
 * @param {Element} element
 */
function createElementIterable (iterable) {	
	var element = createElementFragment(iterable)

	each(iterable, function (value, index) {
		return setElementChildren(element.children, value, index)
	})

	return element
}

/**
 * @param {*} element
 * @param {*} key
 * @return {Element}
 */
function createElementBranch (element, key) {
	switch (element.constructor) {
		case Promise:
		case Function:
			return createElement(element)
		case Boolean:
			return createElementText('', key)
		case Date:
			return createElementText(element, key)			
	}

	if (typeof element.next === 'function')
		return createElementIterable(element)
	if (typeof element[SymbolIterator] === 'function')
		return createElementBranch(element[SymbolIterator]())
	if (typeof element === 'function')
		return createElementBranch(element())
	if (element instanceof Error)
		return createElement('details', createElement('summary', element+''), h('pre', element.report || element.stack))

	invariant(SharedSiteRender, 'Invalid element [object '+getDisplayName(element)+']')
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

	if (key != null)
		portal.key = key

	return portal
}

/**
 * @param {(string|function|Promise)} type
 * @param {Object?=} properties
 * @param {...}
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
							props.children = void setElementChildren(children, props.children, index)
					}

					i++
					break
				}
			default:
				props = {}
		}
	else
		props = {}

	if ((size = length - i) > 0) {
		if (id !== SharedElementComponent)
			for (; i < length; ++i)
				index = setElementChildren(children, arguments[i], index)
		else {
			if (size > 1)
				for (children = []; i < length; ++i)
					children.push(arguments[i])
			else
				children = arguments[i]

			props.children = children
		}
	}	

	switch (type.constructor) {
		case Function:
			if (type.defaultProps)
				props = getDefaultProps(element, type.defaultProps, props)
		case String:
			break
		case Element:
			props = assign({}, type.props, (element.id = type.id, props))	
			type = type.type
			break
		case Promise:
			id = SharedElementPromise
		default:
			if (id !== SharedElementPromise && isValidDOMNode(type))
				id = SharedElementPortal	

			setElementBoundary((element.id = id, children))
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
	if (element != null)
		switch (element.constructor) {
			case Element:
				if (element.key === null)
					element.key = SharedTypeKey + index

				children.insert(element.active === false ? element : createElementImmutable(element), children)
				break
			case Array:
				for (var i = 0; i < element.length; ++i)
					setElementChildren(children, element[i], index + i)

				return index + i
			case String:
			case Number:
				children.insert(createElementText(element, index), children)
				break
			default:
				children.insert(createElementBranch(element, index), children)
		}
	else
		children.insert(createElementText('', index), children)

	return index + 1
}

/**
 * @param {List} children
 */
function setElementBoundary (children) {
	var head = createElementText('', SharedTypeKey)
	var tail = createElementText('', SharedTypeKey)
	
	head.xmlns = tail.xmlns = SharedTypeText

	children.insert(head, children)
	children.insert(tail, children.next)
}

/**
 * @param {Element} element
 * @param {(Object|function)} defaultProps
 * @param {Object} props
 */
function getDefaultProps (element, defaultProps, props) {
	if (typeof defaultProps !== 'function')
		return assign({}, defaultProps, props)

	defineProperty(element.type, 'defaultProps', {
		value: getDefaultProps(element, getLifecycleCallback(element, defaultProps), props)
	})

	return element.type.defaultProps
}

/**
 * @param {(function|string)} subject
 * @return {string}
 */
function getDisplayName (subject) {
	switch (typeof subject) {
		case 'function':
			return getDisplayName(subject.displayName || subject.name)
		case 'string':
			if (subject)
				return subject
		default:
			return (subject && subject.constructor.name) || 'anonymous'
	}
}

/**
 * @param  {Element} element
 * @return {Element}
 */
function getElementChildren (element) {
	return element.children
}

/**
 * @param {Element}
 * @param {Element} 
 */
function getElementParent (element) {
	if (element.id < SharedElementPortal)
		return getElementParent(element.parent)
	
	if (element.id === SharedElementPortal)
		return createElementNode(createDOMPortal(element))
	else
		return element
}

/**
 * @param {Element} element
 * @return {Element}
 */
function getElementDescription (element) {
	if (isValidElement(element) && element.id === SharedElementComponent)
		return getElementDescription(getElementChildren(element))
	else
		return element
}

/**
 * @param {Element} element
 * @param {string} direction
 * @return {Element} 
 */
function getElementBoundary (element, direction) {
	if (element.id < SharedElementEmpty)
		return getElementBoundary(getElementChildren(element)[direction])
	else
		return element
}

/**
 * @param {Element} element
 * @param {string} direction
 * @return {Element}
 */
function getElementSibling (element, direction) {
	if (isValidElement(element[direction]))
		return element[direction]

	if (getElementDescription(element.host) === element)
		return getElementSibling(element.host, direction)

	return createElementNode(SharedDOMObject)
}
