/*! DIO 8.0.0 @license MIT */

var dio = (function (global) {'use strict'/* eslint-disable */

function factory (window, require, define) {

	var version = '8.0.0'
	
	var SharedElementPromise = -3
	var SharedElementFragment = -2
	var SharedElementPortal = -1
	var SharedElementIntermediate = 0
	var SharedElementComponent = 1
	var SharedElementNode = 2
	var SharedElementText = 3
	var SharedElementEmpty = 4
	var SharedElementContainer = 5
	
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
	
	var SharedWorkMounting = -1
	var SharedWorkIdle = 0
	var SharedWorkProcessing = 1
	
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
	
	var SharedTypeKey = '.'
	var SharedTypeEmpty = '#empty'
	var SharedTypeText = '#text'
	var SharedTypeFragment = '#fragment'
	
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
	List.prototype = {
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
			for (var i = 0, node = this; i < this.length; ++i)
				callback(node = node.next, i)
		}
	}
	
	/**
	 * @constructor
	 */
	function WeakHash () {
		this.hash = ''
	}
	WeakHash.prototype = {
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
			if (array[i] instanceof Array)
				flatten(array[i], output)
			else
				output.push(array[i])
	
		return output
	}
	
	/**
	 * @param {Iterable} iterable
	 * @param {function} callback
	 */
	function each (iterable, callback) {
		if (iterable.forEach)
			return iterable.forEach(callback)
	
		var value = iterable.next()
		var index = 0
	
		while (!value.done) {
			index = callback(value.value, index)
			value = iterable.next(value.value)
		}
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
		else
			return a !== a && b !== b
	}
	
	var Symbol = window.Symbol || function (d) {return 'Symbol('+d+')'}
	var WeakMap = window.WeakMap || WeakHash
	var Promise = window.Promise || noop
	
	var requestAnimationFrame = window.requestAnimationFrame || function (callback) { setTimeout(callback, 16) }
	var defineProperty = Object.defineProperty
	var defineProperties = Object.defineProperties
	var hasOwnProperty = Object.hasOwnProperty
	var SymbolIterator = Symbol.iterator || '@@iterator'
	var SymbolError = Symbol('Error')
	var SymbolElement = Symbol('Element')
	var SymbolComponent = Symbol('Component')
	var DOMMap = new WeakMap()
	
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
	 * @param {number} id
	 * @return {Element}
	 */
	function createElementDescription (id) {
		return new Element(id)
	}
	
	/**
	 * @param {*} content
	 * @param {*} key
	 * @return {Element}
	 */
	function createElementText (content, key) {
		var element = new Element(SharedElementText)
	
		element.type = SharedTypeText
		element.key = SharedTypeKey + key
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
		element.key = SharedTypeKey + key
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
	
		element.type = SharedTypeFragment
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
	 * @param {Iterable} iterable
	 * @param {Element} element
	 */
	function createElementIterable (iterable) {
		return createElementFragment(childrenArray(iterable))
	}
	
	/**
	 * @param {*} element
	 * @param {*} key
	 * @return {Element?}
	 */
	function createElementBranch (element, key) {
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
			return createElementIterable(element)
		if (typeof element[SymbolIterator] === 'function')
			return createElementBranch(element[SymbolIterator](), key)
		if (typeof element === 'function')
			return createElementBranch(element(), key)
	
		invariant(SharedSiteRender, 'Invalid element [object ' + getDisplayName(element) + ']')
	}
	
	/**
	 * @param {Element} element
	 * @return {boolean}
	 */
	function isValidElement (element) {
		return element instanceof Element
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
	
		if (key != null)
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
	
		switch ((element.type = type).constructor) {
			case Function:
				if (type.defaultProps)
					props = getDefaultProps(element, type, type.defaultProps, props)
			case String:
				break
			case Element:
				props = assign({}, type.props, (element.id = type.id, props))
				element.type = type.type
				break
			case Promise:
				element.id = SharedElementPromise
				setElementBoundary(children)
		}
	
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
					return setElementChildren(children, createElementBranch(element, index), index)
			}
		else
			children.insert(createElementEmpty(index), children)
	
		return index + 1
	}
	
	/**
	 * @param {List} children
	 */
	function setElementBoundary (children) {
		var head = createElementEmpty(SharedTypeKey)
		var tail = createElementEmpty(SharedTypeKey)
	
		head.xmlns = tail.xmlns = SharedTypeFragment
	
		children.insert(head, children.next)
		children.insert(tail, children)
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
	
		Object.defineProperty(type, 'defaultProps', {
			value: getDefaultProps(element, type, getLifecycleCallback(element, defaultProps), props)
		})
	
		return type.defaultProps
	}
	
	/**
	 * @param {(function|string)} type
	 * @return {string}
	 */
	function getDisplayName (type) {
		switch (typeof type) {
			case 'function':
				return getDisplayName(type.displayName || type.name)
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
	
		return createElementDescription(SharedElementIntermediate)
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
			return createElementEmpty(SharedTypeKey)
	
		switch (element.constructor) {
			case Element:
				return element
			case Array:
				return createElementFragment(element)
			case String:
			case Number:
				return createElementText(element, SharedTypeKey)
			default:
				return createElementBranch(element, SharedTypeKey)
		}
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
	 * @type {Object}
	 */
	var ComponentPrototype = {
		forceUpdate: {value: forceUpdate},
		setState: {value: setState}
	}
	
	/**
	 * @param {Object?} props
	 * @param {Object?} context
	 */
	function PureComponent (props, context) {
		Component.call(this, props, context)
	}
	PureComponent.prototype = Object.create(createComponent(Component.prototype), {
		shouldComponentUpdate: {value: shouldComponentUpdate}
	})
	
	/**
	 * @param {Object} prototype
	 * @return {Object}
	 */
	function createComponent (prototype) {
		defineProperty(defineProperties(prototype, ComponentPrototype), SymbolComponent, {value: SymbolComponent})
	
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
		var context = element.context || {}
		var prototype = owner.prototype
		var instance
		var children
	
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
		instance.props = element.props
		instance.context = context
	
		if (owner[SharedGetInitialState])
			if (element.state = instance.state = getLifecycleData(element, SharedGetInitialState))
				if (element.state.constructor === Promise) {
					if (element.work === SharedWorkMounting)
						enqueueStatePromise(element, instance, instance.state)
	
					children = null
				}
	
		if (!instance.state)
			instance.state = {}
	
		if (owner[SharedComponentWillMount] && element.work !== SharedWorkIdle)
			getLifecycleMount(element, SharedComponentWillMount)
	
		if (children !== null)
			children = getComponentChildren(element, instance)
		else
			children = getElementDefinition(children)
	
		if (owner[SharedGetChildContext])
			element.context = getComponentContext(element)
	
		return element.children = children
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {number} signature
	 */
	function updateComponent (element, snapshot, signature) {
		if (element.work !== SharedWorkIdle)
			return requestAnimationFrame(enqueuePendingUpdate(element, snapshot, signature))
	
		element.work = SharedWorkProcessing
	
		var instance = element.instance
		var owner = element.owner
		var nextContext = instance.context
		var prevProps = element.props
		var nextProps = snapshot.props
		var prevState = instance.state
		var nextState = signature === SharedComponentStateUpdate ? assign({}, prevState, element.state) : prevState
	
		if (owner[SharedGetChildContext])
			merge(element.context, getComponentContext(element))
	
		switch (signature) {
			case SharedComponentForceUpdate:
				break
			case SharedComponentPropsUpdate:
				if (owner[SharedComponentWillReceiveProps]) {
					getLifecycleUpdate(element, SharedComponentWillReceiveProps, nextProps, nextContext)
				}
			case SharedComponentStateUpdate:
				if (owner[SharedComponentShouldUpdate])
					if (!getLifecycleUpdate(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext))
						return void (element.work = SharedWorkIdle)
		}
	
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
			commitReference(element, snapshot.ref, SharedReferenceReplace)
	
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
	
		switch (state.constructor) {
			case Promise:
				return enqueueStatePromise(element, instance, state, callback)
			case Function:
				return enqueueStateUpdate(element, instance, enqueueStateCallback(element, instance, state), callback)
			default:
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
	 * @return {Object?}
	 */
	function getComponentContext (element) {
		return getLifecycleData(element, SharedGetChildContext) || element.context
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 */
	function getLifecycleData (element, name) {
		try {
			return element.owner[name].call(
				element.instance,
				element.instance.props,
				element.instance.state,
				element.instance.context
			)
		} catch (err) {
			invokeErrorBoundary(element, err, name, SharedErrorActive)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 */
	function getLifecycleMount (element, name) {
		try {
			var state = element.owner[name].call(element.instance, element.active && getDOMNode(element))
	
			if (name !== SharedComponentWillUnmount)
				getLifecycleReturn(element, state)
			else if (state instanceof Promise)
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
	function setComponentReference (value, key, element) {
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
	
				if (element.ref)
					commitReference(element, element.ref, SharedReferenceDispatch)
	
				if (element.owner[SharedComponentDidMount])
					getLifecycleMount(element, SharedComponentDidMount)
	
				element.work = SharedWorkIdle
				return
			case SharedElementPromise:
				commitWillReconcile(element, element)
			case SharedElementPortal:
			case SharedElementFragment:
				setDOMNode(element, element.id !== SharedElementPortal ? getDOMNode(parent) : getDOMPortal(element))
				commitChildren(element, sibling, host, operation, signature)
				commitCreate(element)
				return
			case SharedElementNode:
				element.xmlns = getDOMType(element, parent.xmlns)
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
		commitProperties(element, getDOMProps(element), SharedPropsMount)
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
			commitReference(element, element.ref, SharedReferenceRemove)
	
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
	
		setDOMNode(element, getDOMNode(host))
	
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
				reconcileChildren(element, createElementFragment(getElementDefinition(value)))
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
	 * @param {(function|string)?} callback
	 * @param {number} signature
	 * @param {*} key
	 */
	function commitReference (element, callback, signature, key) {
		switch (typeof callback) {
			case 'string':
				if (signature === SharedReferenceRemove)
					return commitReference(element, setComponentReference, SharedReferenceRemove, callback)
				else
					return commitReference(element, setComponentReference, SharedReferenceDispatch, callback)
			case 'function':
				switch (signature) {
					case SharedReferenceRemove:
						return getLifecycleCallback(element.host, callback, element.ref = null, key, element)
					case SharedReferenceAssign:
						element.ref = callback
					case SharedReferenceDispatch:
						return getLifecycleCallback(element.host, callback, element.instance || getDOMNode(element), key, element)
					case SharedReferenceReplace:
						commitReference(element, callback, SharedReferenceRemove, key)
						commitReference(element, callback, SharedReferenceAssign, key)
				}
				break
			default:
				commitReference(element, element.ref || noop, SharedReferenceRemove, key)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} type
	 * @param {(function|EventListener)} callback
	 */
	function commitEvent (element, type, callback) {
		if (!element.event)
			element.event = {}
	
		if (!element.event[type])
			setDOMEvent(element, type)
	
		element.event[type] = callback
	}
	
	/**
	 * @param {Element} element
	 * @param {number} props
	 * @param {number} signature
	 */
	function commitProperties (element, props, signature) {
		for (var key in props)
			switch (key) {
				case 'ref':
					commitReference(element, props[key], signature)
				case 'key':
				case 'xmlns':
				case 'children':
					break
				default:
					if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110)
						commitEvent(element, key.substring(2).toLowerCase(), props[key])
					else
						setDOMProperties(element, key, props[key], element.xmlns)
			}
	}
	
	/**
	 * @param {Element} element
	 */
	function commitCreate (element) {
		try {
			switch (element.active = true, element.id) {
				case SharedElementNode:
					return setDOMNode(element, createDOMElement(element))
				case SharedElementText:
					return setDOMNode(element, createDOMText(element))
				case SharedElementEmpty:
					return setDOMNode(element, createDOMEmpty(element))
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
		setDOMNode(
			element,
			getDOMQuery(
				element,
				parent,
				getElementSibling(element, parent, SharedSiblingPrevious),
				getElementSibling(element, parent, SharedSiblingNext)
			)
		)
	
		return element.active = !!getDOMNode(element)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} value
	 */
	function commitValue (element, value) {
		setDOMValue(element, value)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitRemove (element, parent) {
		if (parent.id < SharedElementPortal)
			return commitRemove(element, getElementParent(parent))
	
		if (element.id > SharedElementIntermediate)
			removeDOMNode(element, parent)
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
			else if (parent !== sibling.parent)
				if (!parent.active)
					return commitAppend(element, parent)
				else
					return
	
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
				return insertDOMNode(element, sibling, parent)
			case SharedElementComponent:
				return commitInsert(getElementDescription(element), sibling, parent)
		}
	
		element.children.forEach(function (children) {
			commitInsert(getElementDescription(children), sibling, element)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitAppend (element, parent) {
		if (parent.id < SharedElementIntermediate)
			if (parent.active)
				return commitInsert(element, getElementBoundary(parent, SharedSiblingPrevious), parent)
			else if (parent.id < SharedElementPortal)
				return commitAppend(element, getElementParent(parent))
	
		switch (element.id) {
			case SharedElementNode:
			case SharedElementText:
			case SharedElementEmpty:
				return appendDOMNode(element, parent)
			case SharedElementComponent:
				return commitAppend(getElementDescription(element), parent)
		}
	
		element.children.forEach(function (children) {
			commitAppend(getElementDescription(children), element)
		})
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
	function reconcileProperties (element, snapshot) {
		commitProperties(element, reconcileObject(element.props, element.props = snapshot.props), SharedPropsUpdate)
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
					commitValue(element, element.children = snapshot.children)
				break
			case SharedElementNode:
				reconcileChildren(element, snapshot)
				reconcileProperties(element, snapshot)
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
	
		// step 2, insert/append/remove
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
			reconcileSiblings(element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd)
		}
	}
	
	/**
	 * @param  {Element} element
	 * @param  {Element} host
	 * @param  {List} children
	 * @param  {Element} oldHead
	 * @param  {Element} newHead
	 * @param  {number} oldPos
	 * @param  {number} newPos
	 * @param  {number} oldEnd
	 * @param  {number} newEnd
	 */
	function reconcileSiblings (element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd) {
		var oldIndex = oldPos
		var newIndex = newPos
		var oldChild = oldHead
		var newChild = newHead
		var oldNext = oldHead
		var newNext = newHead
		var newHash = ''
		var oldSize = 0
		var oldPool = {}
	
		// step 3, hashmap
		while (oldIndex < oldEnd)
			if (oldChild.key !== newChild.key) {
				oldPool[oldChild.key] = oldChild
				oldChild = oldChild.next
				++oldSize
				++oldIndex
			} else {
				reconcileElement(oldChild, newChild)
				oldChild = oldChild.next
				newChild = newChild.next
				++oldIndex
				++newIndex
			}
	
		// step 4, insert/append
		while (newIndex++ < newEnd) {
			newHash = newChild.key
			newNext = newChild.next
			oldNext = oldPool[newHash]
	
			if (oldNext) {
				if (oldChild === children)
					commitAppend(children.insert(children.remove(oldNext), oldChild), element)
				else
					commitInsert(children.insert(children.remove(oldNext), oldChild), oldChild, element)
	
				reconcileElement(oldNext, newChild)
	
				delete oldPool[(--oldSize, newHash)]
			} else if (oldChild === children)
				commitMount(children.insert(newChild, oldChild), newChild, element, host, SharedMountAppend, SharedMountCommit)
			else
				commitMount(children.insert(newChild, oldChild), oldChild, element, host, SharedMountInsert, SharedMountCommit)
	
			newChild = newNext
		}
	
		// step 5, remove
		if (oldSize > 0)
			for (newHash in oldPool)
				commitUnmount(children.remove(oldPool[newHash]), element, SharedMountRemove)
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
			var props
			var state
			var context
			var value
	
			if (!callback)
				return
	
			if (instance) {
				props = instance.props
				state = instance.state
				context = instance.context
			}
	
			if (typeof callback === 'function')
				value = callback.call(instance, event, props, state, context)
			else if (typeof callback.handleEvent === 'function')
				value = callback.handleEvent(event, props, state, context)
	
			if (value && instance)
				getLifecycleReturn(host, value)
		} catch (err) {
			invokeErrorBoundary(host, err, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), SharedErrorPassive)
		}
	}
	
	defineProperty(Element.prototype, 'handleEvent', {value: handleEvent})
	
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
	
		if (!caught && isValidElement(host) && element.id !== SharedElementContainer)
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
			console.error(error.inspect())
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
	 * @type {Object}
	 */
	var Children = {
		toArray: childrenArray,
		forEach: childrenEach,
		count: childrenCount,
		only: childrenOnly,
		map: childrenMap
	}
	
	/**
	 * @param {*} children
	 * @return {Array}
	 */
	function childrenArray (children) {
		var array = []
	
		if (children == null)
			return array
		else if (isValidElement(children) || typeof children !== 'object')
			return [children]
		else if (children instanceof Array)
			return flatten(children, array)
		else if (typeof children.next === 'function' || typeof children.forEach === 'function')
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
			return render(element, getDOMDocument(), callback)
	
		if (DOMMap.has(container))
			update(DOMMap.get(container), getElementDefinition(element), callback)
		else
			mount(element, createElementDescription(SharedElementContainer), container, callback, SharedMountCommit)
	}
	
	/**
	 * @param {*} element
	 * @param {Node} container
	 * @param {function=} callback
	 */
	function hydrate (element, container, callback) {
		if (!container)
			return hydrate(element, getDOMDocument(), callback)
	
		mount(element, createElementDescription(SharedElementContainer), container, callback, SharedMountQuery)
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
	
		if (!isValidDOMNode(container))
			invariant(SharedSiteRender, 'Target container is not a DOM element')
	
		DOMMap.set(container, element)
	
		setDOMNode(parent, container)
	
		if (signature === SharedMountCommit)
			initDOMRoot(parent)
	
		commitMount(element, element, parent, parent, SharedMountAppend, signature)
	
		if (callback)
			getLifecycleCallback(element, callback)
	}
	
	/**
	 * @param {Node} container
	 * @return {boolean}
	 */
	function unmountComponentAtNode (container) {
		return DOMMap.has(container) && !render(null, container)
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
			return getDOMNode(element)
	
		if (isValidDOMEvent(element))
			return element.currentTarget
	
		if (isValidDOMNode(element))
			return element
	
		invariant(SharedSiteFindDOMNode, 'Called on an unmounted component')
	}
	
	/**
	 * @param {Element} element
	 */
	function initDOMRoot (element) {
		getDOMNode(element).textContent = ''
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
	 * @param {(string|number)} value
	 */
	function setDOMValue (element, value) {
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
	function setDOMProperties (element, name, value, xmlns) {
		switch (name) {
			case 'className':
				if (!xmlns && value)
					return setDOMProperty(element, name, value)
			case 'class':
				return setDOMAttribute(element, 'class', value, '')
			case 'style':
				if (typeof value === 'object')
					return setDOMStyle(element, value)
				break
			case 'xlink:href':
				return setDOMAttribute(element, name, value, 'http://www.w3.org/1999/xlink')
			case 'innerHTML':
				return setDOMInnerHTML(element, name, value ? value : '', [])
			case 'dangerouslySetInnerHTML':
				return setDOMProperties(element, 'innerHTML', value && value.__html, xmlns)
			case 'acceptCharset':
				return setDOMProperties(element, 'accept-charset', value, xmlns)
			case 'httpEquiv':
				return setDOMProperties(element, 'http-equiv', value, xmlns)
			case 'tabIndex':
				return setDOMProperties(element, name.toLowerCase(), value, xmlns)
			case 'autofocus':
			case 'autoFocus':
				return getDOMNode(element)[value ? 'focus' : 'blur']()
			case 'width':
			case 'height':
				if (element.type === 'img')
					break
			default:
				if (!xmlns && name in getDOMNode(element))
					return setDOMProperty(element, name, value)
		}
	
		switch (typeof value) {
			case 'object':
			case 'function':
				return setDOMProperty(element, name, value)
			default:
				setDOMAttribute(element, name, value, '')
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
	 * @return {Node}
	 */
	function getDOMDocument () {
		return document.documentElement
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
	function getDOMNode (element) {
		return element.DOM.node
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
						target.splitText(length)
	
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
	 * @param {Node} target
	 * @param {boolean}
	 */
	function isValidDOMNode (target) {
		return !!(target && target.ELEMENT_NODE)
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
		else
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
	
	var exports = {
		version: version,
		render: render,
		hydrate: hydrate,
		Component: Component,
		PureComponent: PureComponent,
		Children: Children,
		findDOMNode: findDOMNode,
		unmountComponentAtNode: unmountComponentAtNode,
		cloneElement: cloneElement,
		isValidElement: isValidElement,
		createPortal: createPortal,
		createElement: createElement,
		h: window.h = createElement
	}
	
	return exports
}

var temp

/* istanbul ignore next */
if (typeof exports === 'object' && typeof module !== 'undefined')
	module.exports = factory(global, typeof __webpack_require__ === 'undefined' && require, './node')
else if (typeof define === 'function' && define.amd)
	define(temp = factory(global, false, ''))
else
	temp = factory(global, false, '')

return temp
})(/* istanbul ignore next */typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this))

export default dio
export const version = dio.version 
export const render = dio.render 
export const hydrate = dio.hydrate 
export const Component = dio.Component 
export const PureComponent = dio.PureComponent 
export const Children = dio.Children 
export const findDOMNode = dio.findDOMNode 
export const unmountComponentAtNode = dio.unmountComponentAtNode 
export const cloneElement = dio.cloneElement 
export const isValidElement = dio.isValidElement 
export const createPortal = dio.createPortal 
export const createElement = dio.createElement 
export const h = dio.createElement
