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
 * @type {object}
 */
objectDefineProperties(objectDefineProperty(Element[SharedSitePrototype], SymbolIterator, {value: noop}), {
 	constructor: {value: SymbolElement},
 	handleEvent: {value: handleEvent}
})

/**
 * @param {Element} element
 * @return {Element}
 */
function createElementImmutable (snapshot) {
	var element = new Element(snapshot.id)
	var children = snapshot.children

	if (typeof children === 'object' && snapshot.id !== SharedElementComponent)
		children = createElementImmutableChildren(children)

	element.type = snapshot.type
	element.props = snapshot.props
	element.xmlns = snapshot.xmlns
	element.key = snapshot.key
	element.ref = snapshot.ref
	element.children = children

	return element
}

/**
 * @param {List} iterable
 * @return {List}
 */
function createElementImmutableChildren (iterable) {
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
function createElementSnapshot (snapshot) {
	var element = new Element(SharedElementSnapshot)

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
 * @param {function} callback
 * @return {Element}
 */
function createElementPromise (callback) {
	return createElement({then: callback, catch: noop})
}

/**
 * @param {Element} element
 * @param {object} generator
 * @return {Element}
 */
function createElementGenerator (element, generator) {
	return (element.type.then = enqueueComponentGenerator(element, generator)) && element
}

/**
 * @param {(Element|Array)} iterable
 * @return {Element}
 */
function createElementFragment (iterable) {
	var element = new Element(SharedElementFragment)

	element.type = SymbolFragment

	createElementBoundary(element.children = createElementChildren(iterable))

	return element
}

/**
 * @param {function} type
 * @param {object} props
 * @param {*} children
 * @return {Element}
 */
function createElementComponent (type, props, children) {
	var element = new Element(SharedElementCustom)

	element.type = type
	element.props = props
	element.children = createElementChildren(createElementFragment(children))

	return element
}

/**
 * @param {object} iterable
 * @return {List}
 */
function createElementChildren (iterable) {
	var children = new List()

	if (isArray(iterable))
		for (var i = 0; i < iterable.length; ++i)
			getElementChildren(children, iterable[i], i)
	else
		getElementChildren(children, iterable, 0)

	return children
}

/**
 * @param {*} element
 * @param {*} key
 * @return {Element?}
 */
function createElementUnknown (element, key) {
	switch (typeof element) {
		case 'boolean':
			return createElementEmpty(key)
		case 'object':
			if (typeof element[SymbolIterator] === 'function')
				return createElementFragment(arrayChildren(element))

			if (typeof element[SymbolAsyncIterator] === 'function')
				return createElementGenerator(createElementPromise(noop), element)

			if (!thenable(element))
				break
		case 'function':
			return createElement(element)
	}

	invariant(SharedSiteRender, 'Invalid element [object ' + getDisplayName(element) + ']')
}

/**
 * @param {List} children
 */
function createElementBoundary (children) {
	children.insert(createElementEmpty(SharedKeyHead), children.next)
	children.insert(createElementEmpty(SharedKeyTail), children)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {List} children
 */
function replaceElementChildren (element, snapshot, children) {
	children.insert(snapshot, element)
	children.remove(element)
}

/**
 * @param {List} children
 * @param {*} element
 * @param {number} index
 * @param {number}
 */
function getElementChildren (children, element, index) {
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
							getElementChildren(children, element[i], index + i)

						return index + i
					}
				default:
					return getElementChildren(children, createElementUnknown(element, index), index)
			}
		}
	} else {
		children.insert(createElementEmpty(index), children)
	}

	return index + 1
}

/**
 * @param {Element} element
 * @param {*} props
 */
function getElementProps (element, props) {
	if (props.key !== undefined)
		element.key = props.key

	if (props.ref !== undefined)
		element.ref = props.ref

	if (props.xmlns !== undefined)
		element.xmlns = props.xmlns
}

/**
 * @param {Element} element
 * @param {function} type
 * @param {object} props
 * @return {object}
 */
function getDefaultProps (element, type, props) {
	return typeof type[SharedDefaultProps] === 'function' ? type[SharedDefaultProps](props) : type[SharedDefaultProps]
}

/**
 * @param {*} value
 * @return {string}
 */
function getDisplayName (value) {
	switch (typeof value) {
		case 'number':
		case 'symbol':
			return getDisplayName(value.toString())
		case 'function':
			return getDisplayName(value[SharedSiteDisplayName] || value.name)
		case 'object':
			if (isValidElement(value))
				return getDisplayName(value.type)

			if (thenable(value))
				return '#promise'
		case 'string':
			if (value)
				return value
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

	if (parent.id < SharedElementSnapshot)
		return getElementSibling(parent, parent.parent, direction)

	return createElementSnapshot(element)
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
	return element.id < SharedElementSnapshot ? getElementBoundary(element.children[direction]) : element
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
	if (!isValidElement(element) && objectHasOwnProperty.call(Object(element), 'default'))
		return getElementModule(element.default)

	return createElementFragment(getElementDefinition(element))
}

/**
 * @param {(Element|Array)} element
 * @param {object} container
 * @param {(string|number|symbol)?} key
 * @return {Element}
 */
function createPortal (element, container, key) {
	var portal = new Element(SharedElementPortal)
	var children = new List()

	portal.type = container
	portal.children = children
	portal.key = key === undefined ? null : key

	getElementChildren(children, element, 0)
	createElementBoundary(children)

	return portal
}

/**
 * @param {(string|number)} content
 * @param {(string|number|Symbol)?} key
 * @return {Element}
 */
function createComment (content, key) {
	var comment = new Element(SharedElementComment)

	comment.type = SharedLocalNameComment
	comment.children = content + ''
	comment.key = key === undefined ? null : key

	return comment
}

/**
 * @param {(string|function|Promise|symbol)} type
 * @param {object?} config
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
	var children = element.children = id !== SharedElementComponent ? new List() : undefined

	if (i === 1 && typeof config === 'object' && config[SymbolIterator] === undefined) {
		switch (config.constructor) {
			default:
				if (isArray(config))
					break
			case Object:
				if (thenable(config))
					break

				getElementProps(element, (++i, props = config))

				if (props.children !== undefined && id !== SharedElementComponent)
					length - i < 1 ? index = getElementChildren(children, props.children, index) : 0
		}
	}

	if ((size = length - i) > 0)
		if (id !== SharedElementComponent) {
			for (; i < length; ++i)
				index = getElementChildren(children, arguments[i], index)
		} else {
			if (size === 1)
				children = arguments[i]
			else for (children = []; i < length; ++i)
				children.push(arguments[i])

			props.children = children
		}

	switch (typeof type) {
		case 'function':
			if (type[SharedDefaultProps])
				props = assign({}, getDefaultProps(element, type, props), props)
			break
		case 'number':
		case 'symbol':
			if (type === SymbolFragment)
				createElementBoundary((element.id = SharedElementFragment, children))
			break
		case 'object':
			if (isValidElement(type))
				type = (getElementProps(element, props = assign({}, type.props, props)), element.id = type.id, type.type)
			else if (thenable(type))
				createElementBoundary((element.id = SharedElementPromise, children))
	}

	element.type = type
	element.props = props

	return element
}

/**
 * @param {Element} element
 * @param {object?} props
 * @param {...} children
 * @return {Element}
 */
function cloneElement () {
	return createElement.apply(null, arguments)
}

/**
 * @param {Element} element
 * @return {boolean}
 */
function isValidElement (element) {
	return element != null && element.constructor === SymbolElement
}
