/*! DIO 8.1.0-alpha.1 @license MIT */

;(function (global) {/* eslint-disable */'use strict'
function factory (window, config, require) {

	var exports = {version: '8.1.0-alpha.1'}
	
	var SharedElementPromise = -3
	var SharedElementFragment = -2
	var SharedElementPortal = -1
	var SharedElementIntermediate = 0
	var SharedElementComponent = 1
	var SharedElementNode = 2
	var SharedElementText = 3
	var SharedElementEmpty = 4
	
	var SharedReferenceRemove = -1
	var SharedReferenceAssign = 0
	var SharedReferenceDispatch = 1
	var SharedReferenceReplace = 2
	
	var SharedComponentForceUpdate = 0
	var SharedComponentPropsUpdate = 1
	var SharedComponentStateUpdate = 2
	
	var SharedMountQuery = 0
	var SharedMountCommit = 1
	var SharedMountRemove = 2
	var SharedMountAppend = 3
	var SharedMountInsert = 4
	
	var SharedWorkMounting = -2
	var SharedWorkProcessing = -1
	var SharedWorkIntermediate = 0
	var SharedWorkIdle = 1
	
	var SharedErrorPassive = -2
	var SharedErrorActive = -1
	
	var SharedPropsMount = 1
	var SharedPropsUpdate = 2
	
	var SharedSiblingPrevious = 'prev'
	var SharedSiblingNext = 'next'
	
	var SharedSiteCallback = 'callback'
	var SharedSiteRender = 'render'
	var SharedSiteElement = 'element'
	var SharedSiteConstructor = 'constructor'
	var SharedSiteAsync = 'async'
	var SharedSiteSetState = 'setState'
	var SharedSiteFindDOMNode = 'findDOMNode'
	
	var SharedKeySigil = '&|'
	var SharedKeyHead = '&head'
	var SharedKeyTail = '&tail'
	
	var SharedTypeEmpty = '#empty'
	var SharedTypeText = '#text'
	
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
	
	var defineProperty = Object.defineProperty
	var defineProperties = Object.defineProperties
	var hasOwnProperty = Object.hasOwnProperty
	var isArray = Array.isArray
	
	var WeakMap = window.WeakMap || WeakHash
	var Symbol = window.Symbol || function (d) { return hash(d) }
	var requestAnimationFrame = window.requestAnimationFrame || function (c) { setTimeout(c, 16) }
	
	var SymbolFor = Symbol.for || Symbol
	var SymbolIterator = Symbol.iterator || '@@iterator'
	var SymbolError = SymbolFor('dio.Error')
	var SymbolElement = SymbolFor('dio.Element')
	var SymbolFragment = SymbolFor('dio.Fragment')
	var SymbolComponent = SymbolFor('dio.Component')
	
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
	defineProperties(List.prototype, {
		/**
		 * @param {Object} node
		 * @param {Object} before
		 * @return {Object}
		 */
		insert: {value: function insert (node, before) {
			node.next = before
			node.prev = before.prev
			before.prev.next = node
			before.prev = node
			this.length++
	
			return node
		}},
		/**
		 * @param {Object} node
		 * @return {Object}
		 */
		remove: {value: function remove (node) {
			if (this.length === 0)
				return node
	
			node.next.prev = node.prev
			node.prev.next = node.next
			this.length--
	
			return node
		}},
		/**
		 * @param {function} callback
		 */
		forEach: {value: function forEach (callback) {
			for (var i = 0, node = this; i < this.length; ++i)
				callback(node = node.next, i)
		}}
	})
	
	/**
	 * @constructor
	 */
	function WeakHash () {
		this.hash = ''
	}
	/**
	 * @type {Object}
	 */
	defineProperties(WeakHash.prototype, {
		/**
		 * @param {*} key
		 * @param {*} value
		 */
		set: {value: function set (key, value) {
			key[this.hash] = value
		}},
		/**
		 * @param {*} key
		 * @return {*}
		 */
		get: {value: function get (key) {
			return key[this.hash]
		}},
		/**
		 * @param {*} key
		 * @return {boolean}
		 */
		has: {value: function has (key) {
			return this.hash in key
		}}
	})
	
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
			if (isArray(array[i]))
				flatten(array[i], output)
			else
				output.push(array[i])
	
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
	defineProperties(Element.prototype, {
		constructor: {value: SymbolElement},
		handleEvent: {value: handleEvent}
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
		if (typeof element[SymbolIterator] === 'function')
			return createElementFragment(childrenArray(element))
	
		switch (typeof element) {
			case 'boolean':
				return createElementEmpty(key)
			case 'object':
				if (typeof element.then !== 'function')
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
	
		if (key !== undefined)
			portal.key = key
	
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
		var children = id !== SharedElementComponent ? new List() : null
	
		if (i === 1 && typeof config === 'object' && config[SymbolIterator] === undefined) {
			switch (config.constructor) {
				case SymbolElement:
					break
				default:
					if (isArray(config))
						break
				case Object:
					if (typeof config.then === 'function')
						break
	
					setElementProps(element, (i++, props = config))
	
					if (props.children !== undefined && id !== SharedElementComponent)
						props.children = void (index = setElementChildren(children, props.children, index))
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
					props = getDefaultProps(element, type, props)
				break
			case 'number':
			case 'symbol':
				if (type === SymbolFragment)
					setElementBoundary((element.id = SharedElementFragment, children))
				break
			case 'object':
				if (isValidElement(type))
					type = (setElementProps(element, props = assign({}, type.props, props)), element.id = type.id, type.type)
				else if (typeof type.then === 'function')
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
					element.key = SharedKeySigil + index
	
				children.insert(element.active === false ? element : createElementImmutable(element), children)
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
	 * @param {function} type
	 * @param {Object} props
	 * @return {Object}
	 */
	function getDefaultProps (element, type, props) {
		if (typeof type.defaultProps === 'function')
			defineProperty(type, 'defaultProps', {
				value: getLifecycleCallback(element, type.defaultProps)
			})
	
		return assign({}, type.defaultProps, props)
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
	
		if (element.constructor === SymbolElement)
			return element
	
		switch (typeof element) {
			case 'string':
			case 'number':
				return createElementText(element, SharedKeySigil)
			case 'object':
				if (isArray(element))
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
	
	/**
	 * @constructor
	 * @param {Object?} props
	 * @param {Object?} context
	 */
	function Component (props, context) {
		this.refs = null
		this.state = null
		this.props = props
		this.context = context
	}
	
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
	PureComponent.prototype = Object.create(createComponent(Component.prototype), {
		shouldComponentUpdate: {value: shouldComponentUpdate}
	})
	
	/**
	 * @param {Object} prototype
	 * @return {Object}
	 */
	function createComponent (prototype) {
		defineProperty(defineProperties(prototype, {
			forceUpdate: {value: forceUpdate},
			setState: {value: setState}
		}), SymbolComponent, {value: SymbolComponent})
	
		if (!hasOwnProperty.call(prototype, SharedSiteRender))
			defineProperty(prototype, SharedSiteRender, {value: noop, writable: true})
	
		return prototype
	}
	
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
	 * @param {Element} element
	 */
	function mountComponentElement (element) {
		var owner = element.type
		var props = element.props
		var context = element.context || {}
		var prototype = owner.prototype
		var instance
		var children
		var state
	
		if (prototype && prototype.render) {
			if (prototype[SymbolComponent] !== SymbolComponent)
				createComponent(prototype)
	
			instance = owner = getComponentInstance(element, owner)
		} else {
			instance = new Component()
			instance.render = owner
		}
	
		element.owner = owner
		element.instance = instance
		element.context = context
	
		instance[SymbolElement] = element
		instance.refs = {}
		instance.props = props
		instance.context = context
		instance.state = state = instance.state || {}
	
		if (owner[SharedGetInitialState])
			if (element.state = getLifecycleData(element, SharedGetInitialState, props, state, context))
				if (typeof (state = instance.state = element.state).then === 'function') {
					if (element.work === SharedWorkMounting)
						enqueueStatePromise(element, instance, state)
	
					children = null
				}
	
		if (owner[SharedComponentWillMount] && element.work !== SharedWorkIdle)
			getLifecycleMount(element, SharedComponentWillMount)
	
		children = children !== null ? getComponentChildren(element, instance) : getElementDefinition(children)
	
		if (owner[SharedGetChildContext])
			element.context = getComponentContext(element, props, state, context)
	
		return element.children = children
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {number} signature
	 */
	function updateComponent (element, snapshot, signature) {
		switch (element.work) {
			case SharedWorkProcessing:
				requestAnimationFrame(enqueuePendingUpdate(element, snapshot, signature))
			case SharedWorkIntermediate:
				return
		}
	
		element.work = SharedWorkIntermediate
	
		var instance = element.instance
		var owner = element.owner
		var nextContext = instance.context
		var prevProps = element.props
		var nextProps = snapshot.props
		var tempState = element.state
		var prevState = instance.state
		var nextState = signature === SharedComponentStateUpdate ? assign({}, prevState, tempState) : prevState
	
		if (owner[SharedGetChildContext])
			merge(element.context, getComponentContext(element, nextProps, nextState, nextContext))
	
		switch (signature) {
			case SharedComponentForceUpdate:
				break
			case SharedComponentPropsUpdate:
				if (owner[SharedComponentWillReceiveProps])
					getLifecycleUpdate(element, SharedComponentWillReceiveProps, nextProps, nextContext)
			case SharedComponentStateUpdate:
				if (owner[SharedComponentShouldUpdate])
					if (!getLifecycleUpdate(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext))
						return void (element.work = SharedWorkIdle)
		}
	
		element.work = SharedWorkProcessing
	
		if (tempState !== element.state)
			merge(nextState, element.state)
	
		if (owner[SharedComponentWillUpdate])
			getLifecycleUpdate(element, SharedComponentWillUpdate, nextProps, nextState, nextContext)
	
		if (signature === SharedComponentPropsUpdate)
			instance.props = element.props = nextProps
	
		if (signature === SharedComponentStateUpdate)
			instance.state = nextState
	
		reconcileElement(element.children, getComponentChildren(element, instance))
	
		if (owner[SharedComponentDidUpdate])
			getLifecycleUpdate(element, SharedComponentDidUpdate, prevProps, prevState, nextContext)
	
		if (element.ref !== snapshot.ref)
			commitRefs(element, snapshot.ref, SharedReferenceReplace)
	
		element.work = SharedWorkIdle
	}
	
	/**
	 * @param {Element} element
	 */
	function unmountComponentElement (element) {
		if ((element.state = null, element.owner[SharedComponentWillUnmount]))
			element.state = getLifecycleMount(element, SharedComponentWillUnmount)
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} instance
	 * @param {function?} callback
	 * @param {number} signature
	 */
	function enqueueComponentUpdate (element, instance, callback, signature) {
		if (!element)
			return void requestAnimationFrame(function () {
				enqueueComponentUpdate(getComponentElement(instance), instance, callback, signature)
			})
	
		if (element.work === SharedWorkProcessing)
			return void requestAnimationFrame(function () {
				enqueueComponentUpdate(element, instance, callback, signature)
			})
	
		if (!element.active)
			instance.state = assign({}, instance.state, element.state)
		else if (element.id === SharedElementComponent)
			updateComponent(element, element, signature)
	
		if (callback)
			enqueueStateCallback(element, instance, callback)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {number} signature
	 */
	function enqueuePendingUpdate (element, snapshot, signature) {
		return function () {
			updateComponent(element, snapshot, signature)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} instance
	 * @param {(Object|function)} state
	 * @param {function?} callback
	 */
	function enqueueStateUpdate (element, instance, state, callback) {
		if (!state)
			return
	
		if (!element)
			return void requestAnimationFrame(function () {
				enqueueStateUpdate(instance[SymbolElement], instance, state, callback)
			})
	
		if (typeof state.then === 'function')
			return enqueueStatePromise(element, instance, state, callback)
	
		switch (typeof state) {
			case 'function':
				return enqueueStateUpdate(element, instance, enqueueStateCallback(element, instance, state), callback)
			case 'object':
				element.state = state
		}
	
		enqueueComponentUpdate(element, instance, callback, SharedComponentStateUpdate)
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} instance
	 * @param {Promise} state
	 * @param {function?} callback
	 */
	function enqueueStatePromise (element, instance, state, callback) {
		state.then(function (value) {
			requestAnimationFrame(function () {
				enqueueStateUpdate(element, instance, value, callback)
			})
		}).catch(function (err) {
			invokeErrorBoundary(element, err, SharedSiteAsync+':'+SharedSiteSetState, SharedErrorActive)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} instance
	 * @param {function} callback
	 */
	function enqueueStateCallback (element, instance, callback) {
		try {
			if (typeof callback === 'function')
				return callback.call(instance, instance.state, instance.props, instance.context)
		} catch (err) {
			invokeErrorBoundary(element, err, SharedSiteSetState+':'+SharedSiteCallback, SharedErrorActive)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {function} owner
	 * @return {Component}
	 */
	function getComponentInstance (element, owner) {
		try {
			return new owner(element.props, element.context)
		} catch (err) {
			invokeErrorBoundary(element, err, SharedSiteConstructor, SharedErrorActive)
		}
	
		return new Component()
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} instance
	 * @return {Element}
	 */
	function getComponentChildren (element, instance) {
		try {
			return getElementDefinition(instance.render(instance.props, instance.state, element.context))
		} catch (err) {
			return getElementDefinition(invokeErrorBoundary(element, err, SharedSiteRender, SharedErrorActive))
		}
	}
	
	/**
	 * @param {Component} instance
	 * @return {Element?}
	 */
	function getComponentElement (instance) {
		return instance[SymbolElement]
	}
	
	/**
	 * @param {Element} element
	 * @param {Object} props
	 * @param {Object} state
	 * @param {Object} context
	 * @return {Object?}
	 */
	function getComponentContext (element, props, state, context) {
		return getLifecycleData(element, SharedGetChildContext, props, state, context) || context
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Object} props
	 * @param {Object} state
	 * @param {Object} context
	 * @return {Object?}
	 */
	function getLifecycleData (element, name, props, state, context) {
		try {
			return element.owner[name].call(element.instance, props, state, context)
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorActive)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @return {Promise?}
	 */
	function getLifecycleMount (element, name) {
		try {
			var state = element.owner[name].call(element.instance, element.active && getClientNode(element))
	
			if (name !== SharedComponentWillUnmount)
				getLifecycleReturn(element, state)
			else if (state && typeof state.then === 'function')
				return state
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorActive)
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
			var state = element.owner[name].call(element.instance, props, state, context)
	
			if (name === SharedComponentShouldUpdate)
				return state
	
			getLifecycleReturn(element, state)
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorActive)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Error} error
	 * @param {Object} info
	 */
	function getLifecycleBoundary (element, name, error, info) {
		try {
			getLifecycleReturn(element, element.owner[name].call(element.instance, error, info))
		} catch (err) {
			invokeErrorBoundary(element.host, err, SharedComponentDidCatch, SharedErrorActive)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Object?} state
	 */
	function getLifecycleReturn (element, state) {
		switch (typeof state) {
			case 'object':
			case 'function':
				enqueueStateUpdate(element, element.instance, state)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {function} callback
	 * @param {*} first
	 * @param {*} second
	 * @param {*} third
	 * @return {*?}
	 */
	function getLifecycleCallback (element, callback, first, second, third) {
		try {
			if (typeof callback === 'function')
				return callback.call(element.instance, first, second, third)
		} catch (err) {
			invokeErrorBoundary(element, err, SharedSiteCallback, SharedErrorPassive)
		}
	}
	
	/**
	 * @param {(Component|Node)?} value
	 * @param {*} key
	 * @param {Element} element
	 */
	function setComponentRefs (value, key, element) {
		if (key !== element.ref)
			delete this.refs[element.ref]
	
		this.refs[key] = value
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
		element.context = host.context
	
		switch (element.id) {
			case SharedElementComponent:
				element.work = SharedWorkMounting
	
				commitMount(mountComponentElement(element), sibling, parent, element, operation, signature)
				commitCreate(element)
	
				element.work = SharedWorkIdle
	
				if (element.ref)
					commitRefs(element, element.ref, SharedReferenceDispatch)
	
				if (element.owner[SharedComponentDidMount])
					getLifecycleMount(element, SharedComponentDidMount)
	
				return
			case SharedElementPromise:
				commitWillReconcile(element, element)
			case SharedElementPortal:
			case SharedElementFragment:
				setClientNode(element, element.id !== SharedElementPortal ? getClientNode(parent) : getClientPortal(element))
				commitChildren(element, sibling, host, operation, signature)
				commitCreate(element)
				return
			case SharedElementNode:
				element.xmlns = getClientType(element, parent.xmlns)
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
	
				if (element.id !== SharedElementNode)
					return
		}
	
		commitChildren(element, sibling, host, SharedMountAppend, signature)
		commitProps(element, getClientProps(element), SharedPropsMount)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {number} signature
	 */
	function commitDismount (element, parent, signature) {
		switch (element.id) {
			case SharedElementComponent:
				commitDismount(element.children, parent, -signature)
				unmountComponentElement(element)
			case SharedElementText:
			case SharedElementEmpty:
				break
			case SharedElementPortal:
				if (signature < SharedElementIntermediate && parent.id > SharedElementIntermediate)
					commitRemove(element, parent)
			default:
				var children = element.children
				var length = children.length
	
				while (length-- > 0)
					commitDismount(children = children.next, element, -signature)
		}
	
		if (element.ref)
			commitRefs(element, element.ref, SharedReferenceRemove)
	
		element.active = false
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {number} signature
	 */
	function commitUnmount (element, parent, signature) {
		if (signature > SharedElementIntermediate)
			commitDismount(element, parent, signature)
	
		if (element.id !== SharedElementComponent)
			return commitRemove(element, parent)
	
		if (element.state)
			return element.state = void element.state
				.then(commitWillUnmount(element, parent, element, SharedErrorPassive))
				.catch(commitWillUnmount(element, parent, element, SharedErrorActive))
	
		commitUnmount(element.children, parent, SharedElementIntermediate)
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
			return commitWillUnmount(element.children, parent, merge({}, host), signature)
	
		setClientNode(element, getClientNode(host))
	
		return function (err) {
			commitUnmount(element, parent, SharedMountRemove)
	
			if (signature === SharedErrorActive)
				invokeErrorBoundary(element.host, err, SharedSiteAsync+':'+SharedComponentWillUnmount, signature)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function commitWillReconcile (element, snapshot) {
		snapshot.type.then(function (value) {
			if (element.active)
				reconcileChildren(element, getElementModule(value))
		}).catch(function (err) {
			invokeErrorBoundary(element, err, SharedSiteAsync+':'+SharedSiteRender, SharedErrorActive)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {Element} parent
	 * @param {Element} host
	 */
	function commitReplace (element, snapshot, parent, host) {
		commitMount(snapshot, element, parent, host, SharedMountInsert, SharedMountCommit)
		commitUnmount(element, parent, SharedMountRemove)
	
		for (var key in snapshot)
			switch (key) {
				case 'DOM':
					merge(element[key], snapshot[key])
				case SharedSiblingNext:
				case SharedSiblingPrevious:
					break
				default:
					element[key] = snapshot[key]
			}
	}
	
	/**
	 * @param {Element} element
	 * @param {number} props
	 * @param {number} signature
	 */
	function commitProps (element, props, signature) {
		for (var key in props)
			switch (key) {
				case 'ref':
					commitRefs(element, props[key], signature)
				case 'key':
				case 'xmlns':
				case 'children':
					break
				default:
					if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.length > 2)
						commitEvents(element, key.substring(2).toLowerCase(), props[key])
					else
						setClientProps(element, key, props[key], element.xmlns)
			}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} type
	 * @param {(function|EventListener)} callback
	 */
	function commitEvents (element, type, callback) {
		if (!element.event)
			element.event = {}
	
		if (!element.event[type])
			setClientEvent(element, type)
	
		element.event[type] = callback
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
				if (signature === SharedReferenceRemove)
					return commitRefs(element, setComponentRefs, SharedReferenceRemove, callback)
				else
					return commitRefs(element, setComponentRefs, SharedReferenceDispatch, callback)
			case 'function':
				switch (signature) {
					case SharedReferenceRemove:
						return getLifecycleCallback(element.host, callback, element.ref = null, key, element)
					case SharedReferenceAssign:
						element.ref = callback
					case SharedReferenceDispatch:
						return getLifecycleCallback(element.host, callback, element.instance || getClientNode(element), key, element)
					case SharedReferenceReplace:
						commitRefs(element, callback, SharedReferenceRemove, key)
						commitRefs(element, callback, SharedReferenceAssign, key)
				}
				break
			default:
				commitRefs(element, element.ref === callback ? noop : element.ref, SharedReferenceRemove, key)
		}
	}
	
	/**
	 * @param {Element} element
	 */
	function commitCreate (element) {
		try {
			switch (element.active = true, element.id) {
				case SharedElementNode:
					return setClientNode(element, createClientElement(element))
				case SharedElementText:
					return setClientNode(element, createClientText(element))
				case SharedElementEmpty:
					return setClientNode(element, createClientEmpty(element))
				case SharedElementComponent:
					element.DOM = element.children.DOM
				case SharedElementPortal:
					break
				default:
					element.DOM = getElementBoundary(element, SharedSiblingNext).DOM
			}
		} catch (err) {
			return commitCreate(commitRebase(element, invokeErrorBoundary(element, err, SharedSiteElement, SharedErrorActive)))
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {Element}
	 */
	function commitRebase (element, snapshot) {
		return assign(element, snapshot, {
			key: element.key,
			prev: element.prev,
			next: element.next,
			host: element.host,
			parent: element.parent
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @return {boolean}
	 */
	function commitQuery (element, parent) {
		setClientNode(
			element,
			getClientQuery(
				element,
				parent,
				getElementSibling(element, parent, SharedSiblingPrevious),
				getElementSibling(element, parent, SharedSiblingNext)
			)
		)
	
		return element.active = !!getClientNode(element)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} value
	 */
	function commitText (element, value) {
		setClientText(element, value)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitRemove (element, parent) {
		if (parent.id < SharedElementPortal)
			return commitRemove(element, getElementParent(parent))
	
		if (element.id > SharedElementIntermediate)
			removeClientNode(element, parent)
		else
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
			case SharedElementComponent:
				return commitInsert(element, getElementDescription(sibling), parent)
			case SharedElementPortal:
				return commitInsert(element, getElementSibling(sibling, parent, SharedSiblingNext), parent)
			case SharedElementIntermediate:
				return commitAppend(element, parent)
		}
	
		switch (element.id) {
			case SharedElementNode:
			case SharedElementText:
			case SharedElementEmpty:
				return insertClientNode(element, sibling, parent)
			case SharedElementComponent:
				return commitInsert(getElementDescription(element), sibling, parent)
			case SharedElementPortal:
				return
		}
	
		element.children.forEach(function (children) {
			commitInsert(getElementDescription(children), sibling, parent)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitAppend (element, parent) {
	 if (parent.id < SharedElementPortal)
			return commitAppend(element, getElementParent(parent))
	
		switch (element.id) {
			case SharedElementNode:
			case SharedElementText:
			case SharedElementEmpty:
				return appendClientNode(element, parent)
			case SharedElementComponent:
				return commitAppend(getElementDescription(element), parent)
			case SharedElementPortal:
				return
		}
	
		element.children.forEach(function (children) {
			commitAppend(getElementDescription(children), parent)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function reconcileProps (element, snapshot) {
		commitProps(element, reconcileObject(element.props, element.props = snapshot.props), SharedPropsUpdate)
	}
	
	/**
	 * @param {Object} prevObject
	 * @param {Object} nextObject
	 * @return {Object?}
	 */
	function reconcileObject (prevObject, nextObject) {
		if (prevObject === nextObject)
			return
	
		var length = 0
		var delta = {}
	
		for (var key in prevObject)
			if (!hasOwnProperty.call(nextObject, key))
				delta[(++length, key)] = null
	
		for (var key in nextObject) {
			var next = nextObject[key]
			var prev = prevObject[key]
	
			if (next !== prev)
				if (typeof next !== 'object' || next === null)
					delta[(++length, key)] = next
				else if (next = reconcileObject(prev || {}, next))
					delta[(++length, key)] = next
		}
	
		if (length > 0)
			return delta
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function reconcileElement (element, snapshot) {
		if (element.id === SharedElementPromise && snapshot.id === SharedElementPromise)
			return commitWillReconcile(element, snapshot)
	
		if (element.key !== snapshot.key || element.type !== snapshot.type)
			return commitReplace(element, snapshot, element.parent, element.host)
	
		switch (element.id) {
			case SharedElementPortal:
			case SharedElementFragment:
				return reconcileChildren(element, snapshot)
			case SharedElementComponent:
				return updateComponent(element, snapshot, SharedComponentPropsUpdate)
			case SharedElementText:
				if (element.children !== snapshot.children)
					commitText(element, element.children = snapshot.children)
				break
			case SharedElementNode:
				reconcileChildren(element, snapshot)
				reconcileProps(element, snapshot)
		}
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
	
		// step 1, prefix/suffix
		outer: while (true) {
			while (oldHead.key === newHead.key) {
				reconcileElement(oldHead, newHead)
				++oldPos
				++newPos
	
				if (oldPos > oldEnd || newPos > newEnd)
					break outer
	
				oldHead = oldHead.next
				newHead = newHead.next
			}
			while (oldTail.key === newTail.key) {
				reconcileElement(oldTail, newTail)
				--oldEnd
				--newEnd
	
				if (oldPos > oldEnd || newPos > newEnd)
					break outer
	
				oldTail = oldTail.prev
				newTail = newTail.prev
			}
			break
		}
	
		// step 2, mount/remove
		if (oldPos > oldEnd++) {
			if (newPos <= newEnd++) {
				if (newEnd < newLength)
					signature = SharedMountInsert
				else if ((oldTail = children, oldLength > 0))
					newHead = newHead.next
	
				while (newPos++ < newEnd) {
					newHead = (oldHead = newHead).next
					commitMount(children.insert(oldHead, oldTail), oldTail, element, host, signature, SharedMountCommit)
				}
			}
		} else if (newPos > newEnd++) {
			if (newEnd === newLength && newLength > 0)
				oldHead = oldHead.next
	
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
					if (isValidElement(nextChild = prevMoved.next) && isValidElement(nextNodes[nextChild.key]))
						if (prevChild.key === oldChild.key)
							commitAppend(children.insert(children.remove(prevMoved), children), element)
						else if (nextChild !== oldChild)
							if (isValidElement(nextNodes[oldChild.key]) || nextChild.key !== oldChild.prev.key)
								commitInsert(children.insert(children.remove(prevMoved), oldChild), oldChild, element)
				} else if (prevChild.key !== prevMoved.prev.key) {
					if ((nextChild = nextChild.active ? nextChild : (nextMoved || oldChild)).key !== prevMoved.next.key)
						commitInsert(children.insert(children.remove(prevMoved), nextChild), nextChild, element)
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
			var callback = element.event[type]
			var host = element.host
			var instance = host.instance
			var owner = instance ? instance : element
			var props = owner.props
			var state = owner.state
			var context = owner.context
			var value
	
			if (!callback)
				return
	
			if (typeof callback === 'function') {
				value = callback.call(instance, event, props, state, context)
			} else if (typeof callback.handleEvent === 'function') {
				if (instance !== callback && callback[SymbolComponent] === SymbolComponent)
					host = getComponentElement(instance = callback)
	
				value = callback.handleEvent(event, props, state, context)
			}
	
			if (value && instance)
				getLifecycleReturn(host, value)
		} catch (err) {
			invokeErrorBoundary(host, err, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), SharedErrorPassive)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {*} err
	 * @param {string} from
	 * @param {number} signature
	 * @param {Element}
	 */
	function invokeErrorBoundary (element, err, from, signature) {
		return getElementDefinition(getErrorElement(element, getErrorException(element, err, from), from, signature))
	}
	
	/**
	 * @param {Element} element
	 * @param {Error} error
	 * @param {string} from
	 * @param {number} signature
	 * @return {Element?}
	 */
	function getErrorElement (element, error, from, signature) {
		if (signature === SharedErrorPassive)
			return reportErrorException(error)
	
		var host = element.host
		var owner = element.owner
		var instance = element.instance
		var caught = instance && !instance[SymbolError] && owner && owner[SharedComponentDidCatch]
	
		requestAnimationFrame(function () {
			if (element.active)
				recoverErrorBoundary(element, getElementDefinition(null))
		})
	
		if (caught) {
			element.work = SharedWorkProcessing
			getLifecycleBoundary(element, SharedComponentDidCatch, error, instance[SymbolError] = error)
			element.work = SharedWorkIdle
		}
	
		if (!caught && isValidElement(host) && element.id !== SharedElementIntermediate)
			return getErrorElement(host, error, from, signature)
	
		return getErrorElement(element, error, from, SharedErrorPassive)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function recoverErrorBoundary (element, snapshot) {
		reconcileElement(element.id === SharedElementComponent ? element.children : element, snapshot)
	}
	
	/**
	 * @param {Error} error
	 */
	function reportErrorException (error) {
		if (!error.defaultPrevented)
			printErrorException(error.inspect())
	}
	
	/**
	 * @param {(Error|string)} error
	 */
	function printErrorException (err) {
		if (typeof console !== 'undefined')
			return (console.error || console.log).call(console, err)
	
		if (typeof printErr === 'function')
			return printErr(err)
	}
	
	/**
	 * @param {*} value
	 * @return {Object}
	 */
	function getErrorDescription (value) {
		return {enumerable: true, configurable: true, value: value}
	}
	
	/**
	 * @param {Element} element
	 * @param {Error} error
	 * @param {string} from
	 */
	function getErrorException (element, error, from) {
		if (!(error instanceof Error))
			return getErrorException(element, new Error(error), from)
	
		var componentStack = ''
		var tabs = '    '
		var host = element
	
		while (host && host.type) {
			componentStack += tabs + '<' + getDisplayName(host.type) + '>\n'
			tabs += '  '
			host = host.host
		}
	
		var errorMessage = 'The above error occurred in `\n' + componentStack + '` from "' + from + '"'
		var errorStack = error.stack + '\n\n' + errorMessage
	
		return defineProperties(error, {
			errorLocation: getErrorDescription(from),
			errorStack: getErrorDescription(errorStack),
			errorMessage: getErrorDescription(errorMessage),
			componentStack: getErrorDescription(componentStack),
			defaultPrevented: getErrorDescription(false),
			preventDefault: getErrorDescription(function () {
				return !!defineProperty(error, 'defaultPrevented', getErrorDescription(true))
			}),
			inspect: getErrorDescription(function () {
				return errorStack
			})
		})
	}
	
	/**
	 * @param {(Component|Element|Node|Event)} element
	 * @return {Node}
	 */
	function findDOMNode (element) {
		if (!element)
			invariant(SharedSiteFindDOMNode, 'Expected to receive a component')
	
		if (isValidElement(getComponentElement(element)))
			return findDOMNode(getComponentElement(element))
	
		if (isValidElement(element) && element.active)
			return getClientNode(element)
	
		if (isValidClientEvent(element))
			return getClientTarget(element)
	
		if (isValidClientNode(element))
			return element
	
		invariant(SharedSiteFindDOMNode, 'Called on an unmounted component')
	}
	
	/**
	 * @param {string|function|Object|Element} type
	 * @return {function|Object}
	 */
	function createFactory (type) {
		if (typeof type === 'object' && type !== null && !isValidElement(type))
			return factory(window, type, require)
	
		return createElementFactory(type)
	}
	
	/**
	 * @param {string|function|Element} type
	 * @return {function}
	 */
	function createElementFactory (type) {
		return createElement.bind(null, type)
	}
	
	/**
	 * @param {Object?} type
	 * @param {function} value
	 * @return {function}
	 */
	function createClientFactory (type, value) {
		if (!config)
			return value
	
		if (typeof config[type] !== 'function')
			config[type] = value
	
		return config[type]
	}
	
	/**
	 * @type {Object}
	 */
	var Children = {
		toArray: childrenArray,
		forEach: childrenEach,
		map: childrenMap,
		filter: childrenFilter,
		find: childrenFind,
		count: childrenCount,
		only: childrenOnly
	}
	
	/**
	 * @param {*} children
	 * @return {Array}
	 */
	function childrenArray (children) {
		var array = []
	
		if (children == null)
			return array
		if (isValidElement(children) || typeof children !== 'object')
			return [children]
		if (isArray(children))
			return flatten(children, array)
		if (typeof children.next === 'function' || typeof children.forEach === 'function')
			each(children, function (element) {
				return array.push(element)
			})
		else if (typeof children[SymbolIterator] === 'function')
			return childrenArray(children[SymbolIterator]())
		else
			array.push(children)
	
		return flatten(array, [])
	}
	
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @param {*} thisArg
	 */
	function childrenEach (children, callback, thisArg) {
		if (children != null)
			childrenArray(children).forEach(callback, thisArg)
	}
	
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @return {Array}
	 */
	function childrenMap (children, callback, thisArg) {
		if (children != null)
			return childrenArray(children).map(callback, thisArg)
	
		return children
	}
	
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @param {*} thisArg
	 */
	function childrenFilter (children, callback, thisArg) {
		if (children != null)
			return childrenArray(children).filter(callback, thisArg)
	
		return children
	}
	
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @param {*} thisArg
	 */
	function childrenFind (children, callback, thisArg) {
		if (children != null)
			return find(childrenArray(children), callback, thisArg)
	
		return children
	}
	
	/**
	 * @param {*} children
	 * @return {number}
	 */
	function childrenCount (children) {
		return childrenArray(children).length
	}
	
	/**
	 * @param {*} children
	 * @return {Element}
	 */
	function childrenOnly (children) {
		if (isValidElement(children))
			return children
	
		invariant('Children.only', 'Expected to receive a single element')
	}
	
	/**
	 * @param {*} element
	 * @param {Node} container
	 * @param {function=} callback
	 */
	function render (element, container, callback) {
		if (!container)
			return render(element, getClientDocument(), callback)
	
		if (isValidClientHost(container))
			update(getClientHost(container), getElementDefinition(element), callback)
		else
			mount(element, createElementIntermediate(), container, callback, SharedMountCommit)
	}
	
	/**
	 * @param {*} element
	 * @param {Node} container
	 * @param {function=} callback
	 */
	function hydrate (element, container, callback) {
		if (!container)
			return hydrate(element, getClientDocument(), callback)
	
		mount(element, createElementIntermediate(), container, callback, SharedMountQuery)
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
	 * @param {Node} container
	 * @param {function} callback
	 * @param {number} signature
	 */
	function mount (element, parent, container, callback, signature) {
		if (!isValidElement(element))
			return mount(getElementDefinition(element), parent, container, callback, signature)
	
		if (!isValidClientNode(container))
			invariant(SharedSiteRender, 'Target container is not a DOM element')
	
		setClientNode(parent, container)
		setClientHost(element, container)
	
		if (signature === SharedMountCommit)
			setClientContent(parent, element)
	
		commitMount(element, element, parent, parent, SharedMountAppend, signature)
	
		if (callback)
			getLifecycleCallback(element, callback)
	}
	
	/**
	 * @param {Node} container
	 * @return {boolean}
	 */
	function unmountComponentAtNode (container) {
		return isValidClientHost(container) && !render(null, container)
	}
	
	/**
	 * @param {Element} element
	 * @param {Node} node
	 */
	function setDOMHost (element, node) {
		client.set(node, element)
	}
	
	/**
	 * @param {Element} element
	 * @param {Node} node
	 */
	function setDOMNode (element, node) {
		element.DOM = {node: node}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} children
	 */
	function setDOMContent (element, children) {
		getDOMNode(element).textContent = ''
	}
	
	/**
	 * @param {Element} element
	 * @param {string} value
	 */
	function setDOMText (element, value) {
		getDOMNode(element).nodeValue = value
	}
	
	/**
	 * @param {(EventListener|Element)} element
	 * @param {string} type
	 */
	function setDOMEvent (element, type) {
		getDOMNode(element).addEventListener(type, element, false)
	}
	
	/**
	 * @param {Element} element
	 * @param {Object} props
	 */
	function setDOMStyle (element, props) {
		for (var name in props) {
			var value = props[name]
	
			if (name.indexOf('-') < 0)
				getDOMNode(element).style[name] = value !== false && value !== undefined ? value : ''
			else
				getDOMNode(element).style.setProperty(name, value)
		}
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
				return setDOMAttribute(element, name, value, getDOMNode(element)[name] = '')
			default:
				getDOMNode(element)[name] = value
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {string} xmlns
	 */
	function setDOMAttribute (element, name, value, xmlns) {
		switch (value) {
			case null:
			case false:
			case undefined:
				if (xmlns)
					getDOMNode(element).removeAttributeNS(xmlns, name)
	
				return getDOMNode(element).removeAttribute(name)
			case true:
				return setDOMAttribute(element, name, '', xmlns)
			default:
				if (!xmlns)
					getDOMNode(element).setAttribute(name, value)
				else
					getDOMNode(element).setAttributeNS(xmlns, name, value)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {string} xmlns
	 */
	function setDOMProps (element, name, value, xmlns) {
		switch (name) {
			case 'className':
				if (!xmlns && value)
					return setDOMProperty(element, name, value)
			case 'class':
				return setDOMAttribute(element, 'class', value, '')
			case 'style':
				return typeof value === 'object' ? setDOMStyle(element, value) : setDOMAttribute(element, name, value, '')
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
				return getDOMNode(element)[value ? 'focus' : 'blur']()
			case 'width':
			case 'height':
				if (element.type === 'img')
					return setDOMAttribute(element, name, value, '')
		}
	
		switch (typeof value) {
			case 'object':
				return setDOMProperty(element, name, value && assign({}, getDOMNode(element)[name], value))
			case 'string':
			case 'number':
			case 'boolean':
				if (xmlns || !(name in getDOMNode(element)))
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
		if (getDOMNode(element)[name])
			element.children.forEach(function (children) {
				nodes.push(getDOMNode(children))
			})
	
		if (getDOMNode(element)[name] = value)
			nodes.push.apply(nodes, getDOMNode(element).childNodes)
	
		nodes.forEach(function (node) {
			getDOMNode(element).appendChild(node)
		})
	}
	
	/**
	 * @param {Node} node
	 * @return {Element}
	 */
	function getDOMHost (node) {
		return client.get(node)
	}
	
	/**
	 * @param {Element} element
	 * @return {Node}
	 */
	function getDOMNode (element) {
		return element.DOM.node
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
	 * @param {string} xmlns
	 */
	function getDOMType (element, xmlns) {
		switch (element.type) {
			case 'svg':
				return 'http://www.w3.org/2000/svg'
			case 'math':
				return 'http://www.w3.org/1998/Math/MathML'
			case 'foreignObject':
				return ''
		}
	
		return xmlns
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
	
		if (isValidDOMNode(element.type))
			return element.type
	
		return getDOMDocument()
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {Element} previous
	 * @param {Element} next
	 */
	function getDOMQuery (element, parent, previous, next) {
		var id = element.id
		var type = id > SharedElementNode ? '#text' : element.type.toLowerCase()
		var props = element.props
		var children = element.children
		var length = children.length
		var target = previous.active ? getDOMNode(previous).nextSibling : getDOMNode(parent).firstChild
		var sibling = target
		var node = null
	
		while (target) {
			if (target.nodeName.toLowerCase() === type) {
				if (id > SharedElementNode) {
					if (next.id > SharedElementNode)
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
	
				if (!(target = target.nextSibling) || next.type)
					break
			}
	
			if (id > SharedElementNode && length === 0) {
				target.parentNode.insertBefore((node = createDOMText(element)), target)
	
				if (!next.type)
					type = null
				else
					break
			}
	
			target = (sibling = target).nextSibling
			sibling.parentNode.removeChild(sibling)
		}
	
		if (node && !node.splitText)
			for (var attributes = node.attributes, i = attributes.length - 1; i >= 0; --i) {
				var name = attributes[i].name
	
				if (props[name] === undefined)
					node.removeAttribute(name)
			}
	
		return node
	}
	
	/**
	 * @param {Node} node
	 * @return {boolean}
	 */
	function isValidDOMHost (node) {
		return client.has(node)
	}
	
	/**
	 * @param {Node} node
	 * @param {boolean}
	 */
	function isValidDOMNode (node) {
		return !!(node && node.ELEMENT_NODE)
	}
	
	/**
	 * @param {Event} event
	 * @return {boolean}
	 */
	function isValidDOMEvent (event) {
		return !!(event && event.BUBBLING_PHASE)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function removeDOMNode (element, parent) {
		getDOMNode(parent).removeChild(getDOMNode(element))
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 */
	function insertDOMNode (element, sibling, parent) {
		getDOMNode(parent).insertBefore(getDOMNode(element), getDOMNode(sibling))
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function appendDOMNode (element, parent) {
		getDOMNode(parent).appendChild(getDOMNode(element))
	}
	
	/**
	 * @param {Element} element
	 * @return {Node}
	 */
	function createDOMElement (element) {
		if (element.xmlns)
			return document.createElementNS(element.xmlns, element.type)
	
		return document.createElement(element.type)
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
	
	var client = new WeakMap()
	
	var setClientHost = createClientFactory('setHost', setDOMHost)
	var setClientNode = createClientFactory('setNode', setDOMNode)
	var setClientContent = createClientFactory('setContent', setDOMContent)
	var setClientText = createClientFactory('setText', setDOMText)
	var setClientEvent = createClientFactory('setEvent', setDOMEvent)
	var setClientProps = createClientFactory('setProps', setDOMProps)
	
	var getClientHost = createClientFactory('getHost', getDOMHost)
	var getClientNode = createClientFactory('getNode', getDOMNode)
	var getClientDocument = createClientFactory('getDocument', getDOMDocument)
	var getClientTarget = createClientFactory('getTarget', getDOMTarget)
	var getClientType = createClientFactory('getType', getDOMType)
	var getClientProps = createClientFactory('getProps', getDOMProps)
	var getClientPortal = createClientFactory('getPortal', getDOMPortal)
	var getClientQuery = createClientFactory('getQuery', getDOMQuery)
	
	var isValidClientHost = createClientFactory('isValidHost', isValidDOMHost)
	var isValidClientNode = createClientFactory('isValidNode', isValidDOMNode)
	var isValidClientEvent = createClientFactory('isValidEvent', isValidDOMEvent)
	
	var removeClientNode = createClientFactory('removeNode', removeDOMNode)
	var insertClientNode = createClientFactory('insertNode', insertDOMNode)
	var appendClientNode = createClientFactory('appendNode', appendDOMNode)
	
	var createClientElement = createClientFactory('createElement', createDOMElement)
	var createClientText = createClientFactory('createText', createDOMText)
	var createClientEmpty = createClientFactory('createEmpty', createDOMEmpty)
	
	exports.render = render
	exports.hydrate = hydrate
	exports.Component = Component
	exports.Fragment = SymbolFragment
	exports.PureComponent = PureComponent
	exports.Children = Children
	exports.findDOMNode = findDOMNode
	exports.unmountComponentAtNode = unmountComponentAtNode
	exports.createFactory = createFactory
	exports.cloneElement = cloneElement
	exports.isValidElement = isValidElement
	exports.createPortal = createPortal
	exports.createElement = createElement
	exports.h = createElement
	
	if (typeof require === 'function')
		(function () {
			try {
				require('./cjs')(exports, Element, getComponentChildren, getComponentElement, getElementDefinition, mountComponentElement, invokeErrorBoundary)
			} catch (err) {
				/* istanbul ignore next */
				printErrorException(err)
				/* istanbul ignore next */
				printErrorException('Something went wrong trying to import the server module')
			}
		}())
	
	if (typeof config === 'object' && typeof config.createExport === 'function') {
		return config.createExport(exports, Element, getComponentChildren, getComponentElement, getElementDefinition, mountComponentElement, invokeErrorBoundary) || exports
	}
	
	return exports
}

/* istanbul ignore next */
if (typeof exports === 'object' && typeof module === 'object' && module !== null) {
	if (typeof __webpack_require__ === 'undefined' && typeof require === 'function' && global.global === global && global.process) {
		module.exports = factory(global, undefined, require)
	} else {
		module.exports = factory(global)
	}
} else if (typeof define === 'function' && define.amd) {
	define(factory(global))
} else {
	global.dio = factory(global)
}
})(/* istanbul ignore next */typeof window === 'object' ? window : (typeof global === 'object' ? global : this));
