/*! DIO 8.2.4 @license MIT */

;var dio = (function (global) {/* eslint-disable */'use strict'
function factory (window, config, require) {

	var exports = {version: '8.2.4'}
	
	var SharedElementUnsigned = 0
	var SharedElementPromise = 1
	var SharedElementFragment = 2
	var SharedElementPortal = 3
	var SharedElementIntermediate = 4
	var SharedElementComponent = 5
	var SharedElementCustom = 6
	var SharedElementNode = 7
	var SharedElementText = 8
	var SharedElementEmpty = 9
	
	var SharedRefsDispatch = 1
	var SharedRefsReplace = 2
	var SharedRefsRemove = 3
	var SharedRefsAssign = 4
	
	var SharedComponentForceUpdate = 1
	var SharedComponentPropsUpdate = 2
	var SharedComponentStateUpdate = 3
	
	var SharedMountQuery = 1
	var SharedMountCommit = 2
	var SharedMountRemove = 3
	var SharedMountAppend = 4
	var SharedMountInsert = 5
	
	var SharedWorkMounting = 1
	var SharedWorkIdle = 2
	var SharedWorkIntermediate = 3
	var SharedWorkProcessing = 4
	var SharedWorkPending = 5
	
	var SharedErrorCatch = 1
	var SharedErrorThrow = 2
	
	var SharedPropsMount = 1
	var SharedPropsUpdate = 2
	
	var SharedLinkedPrevious = 'prev'
	var SharedLinkedNext = 'next'
	
	var SharedSitePromise = 'async'
	var SharedSitePrototype = 'prototype'
	var SharedSiteCallback = 'callback'
	var SharedSiteRender = 'render'
	var SharedSiteElement = 'element'
	var SharedSiteConstructor = 'constructor'
	var SharedSiteForceUpdate = 'forceUpdate'
	var SharedSiteSetState = 'setState'
	var SharedSiteFindDOMNode = 'findDOMNode'
	var SharedSiteDisplayName = 'displayName'
	
	var SharedKeyHead = '&|head'
	var SharedKeyBody = '&|'
	var SharedKeyTail = '&|tail'
	
	var SharedLocalNameEmpty = '#empty'
	var SharedLocalNameText = '#text'
	
	var SharedComponentWillMount = 'componentWillMount'
	var SharedComponentDidMount = 'componentDidMount'
	var SharedComponentWillReceiveProps = 'componentWillReceiveProps'
	var SharedComponentShouldUpdate = 'shouldComponentUpdate'
	var SharedComponentWillUpdate = 'componentWillUpdate'
	var SharedComponentDidUpdate = 'componentDidUpdate'
	var SharedComponentWillUnmount = 'componentWillUnmount'
	var SharedComponentDidCatch = 'componentDidCatch'
	var SharedGetChildContext = 'getChildContext'
	var SharedGetInitialState = 'getInitialState'
	
	/**
	 * @constructor
	 */
	function List () {
		this.next = this
		this.prev = this
		this.length = 0
	}
	/**
	 * @type {Object}
	 */
	List[SharedSitePrototype] = {
		/**
		 * @param {Object} node
		 * @param {Object} before
		 * @return {Object}
		 */
		insert: function insert (node, before) {
			node.next = before
			node.prev = before.prev
	
			before.prev.next = node
			before.prev = node
	
			this.length++
	
			return node
		},
		/**
		 * @param {Object} node
		 * @return {Object}
		 */
		remove: function remove (node) {
			if (this.length === 0)
				return node
	
			node.next.prev = node.prev
			node.prev.next = node.next
	
			this.length--
	
			return node
		},
		/**
		 * @param {function} callback
		 */
		forEach: function forEach (callback) {
			for (var node = this, length = node.length; length > 0; --length)
				callback(node = node.next)
		}
	}
	
	/**
	 * @constructor
	 */
	function WeakHash () {
		this.hash = ''
	}
	/**
	 * @type {Object}
	 */
	WeakHash[SharedSitePrototype] = {
		/**
		 * @param {*} key
		 * @param {*} value
		 */
		set: function set (key, value) {
			key[this.hash] = value
		},
		/**
		 * @param {*} key
		 * @return {*}
		 */
		get: function get (key) {
			return key[this.hash]
		},
		/**
		 * @param {*} key
		 * @return {boolean}
		 */
		has: function has (key) {
			return this.hash in key
		}
	}
	
	/**
	 * @return {void}
	 */
	function noop () {}
	
	/**
	 * @param {Object} object
	 * @param {Object} primary
	 */
	function merge (object, primary) {
		for (var key in primary)
			object[key] = primary[key]
	
		return object
	}
	
	/**
	 * @param {Object} object
	 * @param {Object} primary
	 * @param {Object} secondary
	 * @return {Object}
	 */
	function assign (object, primary, secondary) {
		for (var key in primary)
			object[key] = primary[key]
	
		for (var key in secondary)
			object[key] = secondary[key]
	
		return object
	}
	
	/**
	 * @param {Array} array
	 * @param {Array} output
	 * @return {Array}
	 */
	function flatten (array, output) {
		for (var i = 0; i < array.length; ++i)
			isArray(array[i]) ? flatten(array[i], output) : output.push(array[i])
	
		return output
	}
	
	/**
	 * @param {Array} haystack
	 * @param {function} callback
	 * @param {*} thisArg
	 */
	function find (haystack, callback, thisArg) {
		if (typeof haystack.find === 'function')
			return haystack.find(callback, thisArg)
	
	  for (var i = 0; i < haystack.length; ++i)
	  	if (callback.call(thisArg, haystack[i], i, haystack))
	  		return haystack[i]
	}
	
	/**
	 * @param {Iterable} iterable
	 * @param {function} callback
	 */
	function each (iterable, callback) {
		if (typeof iterable.forEach === 'function')
			return iterable.forEach(callback)
	
		var index = 0
		var value = iterable.next(value, index++)
	
		while (!value.done)
			value = iterable.next(value.value, index = callback(value.value, index))
	}
	
	/**
	 * @param {string} from
	 * @param {string} message
	 */
	function invariant (from, message) {
		throw new Error('#'+from+'(...): '+message+'.')
	}
	
	/**
	 * @param {Object} a
	 * @param {Object} b
	 * @return {boolean}
	 */
	function compare (a, b) {
		for (var key in a)
			if (!hasOwnProperty.call(b, key))
				return true
	
		for (var key in b)
			if (!is(a[key], b[key]))
				return true
	
		return false
	}
	
	/**
	 * @param {*} a
	 * @param {*} b
	 * @return {boolean}
	 */
	function is (a, b) {
		if (a === b)
			return a !== 0 || 1/a === 1/b
	
		return a !== a && b !== b
	}
	
	/**
	 * @param {string} str
	 * @return {number}
	 */
	function hash (str) {
		for (var i = 0, code = 0; i < str.length; ++i)
			code = ((code << 5) - code) + str.charCodeAt(i)
	
		return code >>> 0
	}
	
	/**
	 * @param {function} callback
	 * @return {number}
	 */
	function timeout (callback) {
		return setTimeout(callback, 16)
	}
	
	/**
	 * @return {boolean}
	 */
	function fetchable (object) {
		return (
			typeof object.blob === 'function' &&
			typeof object.text === 'function' &&
			typeof object.json === 'function'
		)
	}
	
	/**
	 * @param {object} object
	 * @return {boolean}
	 */
	function thenable (object) {
		return typeof object.then === 'function'
	}
	
	/**
	 * @param {string} namespace
	 * @return {string}
	 */
	function random (namespace) {
		return namespace + (((seed = seed * 16807 % uuid - 1) - 1) / uuid).toString(36).substring(2)
	}
	
	var WeakMap = window.WeakMap || WeakHash
	var Symbol = window.Symbol || Math.random
	var isArray = Array.isArray
	var hasOwnProperty = Object.hasOwnProperty
	var defineProperty = Object.defineProperty
	var create = Object.create
	var requestAnimationFrame = window.requestAnimationFrame || timeout
	
	var SymbolFor = Symbol.for || hash
	var SymbolIterator = Symbol.iterator || '@@iterator'
	var SymbolAsyncIterator = Symbol.asyncIterator || '@@asyncIterator'
	var SymbolElement = SymbolFor('dio.Element')
	var SymbolFragment = SymbolFor('dio.Fragment')
	var SymbolComponent = SymbolFor('dio.Component')
	var SymbolContext = SymbolFor('dio.Context')
	var SymbolException = SymbolFor('dio.Exception')
	
	var uuid = 2147483647
	var seed = 4022871197 % uuid
	var root = new WeakMap()
	
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
	 * @param {function} callback
	 * @return {Element}
	 */
	function createElementPromise (callback) {
		return createElement({then: callback})
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
	
		setElementBoundary(element.children = getElementChildren(new List(), iterable))
	
		return element
	}
	
	/**
	 * @param {Element} element
	 * @return {Element}
	 */
	function createElementComponent (host) {
		var element = new Element(SharedElementCustom)
	
		element.type = element.owner = host.type
		element.props = host.props
		element.context = host.context
		element.children = getElementChildren(new List(), host.children)
	
		return element
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
			return createElementGenerator(createElementPromise(noop), element)
	
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
	 * @param {List} children
	 * @param {(Element|Array)}
	 */
	function getElementChildren (children, iterable) {
		if (isValidElement(iterable))
			setElementChildren(children, iterable, 0)
		else if (isArray(iterable))
			for (var i = 0; i < iterable.length; ++i)
				setElementChildren(children, iterable[i], i)
	
		return children
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
				if (value)
					if (isValidElement(value))
						return getDisplayName(value.type)
					else if (value[SharedSiteDisplayName])
						return getDisplayName(value[SharedSiteDisplayName])
					else if (thenable(value))
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
	
	/**
	 * @constructor
	 * @param {Object?} props
	 * @param {Object?} context
	 */
	function Component (props, context) {
		this.refs = {}
		this.state = {}
		this.props = props
		this.context = context
	}
	/**
	 * @type {Object}
	 */
	Component[SharedSitePrototype] = createComponentPrototype(Component[SharedSitePrototype])
	
	/**
	 * @constructor
	 * @param {Object?} props
	 * @param {Object?} context
	 */
	function PureComponent (props, context) {
		Component.call(this, props, context)
	}
	/**
	 * @type {Object}
	 */
	PureComponent[SharedSitePrototype] = create(Component[SharedSitePrototype], {
		shouldComponentUpdate: {value: shouldComponentUpdate}
	})
	
	/**
	 * @constructor
	 * @param {Object?} props
	 * @param {Object?} context
	 */
	function CustomComponent (props, context) {
		Component.call(this, props, context)
	}
	
	CustomComponent[SharedSitePrototype] = create(Component[SharedSitePrototype], {
		render: {value: function () {
			return createElementComponent(getComponentElement(this))
		}}
	})
	
	/**
	 * @param {Object} props
	 * @param {Object} state
	 * @return {boolean}
	 */
	function shouldComponentUpdate (props, state) {
		return compare(this.props, props) || compare(this.state, state)
	}
	
	/**
	 * @param {(Object|function)} state
	 * @param {function?} callback
	 */
	function setState (state, callback) {
		enqueueStateUpdate(getComponentElement(this), this, state, callback)
	}
	
	/**
	 * @param {function} callback
	 */
	function forceUpdate (callback) {
		enqueueComponentUpdate(getComponentElement(this), this, callback, SharedComponentForceUpdate)
	}
	
	/**
	 * @param {object} description
	 * @return {function}
	 */
	function createClass (description) {
		return createComponentClass(Object(description), getDisplayName(description))
	}
	
	/**
	 * @param {object} description
	 * @param {string} displayName
	 * @return {function}
	 */
	function createComponentClass (description, displayName) {
		switch (typeof description) {
			case 'function':
				return description[SymbolComponent] = createComponentClass(merge({render: description}, description))
			case 'object':
				for (var name in description)
					description[name] = {value: description[name]}
		}
	
		function klass () {}
	
		klass[SharedSitePrototype] = create(Component[SharedSitePrototype], description)
		klass[SharedSiteDisplayName] = displayName
	
		return klass
	}
	
	/**
	 * @param {Object} prototype
	 * @return {Object}
	 */
	function createComponentPrototype (prototype) {
		defineProperty(prototype, SymbolComponent, {value: SymbolComponent})
		defineProperty(prototype, SharedSiteSetState, {value: setState})
		defineProperty(prototype, SharedSiteForceUpdate, {value: forceUpdate})
	
		if (!prototype[SharedSiteRender])
			defineProperty(prototype, SharedSiteRender, {value: noop, configurable: true})
	
		return prototype
	}
	
	/**
	 * @param {Element} element
	 */
	function mountComponentElement (element) {
		var type = element.type
		var props = element.props
		var host = Object(element.host)
		var context = element.context = Object(host.context)
		var prototype = type[SharedSitePrototype]
		var children
		var state
		var owner
	
		if (prototype && prototype.render)
			!prototype[SymbolComponent] && createComponentPrototype(prototype)
		else if (!type[SymbolComponent])
			type = isValidNodeComponent(type) ? CustomComponent : createComponentClass(type, getDisplayName(type))
		else
			type = type[SymbolComponent]
	
		element.owner = owner = getLifecycleClass(element, type, props, context)
		owner[SymbolContext] = element.xmlns = host.xmlns
		owner[SymbolElement] = element
		owner.props = props
		owner.context = context
	
		owner.state = state = Object(owner.state)
		owner.refs = Object(owner.refs)
	
		if (owner[SharedGetInitialState])
			owner.state = getLifecyclePayload(element, SharedGetInitialState, props, state, context) || state
	
		if (owner[SharedComponentWillMount])
			getLifecycleMount(element, SharedComponentWillMount, owner)
	
		if (!thenable(state = owner.state))
			children = getComponentSnapshot(element, owner)
		else
			children = createElementPromise(enqueueComponentState(element, owner, state))
	
		if (owner[SharedGetChildContext])
			element.context = getLifecyclePayload(element, SharedGetChildContext, props, state, context) || context
	
		return element.children = children
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {number} signature
	 */
	function updateComponentElement (element, snapshot, signature) {
		if (element.work === SharedWorkIntermediate)
			return
	
		var owner = element.owner
		var prevProps = element.props
		var nextProps = snapshot.props
		var nextContext = owner.context
		var prevState = owner.state
		var nextState = signature === SharedComponentStateUpdate ? assign({}, prevState, element.cache) : prevState
	
		switch (signature) {
			case SharedComponentPropsUpdate:
				if (owner[SharedComponentWillReceiveProps])
					getLifecycleReceive(element, SharedComponentWillReceiveProps, nextProps, nextState, nextContext)
			case SharedComponentStateUpdate:
				if (owner[SharedComponentShouldUpdate])
					if (!getLifecycleShould(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext))
						return
		}
	
		if (owner[SharedComponentWillUpdate])
			getLifecycleUpdate(element, SharedComponentWillUpdate, nextProps, nextState, nextContext)
	
		if (owner[SharedGetChildContext])
			merge(element.context, getLifecyclePayload(element, SharedGetChildContext, nextProps, nextState, nextContext))
	
		if (signature === SharedComponentPropsUpdate)
			owner.props = element.props = nextProps
	
		if (signature === SharedComponentStateUpdate)
			owner.state = nextState
	
		reconcileElement(element.children, getComponentSnapshot(element, owner))
	
		if (owner[SharedComponentDidUpdate])
			getLifecycleUpdate(element, SharedComponentDidUpdate, prevProps, prevState, nextContext)
	
		if (element.ref !== snapshot.ref)
			commitRefs(element, snapshot.ref, SharedRefsReplace)
	}
	
	/**
	 * @param {Element} element
	 */
	function unmountComponentElement (element) {
		if (element.owner[SharedComponentWillUnmount])
			if (element.cache = getLifecycleUnmount(element, SharedComponentWillUnmount, element.owner))
				if (thenable(element.cache))
					return
	
		element.cache = null
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} owner
	 * @param {object} state
	 * @return {function}
	 */
	function enqueueComponentState (element, owner, state) {
		return function then (resolve, reject) {
			enqueueStatePromise(element, owner, state).then(function () {
				resolve(element.children.type.then === then && getComponentSnapshot(element, owner))
			}, reject)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {AsyncGenerator} generator
	 * @return {object}
	 */
	function enqueueComponentGenerator (element, generator) {
		return function then (resolve, reject, iterate) {
			generator.next(element.cache).then(function (value) {
				if (value.done === true && value.value === undefined)
					return !iterate && resolve(element.cache)
	
				if (element.cache = value.value, iterate)
					resolve(element.cache)
	
				then(resolve, reject, iterate)
			}, reject)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} owner
	 * @param {function?} callback
	 */
	function enqueueComponentUpdate (element, owner, callback, signature) {
		if (!element)
			return requestAnimationFrame(function () {
				enqueueComponentUpdate(getComponentElement(owner), owner, callback, signature)
			})
	
		if (element.active)
			updateComponentElement(element, element, signature)
		else
			merge(owner.state, element.cache)
	
		if (callback)
			enqueueStateCallback(element, owner, callback)
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} owner
	 * @param {(Object|function)} state
	 * @param {function?} callback
	 */
	function enqueueStateUpdate (element, owner, state, callback) {
		if (state)
			if (element)
				switch (typeof state) {
					case 'function':
						return enqueueStateUpdate(element, owner, enqueueStateCallback(element, owner, state), callback)
					case 'object':
						if (thenable(element.cache = state))
							enqueueStatePromise(element, owner, state, callback)
						else
							enqueueComponentUpdate(element, owner, callback, SharedComponentStateUpdate)
				}
			else
				return requestAnimationFrame(function () {
					enqueueStateUpdate(getComponentElement(owner), owner, state, callback)
				})
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} owner
	 * @param {Promise} state
	 * @param {function?} callback
	 * @param {Promise}
	 */
	function enqueueStatePromise (element, owner, state, callback) {
		return state.then(function (value) {
			if (value)
				if (fetchable(value))
					enqueueStateUpdate(element, owner, value.json(), callback)
				else
					enqueueStateUpdate(element, owner, value, callback)
		}, function (err) {
			invokeErrorBoundary(element, err, SharedSitePromise+':'+SharedSiteSetState, SharedErrorCatch)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} owner
	 * @param {function} callback
	 */
	function enqueueStateCallback (element, owner, callback) {
		try {
			if (typeof callback === 'function')
				return callback.call(owner, owner.state, owner.props, owner.context)
		} catch (err) {
			invokeErrorBoundary(element, err, SharedSiteSetState+':'+SharedSiteCallback, SharedErrorCatch)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Object?} state
	 */
	function getLifecycleState (element, state) {
		switch (typeof state) {
			case 'object':
			case 'function':
				enqueueStateUpdate(element, element.owner, state)
		}
	}
	
	/**
	 * @param {(Component|object)?} value
	 * @param {*} key
	 * @param {Element} element
	 */
	function getLifecycleRefs (value, key, element) {
		if (key !== element.ref)
			delete this.refs[element.ref]
	
		this.refs[key] = value
	}
	
	/**
	 * @param {Element} element
	 * @param {function} type
	 * @param {object} props
	 * @param {object} context
	 * @return {Component}
	 */
	function getLifecycleClass (element, type, props, context) {
		try {
			element.owner = new type(props, context)
		} catch (err) {
			invokeErrorBoundary((element.owner = new Component(props, context), element), err, SharedSiteConstructor, SharedErrorCatch)
		} finally {
			return element.owner
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Object} props
	 * @param {Object} state
	 * @param {Object} context
	 * @return {Object?}
	 */
	function getLifecyclePayload (element, name, props, state, context) {
		try {
			return element.owner[name](props, state, context)
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorCatch)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Component} owner
	 * @return {Promise?}
	 */
	function getLifecycleUnmount (element, name, owner) {
		try {
			return owner[name](getNodeOwner(getElementDescription(element)))
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorCatch)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Component} owner
	 */
	function getLifecycleMount (element, name, owner) {
		try {
			getLifecycleState(element, owner[name](element.active && getNodeOwner(getElementDescription(element))))
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorCatch)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Object} props
	 * @param {Object} state
	 * @param {Object} context
	 * @return {boolean?}
	 */
	function getLifecycleShould (element, name, props, state, context) {
		try {
			return element.owner[name](props, state, context)
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorCatch)
		} finally {
			element.work = SharedWorkIdle
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Object} props
	 * @param {Object} state
	 * @param {Object} context
	 * @return {boolean?}
	 */
	function getLifecycleReceive (element, name, props, state, context) {
		try {
			getLifecycleState((element.work = SharedWorkIntermediate, element), element.owner[name](props, context))
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorCatch)
		} finally {
			if (state !== (element.work = SharedWorkIdle, element.cache))
				merge(state, element.cache)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} error
	 * @param {Exception} exception
	 * @param {number} work
	 * @return {boolean?}
	 */
	function getLifecycleBoundary (element, name, error, exception, work) {
		try {
			getLifecycleState(element, element.owner[name](error, exception))
		} catch (err) {
			invokeErrorBoundary(element.host, err, SharedComponentDidCatch, SharedErrorCatch)
		} finally {
			exception.bubbles = false
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Object} props
	 * @param {Object} state
	 * @param {Object} context
	 * @return {boolean?}
	 */
	function getLifecycleUpdate (element, name, props, state, context) {
		try {
			getLifecycleState(element, element.owner[name](props, state, context))
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorCatch)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {function} callback
	 * @param {object?} props
	 * @param {string?} name
	 * @param {object?} state
	 * @return {*?}
	 */
	function getLifecycleCallback (element, callback, props, name, state) {
		try {
			if (typeof callback === 'function')
				return callback.call(element.owner, props, name, state)
		} catch (err) {
			invokeErrorBoundary(element, err, SharedSiteCallback, SharedErrorCatch)
		}
	}
	
	/**
	 * @param {Component} owner
	 * @param {string} name
	 * @param {function} callback
	 */
	function getLifecycleOnce (owner, name, callback) {
		return owner[name] = function () {
			return delete this[name] && callback(this)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} owner
	 * @return {Element}
	 */
	function getComponentSnapshot (element, owner) {
		try {
			return getElementDefinition(owner.render(owner.props, owner.state, owner.context))
		} catch (err) {
			if (!invokeErrorBoundary(element, err, SharedSiteRender, SharedErrorCatch))
				return getElementDefinition()
		}
	}
	
	/**
	 * @param {Component} owner
	 * @return {Element}
	 */
	function getComponentElement (owner) {
		return owner[SymbolElement]
	}
	
	/**
	 * @constructor
	 * @param {Object?} props
	 * @param {Object?} context
	 */
	function ContextProvider (props, context) {
	  Component.call(this, props, context)
	}
	/**
	 * @type {Object}
	 */
	ContextProvider[SharedSitePrototype] = create(Component[SharedSitePrototype], {
	  getInitialState: {value: function (props) {
	    return this[SymbolElement].xmlns = {provider: this, consumers: new List()}
	  }},
	  render: {value: function (props) {
	    return props.children
	  }},
	  componentDidUpdate: {value: function (props) {
	    !is(this.props.value, props.value) && this.state.consumers.forEach(this.componentChildUpdate)
	  }},
	  componentChildUpdate: {value: function (consumer) {
	    consumer.didUpdate = consumer.didUpdate ? false : !!consumer[SharedSiteForceUpdate]()
	  }}
	})
	
	/**
	 * @constructor
	 * @param {Object?} props
	 * @param {Object?} context
	 */
	function ContextConsumer (props, context) {
	  Component.call(this, props, context)
	}
	/**
	 * @type {Object}
	 */
	ContextConsumer[SharedSitePrototype] = create(Component[SharedSitePrototype], {
	  getInitialState: {value: function (props) {
	    return this[SymbolContext] || {provider: this}
	  }},
	  render: {value: function (props, state) {
	    return props.children(state.provider.props.value)
	  }},
	  componentWillReceiveProps: {value: function () {
	    this.didUpdate = true
	  }},
	  componentDidMount: {value: function () {
	    this.state.consumers && this.state.consumers.insert(this, this.state.consumers)
	  }},
	  componentWillUnmount: {value: function () {
	    this.state.consumers && this.state.consumers.remove(this)
	  }}
	})
	
	/**
	 * @param {object} value
	 * @return {object}
	 */
	function createContextComponent (value) {
	  return {
	    Provider: function Provider (props) {
	      return createElement(ContextProvider, assign({}, value, props))
	    },
	    Consumer: function Consumer (props) {
	      return createElement(ContextConsumer, assign({}, value, props))
	    }
	  }
	}
	
	/**
	 * @param {*} value
	 * @return {object}
	 */
	function createContext (value) {
	  return createContextComponent({value: value, children: noop})
	}
	
	/**
	 * @param {Element} element
	 */
	function commitCreate (element) {
		try {
			switch (element.id) {
				case SharedElementNode:
					element.owner = createNodeElement(element)
					break
				case SharedElementText:
					element.owner = createNodeText(element)
					break
				case SharedElementEmpty:
					element.owner = createNodeEmpty(element)
					break
				case SharedElementCustom:
					element.owner = createNodeComponent(element)
					break
				case SharedElementComponent:
				case SharedElementPortal:
					break
				default:
					element.owner = getElementBoundary(element, SharedLinkedNext).owner
			}
		} catch (err) {
			commitRebase(element, getElementDefinition(invokeErrorBoundary(element, err, SharedSiteElement, SharedErrorCatch)))
		} finally {
			return element.active = true
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function commitRebase (element, snapshot) {
		commitCreate(createElementRebase(merge(element, snapshot), element))
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function commitReplace (element, snapshot) {
		var host = element.host
		var parent = element.parent
		var sibling = getElementSibling(element, parent, SharedLinkedNext)
	
		commitUnmount(element, parent, SharedMountRemove)
		commitMount(snapshot, sibling, parent, host, SharedMountInsert, SharedMountCommit)
	
		if (host.children !== element)
			setElementSibling(element, snapshot, parent.children)
		else
			host.children = snapshot
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} host
	 * @param {number} operation
	 * @param {number} signature
	 */
	function commitChildren (element, sibling, host, operation, signature) {
		var children = element.children
		var length = children.length
		var next = children.next
	
		while (length-- > 0) {
			commitMount(next, sibling, element, host, operation, signature)
			next = next.next
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 * @param {Element} host
	 * @param {number} operation
	 * @param {number} signature
	 */
	function commitMount (element, sibling, parent, host, operation, signature) {
		element.host = host
		element.parent = parent
	
		switch (element.id) {
			case SharedElementComponent:
				element.work = SharedWorkMounting
	
				commitMount(mountComponentElement(element), sibling, parent, element, operation, signature)
				commitCreate(element)
	
				element.work = SharedWorkIdle
	
				if (element.owner[SharedComponentDidMount])
					getLifecycleMount(element, SharedComponentDidMount, element.owner)
	
				if (element.ref)
					commitRefs(element, element.ref, SharedRefsDispatch)
	
				return
			case SharedElementPromise:
				commitPromise(element, element.type)
			case SharedElementFragment:
			case SharedElementPortal:
				element.owner = element.id !== SharedElementPortal ? parent.owner : getNodePortal(element)
	
				commitChildren(element, sibling, host, operation, signature)
				commitCreate(element)
	
				return
			case SharedElementCustom:
			case SharedElementNode:
				element.xmlns = getNodeType(element, parent.xmlns)
			default:
				switch (signature) {
					case SharedMountQuery:
						if (commitQuery(element, parent))
							break
					default:
						commitCreate(element)
	
						if (operation === SharedMountAppend)
							commitAppend(element, parent)
						else
							commitInsert(element, sibling, parent)
				}
	
				if (element.id > SharedElementNode)
					return
		}
	
		commitChildren(element, sibling, host, SharedMountAppend, signature)
		commitProps(element, getNodeProps(element), SharedPropsMount)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {number} signature
	 */
	function commitDismount (element, parent, signature) {
		switch (element.active = false, element.id) {
			case SharedElementComponent:
				commitDismount(element.children, parent, -signature)
				unmountComponentElement(element)
			case SharedElementText:
			case SharedElementEmpty:
				break
			case SharedElementPortal:
				if (signature < SharedElementUnsigned && parent.id > SharedElementIntermediate)
					commitRemove(element, parent)
			default:
				var children = element.children
				var length = children.length
	
				while (length-- > 0)
					commitDismount(children = children.next, element, -signature)
		}
	
		if (element.ref)
			commitRefs(element, element.ref, SharedRefsRemove)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {number} signature
	 */
	function commitUnmount (element, parent, signature) {
		if (signature > SharedElementUnsigned)
			commitDismount(element, parent, signature)
	
		if (element.id !== SharedElementComponent)
			return commitRemove(element, parent)
	
		if (element.cache)
			return element.cache = void element.cache.then(
				commitWillUnmount(element, parent, element, SharedErrorThrow),
				commitWillUnmount(element, parent, element, SharedErrorCatch)
			)
	
		commitUnmount(element.children, parent, SharedElementUnsigned)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {Element} host
	 * @param {number} signature
	 * @return {function}
	 */
	function commitWillUnmount (element, parent, host, signature) {
		if (element.id === SharedElementComponent)
			return commitWillUnmount(element.children, parent, host, signature)
	
		return function (err) {
			commitUnmount(element, parent, SharedMountRemove)
	
			if (signature === SharedErrorCatch)
				invokeErrorBoundary(host, err, SharedSitePromise+':'+SharedComponentWillUnmount, SharedErrorCatch)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {object} type
	 */
	function commitPromise (element, type) {
		type.then(function (value) {
			element.active && element.type === type && reconcileChildren(element, getElementModule(value))
		}, function (err) {
			invokeErrorBoundary(element, err, SharedSitePromise+':'+SharedSiteRender, SharedErrorCatch)
		}, SymbolAsyncIterator)
	}
	
	/**
	 * @param {Element} element
	 * @param {number} props
	 * @param {number} signature
	 */
	function commitProps (element, props, signature) {
		for (var key in props)
			switch (key) {
				case 'key':
				case 'xmlns':
				case 'children':
					break
				case 'ref':
					return commitRefs(element, props[key], signature)
				case 'style':
					return setNodeStyle(element, key, props[key])
				default:
					if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.length > 2)
						commitEvents(element, key.substring(2).toLowerCase(), props[key])
					else
						setNodeProps(element, key, props[key], element.xmlns)
			}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} type
	 * @param {(function|EventListener)?} callback
	 */
	function commitEvents (element, type, callback) {
		if (!element.cache)
			element.cache = {}
	
		if (!element.cache[type])
			setNodeEvent(element, type)
	
		element.cache[type] = callback
	}
	
	/**
	 * @param {Element} element
	 * @param {(function|string)?} callback
	 * @param {number} signature
	 * @param {*} key
	 */
	function commitRefs (element, callback, signature, key) {
		switch (typeof callback) {
			case 'string':
				if (signature === SharedRefsRemove)
					return commitRefs(element, getLifecycleRefs, SharedRefsRemove, callback)
	
				return commitRefs(element, getLifecycleRefs, SharedRefsDispatch, callback)
			case 'function':
				switch (signature) {
					case SharedRefsRemove:
						return getLifecycleCallback(element.host, callback, element.ref = null, key, element)
					case SharedRefsAssign:
						element.ref = callback
					case SharedRefsDispatch:
						return getLifecycleCallback(element.host, callback, element.owner, key, element)
					case SharedRefsReplace:
						commitRefs(element, element.ref, SharedRefsRemove, key)
						commitRefs(element, callback, SharedRefsAssign, key)
				}
	
				break
			default:
				commitRefs(element, element.ref === callback ? noop : element.ref, SharedRefsRemove, key)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @return {boolean}
	 */
	function commitQuery (element, parent) {
		element.owner = getNodeQuery(
			element,
			parent,
			getElementDescription(getElementSibling(element, parent, SharedLinkedPrevious)),
			getElementSibling(element, parent, SharedLinkedNext)
		)
	
		return element.active = !!element.owner
	}
	
	/**
	 * @param {Element} element
	 * @param {string} value
	 */
	function commitText (element, value) {
		setNodeText(element, value)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitRemove (element, parent) {
		if (parent.id < SharedElementPortal)
			return commitRemove(element, getElementParent(parent))
	
		if (element.id > SharedElementIntermediate)
			return removeNodeChild(element, parent)
	
		element.children.forEach(function (children) {
			commitRemove(getElementDescription(children), element)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 */
	function commitInsert (element, sibling, parent) {
		if (parent.id < SharedElementIntermediate)
			if (parent.id < SharedElementPortal)
				return commitInsert(element, sibling, getElementParent(parent))
			else if (!parent.active)
				return commitAppend(element, parent)
	
		switch (sibling.id) {
			case SharedElementPromise:
			case SharedElementFragment:
				return commitInsert(element, getElementBoundary(sibling, SharedLinkedNext), parent)
			case SharedElementComponent:
				return commitInsert(element, getElementDescription(sibling), parent)
			case SharedElementPortal:
				return commitInsert(element, getElementSibling(sibling, parent, SharedLinkedNext), parent)
			case SharedElementIntermediate:
				return commitAppend(element, parent)
		}
	
		switch (element.id) {
			case SharedElementPromise:
			case SharedElementFragment:
				return element.children.forEach(function (children) {
					commitInsert(getElementDescription(children), sibling, parent)
				})
			case SharedElementComponent:
				return commitInsert(getElementDescription(element), sibling, parent)
			case SharedElementPortal:
				return
		}
	
		insertNodeBefore(element, sibling, parent)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitAppend (element, parent) {
		if (parent.id < SharedElementPortal)
			return commitAppend(element, getElementParent(parent))
	
		switch (element.id) {
			case SharedElementPromise:
			case SharedElementFragment:
				return element.children.forEach(function (children) {
					commitAppend(getElementDescription(children), parent)
				})
			case SharedElementComponent:
				return commitAppend(getElementDescription(element), parent)
			case SharedElementPortal:
				return
		}
	
		appendNodeChild(element, parent)
	}
	
	/**
	 * @param {Object} prevProps
	 * @param {Object} nextProps
	 * @return {Object?}
	 */
	function reconcileProps (prevProps, nextProps) {
		if (prevProps === nextProps)
			return
	
		var length = 0
		var props = {}
	
		for (var key in prevProps)
			if (!hasOwnProperty.call(nextProps, key))
				props[(++length, key)] = null
	
		for (var key in nextProps) {
			var next = nextProps[key]
			var prev = prevProps[key]
	
			if (next !== prev)
				if (typeof next !== 'object' || next === null)
					props[(++length, key)] = next
				else if (next = reconcileProps(prev || {}, next))
					props[(++length, key)] = next
		}
	
		if (length > 0)
			return props
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function reconcileElement (element, snapshot) {
		if (!element.active)
			return
	
		if (element.key !== snapshot.key)
			return commitReplace(element, snapshot)
	
		if (element.id === SharedElementPromise && snapshot.id === SharedElementPromise)
			return commitPromise(element, element.type = snapshot.type)
	
		if (element.type !== snapshot.type)
			return commitReplace(element, snapshot)
	
		switch (element.id) {
			case SharedElementPortal:
			case SharedElementFragment:
				return reconcileChildren(element, snapshot)
			case SharedElementComponent:
				return updateComponentElement(element, snapshot, SharedComponentPropsUpdate)
			case SharedElementText:
				if (element.children !== snapshot.children)
					commitText(element, element.children = snapshot.children)
			case SharedElementEmpty:
				return
		}
	
		reconcileChildren(element, snapshot)
		commitProps(element, reconcileProps(element.props, element.props = snapshot.props), SharedPropsUpdate)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function reconcileChildren (element, snapshot) {
		var signature = SharedMountAppend
		var host = element.host
		var children = element.children
		var siblings = snapshot.children
		var oldLength = children.length
		var newLength = siblings.length
	
		if (oldLength + newLength === 0)
			return
	
		var oldPos = 0
		var newPos = 0
		var oldEnd = oldLength - 1
		var newEnd = newLength - 1
		var oldHead = children.next
		var newHead = siblings.next
		var oldTail = children.prev
		var newTail = siblings.prev
		var oldNext = oldHead
		var newNext = newHead
		var oldPrev = oldTail
		var newPrev = newTail
	
		// step 1, prefix/suffix
		outer: while (true) {
			while (oldHead.key === newHead.key) {
				oldNext = oldHead.next
				newNext = newHead.next
	
				reconcileElement(oldHead, newHead)
	
				++oldPos
				++newPos
	
				if (oldPos > oldEnd || newPos > newEnd)
					break outer
	
				oldHead = oldNext
				newHead = newNext
			}
	
			while (oldTail.key === newTail.key) {
				oldPrev = oldTail.prev
				newPrev = newTail.prev
	
				reconcileElement(oldTail, newTail)
	
				--oldEnd
				--newEnd
	
				if (oldPos > oldEnd || newPos > newEnd)
					break outer
	
				oldTail = oldPrev
				newTail = newPrev
			}
	
			break
		}
	
		// step 2, mount/remove
		if (oldPos > oldEnd++) {
			if (newPos <= newEnd++) {
				if (newEnd < newLength)
					signature = SharedMountInsert
				else if ((oldTail = children, oldLength > 0))
					newHead = newNext
	
				while (newPos++ < newEnd) {
					newHead = (oldHead = newHead).next
					commitMount(children.insert(oldHead, oldTail), oldTail, element, host, signature, SharedMountCommit)
				}
			}
		} else if (newPos > newEnd++) {
			if (newEnd === newLength && newLength > 0)
				oldHead = oldNext
	
			while (oldPos++ < oldEnd) {
				oldHead = (newHead = oldHead).next
				commitUnmount(children.remove(newHead), element, SharedMountRemove)
			}
		} else {
			reconcileSiblings(element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd, oldLength)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} host
	 * @param {List} children
	 * @param {Element} oldHead
	 * @param {Element} newHead
	 * @param {number} oldPos
	 * @param {number} newPos
	 * @param {number} oldEnd
	 * @param {number} newEnd
	 * @param {number} oldLength
	 */
	function reconcileSiblings (element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd, oldLength) {
		var oldIndex = oldPos
		var newIndex = newPos
		var oldChild = oldHead
		var newChild = newHead
		var prevChild = oldChild
		var nextChild = oldChild
		var prevMoved = oldChild
		var nextMoved = oldChild
		var prevNodes = {}
		var nextNodes = {}
	
		// step 3, hashmap
		while (oldIndex < oldEnd || newIndex < newEnd) {
			if (oldIndex < oldEnd && (prevNodes[oldChild.key] = oldChild, ++oldIndex !== oldLength))
				oldChild = oldChild.next
	
			if (newIndex < newEnd && (nextNodes[newChild.key] = newChild, ++newIndex !== newEnd))
				newChild = newChild.next
		}
	
		// step 4, mount/move
		while (newIndex-- > newPos) {
			prevChild = newChild.prev
			nextChild = newChild.next
			prevMoved = prevNodes[newChild.key]
			nextMoved = prevNodes[nextChild.key]
	
			if (isValidElement(prevMoved)) {
				if (!isValidElement(nextChild)) {
					if (isValidElement(nextMoved = prevMoved.next) && isValidElement(nextNodes[nextMoved.key])) {
						if (prevChild.key === oldChild.key) {
							commitAppend(children.insert(children.remove(prevMoved), children), element)
						} else if (nextMoved !== oldChild) {
							if (isValidElement(nextChild = nextNodes[oldChild.key])) {
								if (oldChild.prev.key === nextChild.prev.key)
									commitAppend(children.insert(children.remove(prevMoved), children), element)
								else
									commitInsert(children.insert(children.remove(prevMoved), oldChild), oldChild, element)
							} else if (nextMoved.key !== oldChild.prev.key) {
								commitInsert(children.insert(children.remove(prevMoved), oldChild), oldChild, element)
							}
						}
					}
				} else {
					nextChild = nextChild.active ? nextChild : nextMoved || oldChild
					nextMoved = prevMoved.next
	
					if (nextChild.key !== nextMoved.key) {
						while (isValidElement(nextMoved) && !isValidElement(nextNodes[nextMoved.key]))
							nextMoved = nextMoved.next
	
						if (nextChild.key !== nextMoved.key)
							if (prevChild.key !== prevMoved.prev.key || nextChild.key !== nextMoved.next.key)
								commitInsert(children.insert(children.remove(prevMoved), nextChild), nextChild, element)
					}
				}
			} else if (!isValidElement(nextChild)) {
				commitMount(children.insert(newChild, children), newChild, element, host, SharedMountAppend, SharedMountCommit)
			} else {
				nextChild = nextChild.active ? nextChild : (nextMoved || oldChild)
				commitMount(children.insert(newChild, nextChild), nextChild, element, host, SharedMountInsert, SharedMountCommit)
			}
	
			newChild = prevChild
		}
	
		// step 5, remove/update
		for (var oldKey in prevNodes)
			if (isValidElement((oldChild = prevNodes[oldKey], newChild = nextNodes[oldKey])))
				reconcileElement(oldChild, newChild)
			else
				commitUnmount(children.remove(oldChild), element, SharedMountRemove)
	}
	
	/**
	 * @param {Event}
	 */
	function handleEvent (event) {
		try {
			var type = event.type
			var element = this
			var callback = element.cache[type]
			var host = element.host
			var owner = host.owner || element
			var props = owner.props
			var state = owner.state
			var context = owner.context
			var value
	
			if (!callback)
				return
	
			if (typeof callback === 'function') {
				value = callback.call(owner, event, props, state, context)
			} else if (typeof callback.handleEvent === 'function') {
				if (owner !== callback && callback[SymbolComponent])
					host = getComponentElement(owner = callback)
	
				value = callback.handleEvent(event, props, state, context)
			}
	
			if (value && owner[SymbolComponent])
				getLifecycleState(host, value)
		} catch (err) {
			invokeErrorBoundary(host, err, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), SharedErrorThrow)
		}
	}
	
	/**
	 * @constructor
	 * @param {Element} element
	 * @param {*} err
	 * @param {string} origin
	 * @param {number} signature
	 */
	function Exception (element, err, origin, signature) {
		var message = 'The following error occurred in `\n'
		var componentStack = createExecptionStack(element.host, '<'+getDisplayName(element)+'>\n')
	
		this.componentStack = componentStack
		this.error = err
		this.bubbles = true
		this.origin = origin
		this.message = message + componentStack + '` from "' + origin + '"'
	}
	/**
	 * @type {Object}
	 */
	Exception.prototype = {
		toString: function () {
			return 'Error: ' + Object(this.error).toString() + '\n\n' + this.message
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} stack
	 * @return {string}
	 */
	function createExecptionStack (element, stack) {
		return element && element.host ? stack + createExecptionStack(element.host, '<' + getDisplayName(element) + '>\n') : stack
	}
	
	/**
	 * @param {Element} element
	 * @param {*} err
	 * @param {string} origin
	 * @param {number} signature
	 */
	function invokeErrorBoundary (element, err, origin, signature) {
		propagateErrorBoundary(element, element.host, err, new Exception(element, err, origin, signature), origin, signature)
	}
	
	/**
	 * @param {Element} element
	 * @param {*} err
	 * @param {Exception} exception
	 * @param {string} origin
	 * @param {number} signature
	 */
	function propagateErrorBoundary (element, host, err, exception, origin, signature) {
		if (signature === SharedErrorCatch && recoverErrorBoundary(element, host, err, exception, origin, signature, element.owner))
			return propagateErrorBoundary(host, host.host, err, exception, origin, signature)
	
		if (exception.bubbles && printErrorException(exception))
			throw exception.error
	}
	
	/**
	 * @param {Element} element
	 * @param {Element?} host
	 * @param {*} err
	 * @param {Exception} exception
	 * @param {string} origin
	 * @param {number} signature
	 * @param {Component} owner
	 * @param {boolean?}
	 */
	function recoverErrorBoundary (element, host, err, exception, origin, signature, owner) {
		switch (origin) {
			case SharedComponentWillMount:
			case SharedGetInitialState:
				getLifecycleOnce(owner, SharedSiteRender, noop)
			case SharedSiteRender:
			case SharedComponentWillUnmount:
				break
			case SharedGetChildContext:
			case SharedComponentShouldUpdate:
			case SharedComponentWillUpdate:
			case SharedComponentWillReceiveProps:
				element.active && getLifecycleOnce(owner, SharedSiteRender, noop)
			default:
				element.active && replaceErrorChildren(element, getElementDefinition())
		}
	
		if (owner && !owner[SymbolException] && owner[SharedComponentDidCatch])
			return owner[SymbolException] = getLifecycleBoundary(element, SharedComponentDidCatch, owner[SymbolException] = err, exception)
	
		return isValidElement(host) && isValidElement(host.host)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function replaceErrorChildren (element, snapshot) {
		reconcileElement(element.id === SharedElementComponent ? element.children : element, snapshot)
	}
	
	/**
	 * @param {(object|string)} exception
	 */
	function printErrorException (exception) {
		try { console.error(exception.toString()) } catch (err) {} finally { return exception }
	}
	
	/**
	 * @param {*} element
	 * @return {object?}
	 */
	function findDOMNode (element) {
		if (!element)
			return element
	
		if (getComponentElement(element))
			return findDOMNode(getComponentElement(element))
	
		if (isValidElement(element))
			return element.active && getNodeOwner(getElementDescription(element))
	
		if (isValidNodeEvent(element))
			return getNodeTarget(element)
	
		if (isValidNodeTarget(element))
			return element
	}
	
	/**
	 * @type {Object}
	 */
	var Children = {
		toArray: arrayChildren,
		forEach: eachChildren,
		map: mapChildren,
		filter: filterChildren,
		find: findChildren,
		count: countChildren,
		only: onlyChildren
	}
	
	/**
	 * @param {*} children
	 * @return {Array}
	 */
	function arrayChildren (children) {
		var array = []
	
		if (children == null)
			return array
		if (isValidElement(children) || typeof children !== 'object')
			return [children]
		if (isArray(children))
			return flatten(children, array)
		if (typeof children[SharedLinkedNext] === 'function' || typeof children.forEach === 'function')
			each(children, function (element) {
				return array.push(element)
			})
		else if (typeof children[SymbolIterator] === 'function')
			return arrayChildren(children[SymbolIterator]())
		else
			array.push(children)
	
		return flatten(array, [])
	}
	
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @param {*} thisArg
	 */
	function eachChildren (children, callback, thisArg) {
		if (children != null)
			arrayChildren(children).forEach(callback, thisArg)
	}
	
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @return {Array}
	 */
	function mapChildren (children, callback, thisArg) {
		return children != null ? arrayChildren(children).map(callback, thisArg) : children
	}
	
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @param {*} thisArg
	 */
	function filterChildren (children, callback, thisArg) {
		return children != null ? arrayChildren(children).filter(callback, thisArg) : children
	}
	
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @param {*} thisArg
	 */
	function findChildren (children, callback, thisArg) {
		return children != null ? find(arrayChildren(children), callback, thisArg) : children
	}
	
	/**
	 * @param {*} children
	 * @return {number}
	 */
	function countChildren (children) {
		return arrayChildren(children).length
	}
	
	/**
	 * @param {*} children
	 * @return {Element?}
	 */
	function onlyChildren (children) {
		return isValidElement(children) ? children : invariant('Children.only', 'Expected to receive a single element')
	}
	
	/**
	 * @param {*} element
	 * @param {object} container
	 * @param {function=} callback
	 */
	function render (element, container, callback) {
		if (!container)
			render(element, getNodeDocument(), callback)
		else if (root.has(container))
			update(root.get(container).children, getElementDefinition(element), callback)
		else
			mount(element, container, callback, SharedMountCommit)
	}
	
	/**
	 * @param {*} element
	 * @param {object} container
	 * @param {function=} callback
	 */
	function hydrate (element, container, callback) {
		if (!container)
			hydrate(element, getNodeDocument(), callback)
		else
			mount(element, container, callback, SharedMountQuery)
	}
	
	/**
	 * @param {Element} element
	 * @param {object} container
	 * @param {function} callback
	 * @param {number} signature
	 */
	function mount (element, container, callback, signature) {
		if (!isValidElement(element))
			mount(getElementDefinition(element), container, callback, signature)
		else if (!isValidNodeTarget(container))
			invariant(SharedSiteRender, 'Target container is not a valid container')
		else
			initialize(element, createElementIntermediate(element), container, signature)
	
		if (callback)
			getLifecycleCallback(element, callback)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {Element} callback
	 */
	function update (element, snapshot, callback) {
		reconcileElement(element, snapshot)
	
		if (callback)
			getLifecycleCallback(element, callback)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {object} container
	 * @param {number} signature
	 */
	function initialize (element, parent, container, signature) {
		root.set(parent.owner = container, parent)
	
		if (signature === SharedMountCommit)
			setNodeContent(parent)
	
		commitMount(element, element, parent, parent, SharedMountAppend, signature)
	}
	
	/**
	 * @param {Node} container
	 * @return {boolean}
	 */
	function unmountComponentAtNode (container) {
		return root.has(container) && !render(null, container)
	}
	
	/**
	 * @param {string|function|Element|Object} type
	 * @return {function|Object}
	 */
	function createFactory (type) {
		if (type !== null && typeof type === 'object' && !isValidElement(type))
			return factory(window, type, require)
	
		return createElement.bind(null, type)
	}
	
	/**
	 * @param {string} type
	 * @param {function} value
	 * @return {function}
	 */
	function getFactory (type, value) {
		if (!config)
			return value
	
		if (typeof config[type] === 'function')
			return config[type].bind(config)
	
		return config[type] = value
	}
	
	var setNodeContent = getFactory('setContent', setDOMContent)
	var setNodeText = getFactory('setText', setDOMText)
	var setNodeEvent = getFactory('setEvent', setDOMEvent)
	var setNodeProps = getFactory('setProps', setDOMProps)
	var setNodeStyle = getFactory('setStyle', setDOMStyle)
	
	var getNodeOwner = getFactory('getOwner', getDOMOwner)
	var getNodeDocument = getFactory('getDocument', getDOMDocument)
	var getNodeTarget = getFactory('getTarget', getDOMTarget)
	var getNodeType = getFactory('getType', getDOMType)
	var getNodeProps = getFactory('getProps', getDOMProps)
	var getNodePortal = getFactory('getPortal', getDOMPortal)
	var getNodeQuery = getFactory('getQuery', getDOMQuery)
	
	var isValidNodeTarget = getFactory('isValidTarget', isValidDOMTarget)
	var isValidNodeEvent = getFactory('isValidEvent', isValidDOMEvent)
	var isValidNodeComponent = getFactory('isValidNodeComponent', isValidDOMComponent)
	
	var removeNodeChild = getFactory('removeChild', removeDOMChild)
	var appendNodeChild = getFactory('appendChild', appendDOMChild)
	var insertNodeBefore = getFactory('insertBefore', insertDOMBefore)
	
	var createNodeText = getFactory('createText', createDOMText)
	var createNodeEmpty = getFactory('createEmpty', createDOMEmpty)
	var createNodeElement = getFactory('createElement', createDOMElement)
	var createNodeComponent = getFactory('createComponent', createDOMComponent)
	
	/**
	 * @param {Element} element
	 */
	function setDOMContent (element) {
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
	 * @param {(EventListener|Element)} element
	 * @param {string} type
	 */
	function setDOMEvent (element, type) {
		element.owner.addEventListener(type, element, false)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {(object|string)?} value
	 */
	function setDOMStyle (element, name, value) {
		if (typeof value === 'object')
			for (var property in value) {
				var declaration = value[property]
	
				if (property.indexOf('-') === -1)
					element.owner.style[property] = declaration !== false && declaration !== undefined ? declaration : ''
				else
					element.owner.style.setProperty(property, declaration)
			}
		else
			setDOMAttribute(element, name, value, '')
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
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
	 * @param {*} value
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
	 * @param {*} value
	 * @param {string?} xmlns
	 */
	function setDOMProps (element, name, value, xmlns) {
		switch (name) {
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
				return setDOMProps(element, 'innerHTML', value && value.__html, xmlns)
			case 'acceptCharset':
				return setDOMProps(element, 'accept-charset', value, xmlns)
			case 'httpEquiv':
				return setDOMProps(element, 'http-equiv', value, xmlns)
			case 'tabIndex':
				return setDOMProps(element, name.toLowerCase(), value, xmlns)
			case 'autofocus':
			case 'autoFocus':
				return element.owner[value ? 'focus' : 'blur']()
			case 'width':
			case 'height':
				if (element.type === 'img')
					return setDOMAttribute(element, name, value, '')
		}
	
		switch (typeof value) {
			case 'object':
				return setDOMProperty(element, name, value && getDOMProps(element)[name])
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
	 * @param {Array} nodes
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
			default:
				return xmlns
		}
	}
	
	/**
	 * @param {Element} element
	 * @return {Object}
	 */
	function getDOMProps (element) {
		switch (element.type) {
			case 'input':
				return merge({type: null, step: null, min: null, max: null}, element.props)
			default:
				return element.props
		}
	}
	
	/**
	 * @param {Element} element
	 * @return {Node}
	 */
	function getDOMPortal (element) {
		if (typeof element.type === 'string')
			return getDOMDocument().querySelector(element.type)
	
		if (isValidDOMTarget(element.type))
			return element.type
	
		return getDOMDocument()
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {Element} previousSibling
	 * @param {Element} nextSibling
	 */
	function getDOMQuery (element, parent, previousSibling, nextSibling) {
		var id = element.id
		var type = id > SharedElementNode ? '#text' : element.type.toLowerCase()
		var props = element.props
		var children = element.children
		var length = children.length
		var target = previousSibling.active ? previousSibling.owner.nextSibling : parent.owner.firstChild
		var sibling = target
		var node = null
	
		while (target) {
			if (target.nodeName.toLowerCase() === type) {
				if (id > SharedElementNode) {
					if (nextSibling.id > SharedElementNode)
						target.splitText(0)
	
					if (target.nodeValue !== children)
						target.nodeValue = children
				} else if (length === 0 && target.firstChild) {
					target.textContent = ''
				}
	
				if (parent.id === SharedElementPortal)
					getDOMPortal(parent).appendChild(target)
	
				node = target
				type = null
	
				if (!(target = target.nextSibling) || nextSibling.type)
					break
			}
	
			if (id > SharedElementNode && length === 0) {
				target.parentNode.insertBefore(node = createDOMText(element), target)
	
				if (!nextSibling.type)
					type = null
				else
					break
			}
	
			target = (sibling = target).nextSibling
			sibling.parentNode.removeChild(sibling)
		}
	
		if (node && !node.splitText)
			for (var attributes = node.attributes, i = attributes.length - 1; i >= 0; --i)
				if (props[type = attributes[i].name] == null)
					node.removeAttribute(type)
	
		return node
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
	 * @param {function}  component
	 * @return {boolean}
	 */
	function isValidDOMComponent (component) {
		return isValidDOMTarget(component)
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
	 * @param {Element} sibling
	 * @param {Element} parent
	 */
	function insertDOMBefore (element, sibling, parent) {
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
	function createDOMElement (element) {
		return element.xmlns ? document.createElementNS(element.xmlns, element.type) : document.createElement(element.type)
	}
	
	/**
	 * @param {Element} element
	 * @return {Node}
	 */
	function createDOMComponent (element) {
		try {
			return new element.owner(element.props)
		} catch (err) {
			if (!customElements.define(random(getDisplayName(element.owner).toLowerCase()+'-'), element.owner))
				return createDOMComponent(element)
		}
	}
	
	exports.render = render
	exports.hydrate = hydrate
	exports.Component = Component
	exports.Fragment = SymbolFragment
	exports.PureComponent = PureComponent
	exports.Children = Children
	exports.createContext = createContext
	exports.createFactory = createFactory
	exports.cloneElement = cloneElement
	exports.isValidElement = isValidElement
	exports.createPortal = createPortal
	exports.createElement = createElement
	exports.createClass = createClass
	exports.unmountComponentAtNode = unmountComponentAtNode
	exports.findDOMNode = findDOMNode
	exports.h = createElement
	
	if (typeof require === 'function')
		(function () {
			try {
				require('./'+'cjs')(exports, Element, createElementIntermediate, mountComponentElement, getElementDefinition, getElementDescription)
			} catch (error) {
				/* istanbul ignore next */
				printErrorException(error)
				/* istanbul ignore next */
				printErrorException('Something went wrong when importing "server" module')
			}
		}())
	
	if (typeof config === 'object' && typeof config.createExport === 'function')
		return config.createExport(exports, Element, createElementIntermediate, mountComponentElement, getElementDefinition, getElementDescription) || exports
	
	return exports
}

/* istanbul ignore next */
return factory(global)
})(/* istanbul ignore next */typeof window === 'object' ? window : (typeof global === 'object' ? global : this));

export var render = dio.render;
export var hydrate = dio.hydrate;
export var Component = dio.Component;
export var Fragment = dio.Fragment;
export var PureComponent = dio.PureComponent;
export var Children = dio.Children;
export var createContext = dio.createContext;
export var createFactory = dio.createFactory;
export var cloneElement = dio.cloneElement;
export var isValidElement = dio.isValidElement;
export var createPortal = dio.createPortal;
export var createElement = dio.createElement;
export var createClass = dio.createClass;
export var unmountComponentAtNode = dio.unmountComponentAtNode;
export var findDOMNode = dio.findDOMNode;
export var h = dio.h;

export default dio;
