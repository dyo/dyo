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
 * @param {any} children
 * @return {Element}
 */
function createElementComponent (type, props, children) {
	var element = new Element(SharedElementCustom)

	element.type = type
	element.props = props
	element.children = createElementChildren(children)

	return element
}

/**
 * @param {any} type
 * @param {object} props
 * @param {Array<any>} config
 * @return {List}
 */
function createElementClone (type, props, config) {
	var element = createElement.apply(null, [type].concat(config))

	getElementProps(element, element.props = assign({}, props, element.props))

	return element
}

/**
 * @param {object} iterable
 * @return {List}
 */
function createElementChildren (iterable) {
	var children = new List()

	if (ArrayisArray(iterable))
		for (var i = 0; i < iterable.length; ++i)
			getElementChildren(children, iterable[i], i)
	else
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
 * @param {any} element
 * @param {number} index
 * @param {number}
 */
function getElementChildren (children, element, index) {
	if (element != null) {
		if (element.constructor === SymbolForElement) {
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
					if (ArrayisArray(element)) {
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
 * @param {any} props
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
 * @param {any} element
 * @return {Element}
 */
function getElementDefinition (element) {
	if (element == null)
		return createElementEmpty(SharedKeyBody)

	if (element.constructor === SymbolForElement)
		return element

	switch (typeof element) {
		case 'string':
		case 'number':
			return createElementText(element, SharedKeyBody)
		case 'object':
			if (ArrayisArray(element))
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
 * @param {any?} config
 * @param {...any}
 * @return {Element}
 * @public
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

	if (i === 1 && typeof config === 'object' && config[SymbolForIterator] === undefined) {
		switch (config.constructor) {
			default:
				if (ArrayisArray(config))
					break
			case Object:
				if (thenable(config))
					break

				getElementProps(element, (++i, props = config))

				if (props.children !== undefined && id !== SharedElementComponent)
					if (length - i < 1)
						index = getElementChildren(children, props.children, index)
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
			if (type === SymbolForFragment)
				createElementBoundary((element.id = SharedElementFragment, children))
			break
		default:
			if (thenable(type))
				createElementBoundary((element.id = SharedElementPromise, children))
	}

	element.type = type
	element.props = props

	return element
}

/**
 * @param {Element} element
 * @param {...any}
 * @return {Element?}
 * @public
 */
function cloneElement (element) {
	if (isValidElement(element))
		return createElementClone(element.type, element.props, [].slice.call(arguments, 1))
}

/**
 * @param {Element} element
 * @return {boolean}
 * @public
 */
function isValidElement (element) {
	return element != null && element.constructor === SymbolForElement
}
