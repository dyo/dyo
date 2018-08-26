/**
 * @name Element
 * @constructor
 * @param {number} id
 * @property {number} id
 * @property {boolean} active
 * @property {number} work
 * @property {string?} xmlns
 * @property {(string|symbol)?} key
 * @property {(string|function)?} ref
 * @property {(function|string|object|symbol)?} type
 * @property {object} props
 * @property {object?} cache
 * @property {any} children
 * @property {(Component|object)?} owner
 * @property {object?} context
 * @property {Element?} parent
 * @property {Element?} host
 * @property {Element} next
 * @property {Element} prev
 */
function Element (id) {
	this.id = id
	this.active = false
	this.work = SharedWorkIdle
	this.type = null
	this.props = null
	this.children = null
	this.xmlns = undefined
	this.key = undefined
	this.ref = undefined
	this.cache = null
	this.owner = null
	this.context = null
	this.parent = null
	this.host = null
	this.next = null
	this.prev = null
}
ObjectDefineProperties(ObjectDefineProperty(Element[SharedSitePrototype], SymbolForIterator, {value: SymbolForIterator}), {
	/**
	 * @alias Element#constructor
	 * @memberof Element
	 * @type {symbol}
	 */
	constructor: {
		value: SymbolForElement
	},
	/**
	 * @alias Element#handleEvent
	 * @memberof Element
	 * @type {function}
	 */
	handleEvent: {
		value: handleEvent
	}
})

/**
 * @param {Element} snapshot
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
	for (var children = new List(), element = iterable, length = element.length; length > 0; --length)
		children.insert(createElementImmutable(element = element.next), children)

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
 * @param {any} key
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
 * @param {any} key
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

	element.type = SymbolForFragment
	element.children = createElementChildren(iterable)

	return element
}

/**
 * @param {function} type
 * @param {object} props
 * @return {Element}
 */
function createElementComponent (type, props) {
	var element = new Element(SharedElementCustom)

	element.type = type
	element.props = props
	element.children = createElementChildren(props.children)
	element.ref = props.ref
	element.xmlns = props.xmlns

	return element
}

/**
 * @param {any} type
 * @param {function} xmlns
 * @return {Element}
 */
function createElementForward (type, xmlns) {
	var element = createElement(type)

	element.xmlns = xmlns

	return element
}

/**
 * @param {object} iterable
 * @return {List}
 */
function createElementChildren (iterable) {
	var children = new List()

	getElementChildren(children, iterable, 0)
	createElementBoundary(children)

	return children
}

/**
 * @throws {Error} if a known element type is not found
 * @param {any} element
 * @param {any} key
 * @return {Element?}
 */
function createElementUnknown (element, key) {
	switch (typeof element) {
		case 'boolean':
			return createElementEmpty(key)
		case 'object':
			if (element[SymbolForIterator])
				return createElementFragment(arrayChildren(element))

			if (element[SymbolForAsyncIterator])
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
 * @param {List} children
 * @param {any} element
 * @param {number} index
 * @param {number}
 */
function getElementChildren (children, element, index) {
	if (element != null) {
		if (element.constructor === SymbolForElement) {
			if (element.key === undefined)
				element.key = SharedKeyBody + index

			children.insert(element.next === null ? element : createElementImmutable(element), children)
		} else {
			switch (typeof element) {
				case 'number':
				case 'string':
					children.insert(createElementText(element, index), children)
					break
				case 'object':
					if (ArrayIsArray(element)) {
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
 * @param {Element} snapshot
 * @param {object} props
 * @return {any}
 */
function getElementType (element, snapshot, props) {
	return element.xmlns = snapshot.xmlns, defaults(props, snapshot.props), snapshot.type
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
 * @param {any} value
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
		case 'string':
			if (value)
				return value.value || value
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
 * @return {Element}
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
 * @param {any} element
 * @return {Element}
 */
function getElementDefinition (element) {
	if (element == null)
		return createElementEmpty(SharedKeyBody)

	if (element.constructor === SymbolForElement)
		return element

	switch (typeof element) {
		case 'number':
		case 'string':
			return createElementText(element, SharedKeyBody)
		case 'object':
			if (ArrayIsArray(element))
				return createElementFragment(element)
		default:
			return createElementUnknown(element, SharedKeyBody)
	}
}

/**
 * @param {any} element
 * @return {Element}
 */
function getElementModule (element) {
	if (!isValidElement(element) && ObjectHasOwnProperty.call(Object(element), 'default'))
		return getElementModule(element.default)

	return createElementFragment(getElementDefinition(element))
}

/**
 * @param {any} type
 * @return {number}
 */
function getElementIdentity (type) {
	switch (typeof type) {
		case 'string':
			return SharedElementNode
		case 'function':
			return SharedElementComponent
		case 'number':
		case 'symbol':
			return type === SymbolForFragment ? SharedElementFragment : SharedElementNode
		default:
			return thenable(type) ? SharedElementPromise : isValidElement(type) ? -type.id : SharedElementNode
	}
}

/**
 * @param {object} props
 * @return {boolean}
 */
function isValidProps (props) {
	if (typeof props === 'object' && props[SymbolForIterator] === undefined)
		switch (props.constructor) {
			default:
				if (ArrayIsArray(props))
					break
			case Object:
				return !thenable(props)
		}

	return false
}

/**
 * @param {Element} element
 * @return {boolean}
 * @public
 */
function isValidElement (element) {
	return element != null && element.constructor === SymbolForElement
}

/**
 * @param {Element} element
 * @param {object?} props
 * @param {...any?} children
 * @return {Element}
 * @public
 */
function cloneElement () {
	return createElement.apply(null, arguments)
}

/**
 * @param {(Element|Array)} children
 * @param {object} container
 * @param {(string|number|symbol)?} key
 * @return {Element}
 * @public
 */
function createPortal (children, container, key) {
	var element = new Element(SharedElementPortal)

	element.type = container
	element.key = key === undefined ? null : key
	element.children = createElementChildren(children)

	return element
}

/**
 * @param {(string|number)} content
 * @param {(string|number|symbol)?} key
 * @return {Element}
 * @public
 */
function createComment (content, key) {
	var element = new Element(SharedElementComment)

	element.type = SharedLocalNameComment
	element.key = key === undefined ? null : key
	element.children = content + ''

	return element
}

/**
 * @param {any} type
 * @param {(object|any)?} value
 * @param {...any?} children
 * @return {Element}
 * @throws {Error} if prop type validation fails
 * @public
 */
function createElement (type, value) {
	var properties = value != null ? value : {}
	var identity = getElementIdentity(type)
	var i = isValidProps(properties) ? 2 : 1
	var length = arguments.length
	var size = length - i
	var index = 0
	var id = identity > 0 ? identity : -identity
	var props = i === 2 ? properties : {}
	var children = id !== SharedElementComponent ? new List() : undefined
	var element = new Element(id)

	if (size > 0)
		if (id !== SharedElementComponent)
			for (; i < length; ++i)
				index = getElementChildren(children, arguments[i], index)
		else if (size === 1)
			props.children = arguments[i]
		else for (children = props.children = []; i < length; ++i)
			children.push(arguments[i])
	else if (id !== SharedElementComponent && props.children !== undefined)
		getElementChildren(children, props.children, index)

	element.type = identity > 0 ? type : type = getElementType(element, type, props)
	element.props = props

	switch (id) {
		case SharedElementComponent:
			var componentType = type === ForwardRef ? arguments[0] : type

			if (componentType[SharedDefaultProps])
				defaults(props, getDefaultProps(element, componentType, props))

			/* istanbul ignore next */
			if (process.env.NODE_ENV === 'development')
				checkPropTypes(componentType, props)

			break
		case SharedElementPromise:
		case SharedElementFragment:
			createElementBoundary(children)
		default:
			element.children = children
			element.xmlns = props.xmlns
	}

	element.key = props.key
	element.ref = props.ref

	return element
}
