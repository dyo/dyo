/*! DIO 8.0.0 @license MIT */
(function (factory) {
	/* eslint-disable */
	if (typeof exports === 'object' && typeof module !== 'undefined')
		factory(exports, global, typeof __webpack_require__ === 'undefined' ? require : 0)
	else
		factory(window.dio = {}, window, 0)
}(function (exports, window, require) {
	/* eslint-disable */
	
	'use strict'

	var version = '8.0.0'

	var SharedElementPromise = -3
	var SharedElementFragment = -2
	var SharedElementPortal = -1
	var SharedElementIntermediate = 0
	var SharedElementComponent = 1
	var SharedElementNode = 2
	var SharedElementText = 3
	
	var SharedReferenceRemove = -1
	var SharedReferenceAssign = 0
	var SharedReferenceDispatch = 1
	var SharedReferenceReplace = 2
	
	var SharedComponentForceUpdate = 0
	var SharedComponentPropsUpdate = 1
	var SharedComponentStateUpdate = 2
	
	var SharedMountClone = 0
	var SharedMountCommit = 1
	var SharedMountRemove = 2
	var SharedMountAppend = 3
	var SharedMountInsert = 4
	var SharedMountReplace = 5
	
	var SharedWorkTask = 0
	var SharedWorkSync = 1
	
	var SharedErrorPassive = 0
	var SharedErrorActive = 1
	
	var SharedPropsMount = 1
	var SharedPropsUpdate = 2
	
	var SharedSiblingElement = 1
	var SharedSiblingChildren = 2
	
	var SharedSiteCallback = 'callback'
	var SharedSiteRender = 'render'
	var SharedSiteConstructor = 'constructor'
	var SharedSiteAsync = 'async'
	var SharedSiteSetState = 'setState'
	var SharedSiteFindDOMNode = 'findDOMNode'
	
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
	
	var Symbol = window.Symbol || function (d) {return 'Symbol('+d+')'}
	var WeakMap = window.WeakMap || WeakHash
	var Promise = window.Promise || noop
	
	var root = new WeakMap()
	var document = window.document || noop
	var requestAnimationFrame = window.requestAnimationFrame || function(c) {setTimeout(c, 16)}
	var defineProperty = Object.defineProperty
	var defineProperties = Object.defineProperties
	
	var SymbolIterator = Symbol.iterator || Symbol('Iterator')
	var SymbolElement = Symbol('Element')
	var SymbolComponent = Symbol('Component')
	
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
		 * @param {Element} element
		 * @param {Element} sibling
		 * @return {Element}
		 */
		insert: function insert (element, sibling) {
			element.next = sibling
			element.prev = sibling.prev
			sibling.prev.next = element
			sibling.prev = element
			this.length++
			
			return element
		},
		/**
		 * @param {Element} element
		 * @return {Element}
		 */
		remove: function remove (element) {
			if (this.length < 1) 
				return
			
			element.next.prev = element.prev
			element.prev.next = element.next
			this.length--
			
			return element
		},
		/**
		 * @return {Element}
		 */
		pop: function pop () {
			return this.remove(this.prev)
		},
		/**
		 * @param {Element} element
		 * @return {Element}
		 */
		push: function push (element) {
			return this.insert(element, this)
		},
		/**
		 * @param {function} callback
		 */
		forEach: function forEach (callback) {
			for (var i = 0, element = this; i < this.length; ++i)
				callback.call(this, element = element.next, i)
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
		for (var i = 0; i < array.length; ++i) {
			if (array[i] instanceof Array)
				flatten(array[i], output)
			else
				output.push(array[i])
		}
		
		return output
	}
	
	/**
	 * @param {Iterable} iterable
	 * @param {function} callback
	 */
	function each (iterable, callback) {
		var value = iterable.next()
		var index = 0
	
		while (value.done !== true) {
			index = callback(value.value, index)|0
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
	  for (var i in a)
	  	if (a[i] !== b[i]) 
	  		return true
	  
	  for (var i in b) 
	  	if (a[i] !== b[i]) 
	  		return true
	  
	  return false
	}
	
	/**
	 * @constructor
	 * @param {number} id
	 */
	function Element (id) {
		this.id = id
		this.work = SharedWorkSync
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
		this.event = null
		this.DOM = null
		this.context = null
		this.parent = null
		this.host = null
		this.next = null
		this.prev = null
	}
	
	/**
	 * @param {*} content
	 * @return {Element}
	 */
	function elementText (content) {
		var element = new Element(SharedElementText)
	
		element.type = '#text'
		element.children = content
	
		return element
	}
	
	/**
	 * @param {DOM} node
	 * @return {Element}
	 */
	function elementIntermediate (node) {
		var element = new Element(SharedElementIntermediate)
	
		element.DOM = node
	
		return element
	}
	
	/**
	 * @param {(Element|Array)} fragment
	 * @return {Element}
	 */
	function elementFragment (fragment) {
		var element = new Element(SharedElementFragment)
		var children = new List()
		var i = 0
	
		element.type = '#fragment'
		element.children = children
	
		if (isValidElement(fragment))
			elementChildren(element, children, fragment, i)
		else if (Array.isArray(fragment))
			for (; i < fragment.length; ++i)
				elementChildren(element, children, fragment[i], i)				
	
		return element
	}
	
	/**
	 * @param {Iterable} iterable
	 * @param {Element} element
	 */
	function elementIterable (iterable, element) {	
		var index = 0
	
		each(iterable, function (value, index) {
			return elementChildren(element, element.children, value, index)
		})
	
		return element
	}
	
	/**
	 * @param {*} element
	 * @return {Element}
	 */
	function elementUnknown (element) {
		if (typeof element.next === 'function')
			return elementIterable(element, elementFragment(element))
		if (typeof element[SymbolIterator] === 'function')
			return elementUnknown(element[SymbolIterator]())
		else if (typeof element === 'function')
			return elementUnknown(element())
		else if (element instanceof Error)
			return createElement('details', createElement('summary', element+''), h('pre', element.report || element.stack))
		else if (element instanceof Date)
			return elementText(element)
	
		invariant(SharedSiteRender, 'Invalid element [object '+getDisplayName(element)+']')
	}
	
	/**
	 * @param {Element} element
	 * @param {string} direction
	 * @return {Element}
	 */
	function elementSibling (element, direction) {
		if (isValidElement(element[direction]))
			return element[direction]
	
		if (getHostElement(element.host) === element)
			return elementSibling(element.host, direction)
	
		return element
	}
	
	/**
	 * @param {Element} parent
	 * @param {List} children
	 * @param {*} element
	 * @param {number} index
	 */
	function elementChildren (parent, children, element, index) {
		if (element == null)
			return elementChildren(parent, children, elementText(''), index)
	
		switch (element.constructor) {
			case Element:
				if (element.key == null)
					element.key = '0|'+index
				else if (parent.keyed === false)
					parent.keyed = true
	
				children.push(element)
				break
			case Array:
				for (var i = 0; i < element.length; ++i)
					elementChildren(parent, children, element[i], index + i)
	
				return index + i
			case String:
			case Number:
				return elementChildren(parent, children, elementText(element), index)
			case Function:
			case Promise:
				return elementChildren(parent, children, createElement(element), index)
			case Boolean:
				return elementChildren(parent, children, null, index)
			default:
				return elementChildren(parent, children, elementUnknown(element), index)
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
								props.children = void elementChildren(element, children, props.children, index)
						}
	
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
			if (id !== SharedElementComponent)
				for (; i < length; ++i)
					index = elementChildren(element, children, arguments[i], index)
			else {
				if (size > 1)
					for (children = Array(size); i < length; ++i)
						children[index++] = arguments[i]
				else
					children = arguments[i]
	
				element.props.children = children
			}
		}	
	
		switch ((element.children = children, element.type = type).constructor) {
			case Function:
				if (type.defaultProps)
					element.props = getDefaultProps(element, type.defaultProps, props)
			case String:
				break
			case Element:
				element.id = type.id
				element.type = type.type
				element.props = assign({}, type.props, element.props)						
				break
			case Promise:
				element.id = SharedElementPromise
				break
			default:
				if (DOMValid(type))
					element.id = SharedElementPortal
		}
	
		return element
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
	
		if (!prototype.hasOwnProperty(SharedSiteRender))
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
		enqueueState(this[SymbolElement], this, state, callback)
	}
	
	/**
	 * @param {function} callback
	 */
	function forceUpdate (callback) {
		enqueueUpdate(this[SymbolElement], this, callback, SharedComponentForceUpdate)
	}
	
	/**
	 * @param {Element} element
	 * @return {number}
	 */
	function componentMount (element) {
		var owner = element.type
		var context = element.context || {}
		var prototype = owner.prototype
		var instance
		var children
	
		if (prototype && prototype.render) {
			if (prototype[SymbolComponent] !== SymbolComponent)
				createComponent(prototype)
	
			instance = owner = getChildInstance(element, owner)
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
			instance.state = getInitialState(element, instance, getLifecycleData(element, SharedGetInitialState))
		else if (!instance.state)
			instance.state = {}
	
		if (owner[SharedComponentWillMount] && element.work === SharedWorkTask) 
			getLifecycleMount(element, SharedComponentWillMount)
		
		children = element.children = getChildElement(element)
	
		if (owner[SharedGetChildContext])
			element.context = getChildContext(element)
	
		return children
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {number} signature
	 */
	function componentUpdate (element, snapshot, signature) {
		if (element.work === SharedWorkTask)
			return
	
		element.work = SharedWorkTask
	
		var instance = element.instance
		var owner = element.owner
		var nextContext = instance.context
		var prevProps = element.props
		var nextProps = snapshot.props
		var prevState = instance.state
		var nextState = signature === SharedComponentStateUpdate ? assign({}, prevState, element.state) : prevState
	
		if (owner[SharedGetChildContext])
			merge(element.context, getChildContext(element))
	
		switch (signature) {
			case SharedComponentForceUpdate:
				break
			case SharedComponentPropsUpdate:
				if (owner[SharedComponentWillReceiveProps]) {
					getLifecycleUpdate(element, SharedComponentWillReceiveProps, nextProps, nextContext)
				}
			case SharedComponentStateUpdate:
				if (owner[SharedComponentShouldUpdate])
					if (getLifecycleUpdate(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext) === false)
						return void (element.work = SharedWorkSync)
		}
	
		if (owner[SharedComponentWillUpdate])
			getLifecycleUpdate(element, SharedComponentWillUpdate, nextProps, nextState, nextContext)
	
		instance.state = nextState
		instance.props = nextProps
	
		reconcileElement(element.children, getChildElement(element))
	
		if (owner[SharedComponentDidUpdate])
			getLifecycleUpdate(element, SharedComponentDidUpdate, prevProps, prevState, nextContext)
	
		if (element.ref !== snapshot.ref)
			commitReference(element, snapshot.ref, SharedReferenceReplace)
	
		element.work = SharedWorkSync
	}
	
	/**
	 * @param {Element} element
	 * @param {List} children
	 * @param {Element} parent
	 * @param {number} signature
	 */
	function componentUnmount (element, children, parent, signature) {
		if (element.owner[SharedComponentWillUnmount])
			if (element.state = getLifecycleMount(element, SharedComponentWillUnmount))
				if (element.state.constructor === Promise)
					return !!element.state.then(function () {
						element.state = void commitUnmount(children, parent, signature)
					})
	
		commitUnmount(children, parent, signature)
	}
	
	/**
	 * @param {(Component|Node)?} value
	 * @param {*} key
	 * @param {Element} element
	 */
	function componentReference (value, key, element) {
		if (this.refs) {
			if (key !== element.ref)
				delete this.refs[element.ref]
	
			this.refs[key] = value
		}
	}
	
	/**
	 * @param {Element} Element
	 * @param {Component} instance
	 * @param {(Object|function)} state
	 * @param {function?} callback
	 */
	function enqueueState (element, instance, state, callback) {
		if (state)
			switch (state.constructor) {
				case Promise:
					return enqueuePending(element, instance, state, callback)
				case Function:
					return enqueueState(element, instance, enqueueCallback(element, instance, state), callback)
				default:
					if (element.work !== SharedWorkSync && !element.DOM)
						return void assign(instance.state, element.state, state)
					else
						element.state = state
	
					enqueueUpdate(element, instance, callback, SharedComponentStateUpdate)
			}
	}
	
	/**
	 * @param {Element} Element
	 * @param {Component} instance
	 * @param {function} callback
	 */
	function enqueueCallback (element, instance, callback) {
		try {
			return callback.call(instance, instance.state, instance.props)
		} catch (e) {
			errorBoundary(element, e, SharedSiteSetState+':'+SharedSiteCallback, SharedErrorActive)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} instance
	 * @param {Promise} state
	 * @param {function?} callback
	 */
	function enqueuePending (element, instance, state, callback) {
		state.then(function (value) {
			requestAnimationFrame(function () {
				enqueueState(element, instance, value, callback)
			})
		}).catch(function (e) {
			errorBoundary(element, e, SharedSiteAsync+':'+SharedSiteSetState, SharedErrorActive)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} instance
	 * @param {function=} callback
	 * @param {number} signature
	 */
	function enqueueUpdate (element, instance, callback, signature) {
		if (!element)
			return void requestAnimationFrame(function () {
				enqueueUpdate(getHostChildren(instance), instance, callback, signature)
			})
	
		if (element.work === SharedWorkTask)
			return void requestAnimationFrame(function () {
				enqueueUpdate(element, instance, callback, signature)
			})
	
		if (!element.DOM)
			return
	
		componentUpdate(element, element, signature)
	
		if (typeof callback === 'function')
			enqueueCallback(element, instance, callback)
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} instance
	 * @param {Object} state
	 * @return {Object}
	 */
	function getInitialState (element, instance, state) {	
		if (state) {
			if (state.constructor !== Promise)
				return typeof state === 'object' ? state : Object(state)
			else
				enqueuePending(element, instance, state)
		}
	
		return instance.state || {}
	}
	
	/**
	 * @param {Element} element
	 * @param {function} owner
	 * @return {Component}
	 */
	function getChildInstance (element, owner) {
		try {
			return new owner(element.props, element.context)
		} catch (e) {
			errorBoundary(element, e, SharedSiteConstructor, SharedErrorActive)
		}
	
		return new Component()
	}
	
	/**
	 * @param {Element} element
	 * @return {Element}
	 */
	function getChildElement (element) {
		try {
			return commitElement(element.instance.render(element.instance.props, element.instance.state, element.context))
		} catch (e) {
			return commitElement(errorBoundary(element, e, SharedSiteRender, SharedErrorActive))
		}
	}
	
	/**
	 * @param {Element} element
	 * @return {Object?}
	 */
	function getChildContext (element) {
		if (element.owner[SharedGetChildContext])
			return getLifecycleData(element, SharedGetChildContext) || element.context || {}
		else
			return element.context || {}
	}
	
	/**
	 * @param {Element} element
	 * @return {Element}
	 */
	function getHostElement (element) {
		if (isValidElement(element) && element.id === SharedElementComponent)
			return getHostElement(element.children)
		else
			return element
	}
	
	/**
	 * @param  {(Element|Component)} element
	 * @return {Element?}
	 */
	function getHostChildren (element) {
		if (isValidElement(element))
			return element
		else
			return element[SymbolElement]
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
	 * @param {Element} element
	 * @param {string} name
	 */
	function getLifecycleData (element, name) {
		try {
			return element.owner[name].call(element.instance, element.props)
		} catch (e) {
			errorBoundary(element, e, name, SharedErrorActive)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 */
	function getLifecycleMount (element, name) {
		try {
			var state = element.owner[name].call(element.instance, element.DOM && findDOMNode(element))
			
			if (name === SharedComponentWillUnmount)
				return state
	
			getLifecycleReturn(element, state)
		} catch (e) {
			errorBoundary(element, e, name, SharedErrorActive)
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
		} catch (e) {
			errorBoundary(element, e, name, SharedErrorActive)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Object?} state
	 */
	function getLifecycleReturn (element, state) {
		switch (typeof state) {
			case 'object':
				if (!state)
					break
			case 'function':
				enqueueState(element, element.instance, state)
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
			return callback.call(element.instance, first, second, third)
		} catch (e) {
			errorBoundary(element, e, SharedSiteCallback, SharedErrorPassive)
		}
	}
	
	/**
	 * @param {(Component|Element|Node)} element
	 * @return {Node}
	 */
	function findDOMNode (element) {
		if (!element)
			invariant(SharedSiteFindDOMNode, 'Expected to receive a component')
	
		if (isValidElement(element[SymbolElement]))
			return findDOMNode(element[SymbolElement])
	
		if (isValidElement(element)) {
			if (element.id < SharedElementIntermediate)
				return findDOMNode(element.children.next)
			else if (element.DOM)
				return DOMTarget(element)
		}
	
		if (DOMValid(element))
			return element
	
		invariant(SharedSiteFindDOMNode, 'Called on an unmounted component')
	}
	
	/**
	 * @param {*} element
	 * @return {Element}
	 */
	function commitElement (element) {
		if (element != null)
			switch (element.constructor) {
				case Element:
					return element
				case Array:
					return elementFragment(element)
				case String:
				case Number:
					return elementText(element)
				case Function:
				case Promise:
					return createElement(element)
				case Boolean:
					break
				default:
					return elementUnknown(element)
			}
	
		return elementText('')
	}
	
	/**
	 * @param {Element} element
	 * @param {number} signature
	 * @return {Element}
	 */
	function commitSibling (element, signature) {
		if (!isValidElement(element))
			return elementIntermediate(DOM(null))
	
		if (signature < SharedElementIntermediate)
			return element.id < SharedElementIntermediate ? commitSibling(element, SharedSiblingChildren) : element
	
		if (signature === SharedSiblingElement)
			return commitSibling(element.next, -SharedSiblingElement)
	
		if (!element.children.length)
			return commitSibling(element.next, SharedSiblingChildren)
	
		return commitSibling(element.children.next, -SharedSiblingChildren)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function commitPromise (element, snapshot) {
		snapshot.type.then(function (value) {
			if (!element.DOM)
				return
	
			if (element.id === SharedElementPromise)
				reconcileChildren(element, elementFragment(commitElement(value)))
			else
				reconcileElement(element, commitElement(value))
		}).catch(function (e) {
			errorBoundary(element, e, SharedSiteAsync+':'+SharedSiteRender, SharedErrorActive)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {List} children
	 * @param {Element} host
	 * @param {number} signature
	 * @param {number} mode
	 */
	function commitChildren (element, children, host, signature, mode) {
		var length = children.length
		var sibling = children.next
		var next = sibling
	
		while (length-- > 0) {
			if (next.DOM) {
				sibling = next
				children.insert(next = merge(new Element(SharedElementNode), next), sibling)
				children.remove(sibling)
			}
	
			commitMount(next, element, element, host, signature, mode)
			next = next.next
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 * @param {Element} host
	 * @param {number} signature
	 * @param {number} mode
	 */
	function commitMount (element, sibling, parent, host, signature, mode) {
		element.host = host
		element.parent = parent
		element.context = host.context
	
	 	switch (element.id) {
	 		case SharedElementComponent:
	 			element.work = SharedWorkTask
	 			
	 			commitMount(componentMount(element), sibling, parent, element, signature, mode)
	 			element.DOM = element.children.DOM
	
	 			if (element.ref)
	 				commitReference(element, element.ref, SharedReferenceAssign)
	 			
	 			if (element.owner[SharedComponentDidMount])
	 				getLifecycleMount(element, SharedComponentDidMount)
	
	 			element.work = SharedWorkSync
	 			return
	 		case SharedElementPortal:
	 			element.DOM = DOM(element.type)
	 			break
	 		case SharedElementPromise:
	 			commitPromise(element, element)
	 		case SharedElementFragment:
	 			element.DOM = DOM(DOMTarget(parent))
	 			break
	 		case SharedElementNode:
	 			element.xmlns = DOMType(element.type, parent.xmlns)
	 		case SharedElementText:
	 			switch (mode) {
	 				case SharedMountClone:
	 					if (element.DOM = DOMFind(element, parent))
		 					break
	 				default:
	 					element.DOM = commitDOM(element)
	 					
	 					if (signature < SharedMountInsert)
	 						commitAppend(element, parent)
	 					else
	 						commitInsert(element, sibling, parent)
	 			}
	
	 			if (element.id === SharedElementText)
	 				return
	 	}
	
	 	commitChildren(element, element.children, host, SharedMountAppend, mode)
	 	commitProperties(element, element.props, SharedPropsMount)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {number} signature
	 */
	function commitUnmount (element, parent, signature) {
		if (element.id === SharedElementComponent)
			return componentUnmount(element, element.children, parent, signature)
	
		commitRemove(element, parent)
		commitDetach(element, signature)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {number} signature
	 */
	function commitReplace (element, snapshot, signature) {
		if (signature === SharedMountReplace && commitUnmount(element, element.parent, SharedMountReplace))
			return void element.state.then(function () {
				commitReplace(element, snapshot, SharedMountInsert)
			})
	
		commitMount(
			snapshot, 
			commitSibling(element, SharedSiblingElement), 
			element.parent, 
			element.host, 
			SharedMountInsert, 
			SharedMountCommit
		)
	
		for (var key in snapshot)
			switch (key) {
				case 'DOM':
					merge(element[key], snapshot[key])
				case 'next':
				case 'prev':
					break
				default:
					element[key] = snapshot[key]	
			}
	}
	
	/**
	 * @param {Element} element
	 * @param {number} signature
	 */
	function commitDetach (element, signature) {
		if (element.id !== SharedElementText) {
			var children = element.children
			var length = children.length
			var next = children.next
	
			while (length-- > 0)
				switch (next.id) {
					case SharedElementComponent:
						if (next.owner[SharedComponentWillUnmount])
							getLifecycleMount(next, SharedComponentWillUnmount)
					default:
						commitDetach(next, SharedMountAppend)
						next = next.next
				}
		}
	
		if (element.ref)
			commitReference(element, element.ref, SharedReferenceRemove)
	
		if (signature < SharedMountReplace) {
			element.context = null
			element.state = null
			element.event = null
			element.DOM = null
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
				return commitReference(element, componentReference, signature, callback)			
			case 'function':
				switch (signature) {
					case SharedReferenceRemove:
						return getLifecycleCallback(element.host, callback, element.ref = null, key, element)
					case SharedReferenceAssign:
						element.ref = callback
					case SharedReferenceDispatch:
						return getLifecycleCallback(element.host, callback, element.instance || DOMTarget(element), key, element)
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
			DOMEvent(element, type)
	
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
						DOMProperties(element, key, props[key], element.xmlns)
			}
	}
	
	/**
	 * @param {Element} element
	 * @return {Object}
	 */
	function commitDOM (element) {
		try {
			return element.id === SharedElementNode ? DOMElement(element) : DOMText(element)
		} catch (e) {
			return commitDOM(commitElement(errorBoundary(element, e, SharedSiteRender, SharedErrorActive)))
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {(string|number)} value
	 */
	function commitValue (element, value) {
		DOMValue(element, value)
	}
	
	/**
	 * @param {Element} element
	 */
	function commitContent (element) {
		DOMContent(element)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitRemove (element, parent) {
		if (element.id > SharedElementIntermediate)
			DOMRemove(element, parent)
		else
			element.children.forEach(function (children) {
				commitRemove(children, element.id < SharedElementPortal ? parent : element)
			})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 */
	function commitInsert (element, sibling, parent) {
		if (sibling.id < SharedElementIntermediate)
			return commitInsert(element, commitSibling(sibling, SharedSiblingChildren), parent)
	
		if (element.id > SharedElementIntermediate)
			DOMInsert(element, sibling, parent)
		else if (element.id < SharedElementPortal)
			element.children.forEach(function (children) {
				commitInsert(children, sibling, parent)
			})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitAppend (element, parent) {
		if (parent.id < SharedElementPortal)
			return commitInsert(element, commitSibling(parent, SharedSiblingElement), parent)
	
		if (element.id > SharedElementIntermediate)
			DOMAppend(element, parent)
		else if (element.id < SharedElementPortal)
			element.children.forEach(function (children) {
				commitAppend(children, parent)
			})
	}
	
	/**
	 * @param {Object} prevObject
	 * @param {Object} nextObject
	 * @return {Object?}
	 */
	function reconcileObject (prevObject, nextObject) {
		var length = 0
		var delta = {}
		var value
	
		for (var key in prevObject)
			if (nextObject[key] == null)
				delta[(length++, key)] = false
	
		for (var key in nextObject) {
			var next = nextObject[key]
			var prev = prevObject[key]
	
			if (next !== prev) {
				if (typeof next !== 'object' || next === null)
					delta[(length++, key)] = next
				else if (value = reconcileObject(prev || {}, next))
					delta[(length++, key)] = value
			}
		}
	
		if (length > 0)
			return delta
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function reconcileProperties (element, snapshot) {
		commitProperties(element, reconcileObject(element.props, snapshot.props), SharedPropsUpdate)
		element.props = snapshot.props
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function reconcileElement (element, snapshot) {
		if (element.id === SharedElementPromise && snapshot.id === SharedElementPromise)
			return commitPromise(element, snapshot)
	
		if (element.key !== snapshot.key || element.type !== snapshot.type)
			return commitReplace(element, snapshot, SharedMountReplace)
	
		switch (element.id) {
			case SharedElementPortal:
			case SharedElementFragment:
				return reconcileChildren(element, snapshot)
			case SharedElementComponent:
				return componentUpdate(element, snapshot, SharedComponentPropsUpdate)
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
		var host = element.host
		var children = element.children
		var siblings = snapshot.children
		var aLength = children.length
		var bLength = siblings.length
		var aHead = children.next
		var bHead = siblings.next
		var i = 0
	
		// batch-op/no-op
		switch (aLength+bLength) {
			case 0:
				return
			case aLength:
				return reconcileRemove(aHead, element, children, 0, aLength)
			case bLength:
				return reconcileInsert(bHead, bHead, element, host, children, 0, bLength, SharedMountAppend)
		}
	
		// non-keyed
		if (!snapshot.keyed) {
			i = aLength > bLength ? bLength : aLength
	
			while (i-- > 0) { 
				reconcileElement(aHead, bHead) 
				bHead = bHead.next
				aHead = aHead.next
			}
	
			if (aLength !== bLength)
				if (aLength > bLength)
					while (aLength > bLength)
						commitUnmount(children.pop(), element, (aLength--, 0))
				else
					while (aLength < bLength) {
						aHead = bHead
						bHead = bHead.next
						commitMount(children.push(aHead), aHead, element, host, SharedMountAppend, SharedMountCommit)
						aLength++
					}
			return
		}
	
		// keyed
		var aPos = 0
		var bPos = 0
		var aEnd = aLength - 1
		var bEnd = bLength - 1
		var aTail = children.prev
		var bTail = siblings.prev	
	
		// step 1, prefix/suffix
		outer: while (true) {
			while (aHead.key === bHead.key) {
				reconcileElement(aHead, bHead)
				aPos++
				bPos++
				
				if (aPos > aEnd || bPos > bEnd) 
					break outer
				
				aHead = aHead.next
				bHead = bHead.next
			}
			while (aTail.key === bTail.key) {
				reconcileElement(aTail, bTail)
				aEnd--
				bEnd--
	
				if (aPos > aEnd || bPos > bEnd) 
					break outer
				
				aTail = aTail.prev
				bTail = bTail.prev
			}
			break
		}
	
		// step 2, insert/append/remove
		if (aPos > aEnd) {
			if (bPos <= bEnd++) {
				if (bEnd < bLength)
					reconcileInsert(bHead, aTail, element, host, children, bPos, bEnd, SharedMountInsert)
				else
					reconcileInsert(bHead.next, aTail, element, host, children, bPos, bEnd, SharedMountAppend)
			}
		} else if (bPos > bEnd)
			reconcileRemove(bEnd+1 < bLength ? aHead : aHead.next, element, children, aPos, aEnd+1)
		else
			reconcileMove(element, host, children, aHead, bHead, aPos, bPos, aEnd+1, bEnd+1)
	}
	
	/**
	 * @param  {Element} element
	 * @param  {Element} host
	 * @param  {List} children
	 * @param  {Element} aHead
	 * @param  {Element} bHead
	 * @param  {number} aPos
	 * @param  {number} bPos
	 * @param  {number} aEnd
	 * @param  {number} bEnd
	 */
	function reconcileMove (element, host, children, aHead, bHead, aPos, bPos, aEnd, bEnd) {
		var aIndx = aPos
		var bIndx = bPos
		var aNode = aHead
		var bNode = bHead
		var aNext = aNode
		var bNext = bNode
		var bHash = ''
		var aSize = 0
		var aPool = {}
	
		// step 3, hashmap
		while (bIndx < bEnd && aIndx < aEnd) {
			if (aNode.key !== bNode.key) {
				aPool[aNode.key] = aNode
				aNode = aNode.next
				aSize++
				aIndx++
				continue
			}
	
			reconcileElement(aNode, bNode)
			aNode = aNode.next
			bNode = bNode.next
			aIndx++
			bIndx++
		}
	
		// step 4, insert/remove
		if (aSize !== aEnd) {
			while (bIndx++ < bEnd) {
				bHash = bNode.key
				bNext = bNode.next
				aNext = aPool[bHash]
	
				if (aNext = aPool[bHash]) {
					if (aNode === children)
						commitAppend(children.push(children.remove(aNext)), element)
					else
						commitInsert(children.insert(children.remove(aNext), aNode), aNode, element)
	
					reconcileElement(aNext, bNode)
					
					if (delete aPool[bHash])
						aSize--
				} else if (aNode === children)
					commitMount(children.push(bNode), bNode, element, host, SharedMountAppend, SharedMountCommit)
				else
					commitMount(children.insert(bNode, aNode), aNode, element, host, SharedMountInsert, SharedMountCommit)	
	
				bNode = bNext
			}
	
			if (aSize > 0)
				for (bHash in aPool)
					commitUnmount(children.remove(aPool[bHash]), element, 0)
		} else {
			reconcileRemove(aHead, element, children, 0, aEnd)
			reconcileInsert(bHead, bHead, element, host, children, 0, bEnd, SharedMountAppend)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 * @param {Element} host
	 * @param {List} children
	 * @param {number} index
	 * @param {number} length
	 * @param {number} signature
	 */
	function reconcileInsert (element, sibling, parent, host, children, index, length, signature) {
		var i = index
		var next = element
		var prev = element
	
		while (i++ < length)
			commitMount(children.push((next = (prev = next).next, prev)), sibling, parent, host, signature, SharedMountCommit)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {List} children
	 * @param {number} index
	 * @param {number} length
	 */
	function reconcileRemove (element, parent, children, index, length) {
		var i = index
		var next = element
		var prev = element
		
		while (i++ < length)
			commitUnmount(children.remove((next = (prev = next).next, prev)), parent, 0)
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
			var result
	
			if (!callback)
				return
			
			if (instance) {
				props = instance.props
				state = instance.state
				context = instance.context
			}
	
			if (typeof callback === 'function')
				result = callback.call(instance, event, props, state, context)
			else if (typeof callback.handleEvent === 'function')
				result = callback.handleEvent(event, props, state, context)
	
			if (result && instance)
				getLifecycleReturn(host, result)
		} catch (e) {
			errorBoundary(host, e, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), SharedErrorPassive)
		}
	}
	
	defineProperty(Element.prototype, 'handleEvent', {value: handleEvent})
	
	/**
	 * @param {Element} element
	 * @param {*} e
	 * @param {string} from
	 * @param {number} signature
	 * @param {Element?}
	 */
	function errorBoundary (element, e, from, signature) {
		var error = errorException(element, e, from)
		var element = errorElement(element, error, from, signature)
	
		if (error.report)
			console.error(error.report)
	
		return element
	}
	
	/**
	 * @param {Element} element
	 * @param {Error} error
	 * @param {string} from
	 */
	function errorException (element, error, from) {
		if (!(error instanceof Error))
			return errorException(element, new Error(error), from)
	
		var report = 'Error caught in `\n\n'
		var tabs = ''
		var host = element
	
		while (host && host.type) {
			report += tabs + '<' + getDisplayName(host.type) + '>\n'
			tabs += '  '
			host = host.host
		}
	
		return defineProperties(error, {
			report: {value: report + '\n` from "' + from + '"\n\n' + error.stack + '\n\n', writable: true},
			error: {value: error}
		})
	}
	
	/**
	 * @param  {Element} element
	 * @param  {Object} snapshot
	 * @param  {Error} error
	 * @param  {string} from
	 * @param  {number} signature
	 * @return {Element?}
	 */
	function errorElement (element, error, from, signature) {	
		var snapshot
	
		if (signature === SharedErrorPassive || !element || element.id === SharedElementIntermediate)
			return
	
		if (element.owner && element.owner[SharedComponentDidCatch])
			try {
				element.sync = SharedWorkTask
				snapshot = element.owner[SharedComponentDidCatch].call(element.instance, error, {})
				element.sync = SharedWorkSync
			} catch (e) {
				return errorBoundary(element.host, e, SharedComponentDidCatch, signature)
			}
		else
			errorElement(element.host, error, from, signature)
	
		if (from === SharedSiteRender)
			return commitElement(snapshot)
	
		if (element.DOM)
			requestAnimationFrame(function () {
				reconcileElement(getHostElement(element), commitElement(snapshot))
			})
	}
	
	/**
	 * @param {Element} element
	 * @param {Node} target
	 * @param {function=} callback
	 */
	function render (element, target, callback) {	
		if (!target)
			return render(element, DOMDocument(), callback)
	
		if (root.has(target))
			reconcileElement(root.get(target), commitElement(element))
		else
			mount(element, target, callback, SharedMountCommit)
	}
	
	/**
	 * @param {Element} element
	 * @param {Node} target
	 * @param {function=} callback
	 */
	function hydrate (element, target, callback) {
		if (!target)
			return hydrate(element, DOMDocument(), callback)
		
		if (root.has(target))
			render(element, target, callback)
		else
			mount(element, target, callback, SharedMountClone)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {function} callback
	 * @param {number} mode
	 */
	function mount (element, parent, callback, mode) {
		if (!isValidElement(element))
			return mount(commitElement(element), parent, callback, mode)
	
		if (!isValidElement(parent))
			return mount(element, elementIntermediate(DOM(parent)), callback, mode)
	
		if (!DOMValid(DOMTarget(parent)))
			invariant(SharedSiteRender, 'Target container is not a DOM element')
	
		root.set(DOMTarget(parent), element)
	
		if (mode === SharedMountCommit)
			commitContent(parent)
		
		commitMount(element, element, parent, parent, SharedMountAppend, mode)
	
		if (typeof callback === 'function')
			getLifecycleCallback(element, callback, findDOMNode(element))
	}
	
	/**
	 * @type {Object}
	 */
	var Children = {
		/**
		 * @param {*} children 
		 * @return {Array}
		 */
		toArray: function toArray (children) {
			var array = []
	
			if (children == null)
				return array
			else if (isValidElement(children) || typeof children !== 'object')
				return [children]
			else if (children instanceof Array)
				array = children
			else if (typeof children.next === 'function')
				each(children, function (value) {
					array.push(value)
				})
			else if (typeof children[SymbolIterator] === 'function')
				return this.toArray(child[SymbolIterator]())
			else
				return [children]
	
			return flatten(array, [])
		},
		/**
		 * @param {*} children
		 * @param {function} callback
		 * @param {*} thisArg
		 */
		forEach: function forEach (children, callback, thisArg) {
			if (children != null)
				this.toArray(children).forEach(callback, thisArg)
		},
		/**
		 * @param {*} children
		 * @param {function} callback
		 * @return {Array}
		 */
		map: function map (children, callback, thisArg) {
			if (children != null)
				return this.toArray(children).map(callback, thisArg)
	
			return children
		},
		/**
		 * @param {*} children 
		 * @return {Element}
		 */
		only: function only (children) {
			if (isValidElement(children))
				return children
			
			invariant('Children.only', 'Expected to receive a single element')
		},
		/**
		 * @param {*} children 
		 * @return {number}
		 */
		count: function count (children) {
			return this.toArray(children).length
		}
	}
	
	function DOM (target) {
		return {target: target}
	}
	
	/**
	 * @return {Node}
	 */
	function DOMDocument () {
		return document.documentElement
	}
	
	/**
	 * @param {Node} target
	 * @param {boolean}
	 */
	function DOMValid (target) {
		return !!(target && target.ELEMENT_NODE)
	}
	
	/**
	 * @param {Element} element
	 * @return {Node}
	 */
	function DOMTarget (element) {
		return element.DOM.target
	}
	
	/**
	 * @param {(EventListener|Element)} element
	 * @param {string} type
	 */
	function DOMEvent (element, type) {
		DOMTarget(element).addEventListener(type, element, false)
	}
	
	/**
	 * @param {Element} element
	 * @return {DOM}
	 */
	function DOMElement (element) {
		if (element.xmlns)
			return DOM(document.createElementNS(element.xmlns, element.type))
		else
			return DOM(document.createElement(element.type))
	}
	
	/**
	 * @param {Element} element
	 * @return {DOM}
	 */
	function DOMText (element) {
		return DOM(document.createTextNode(element.children))
	}
	
	/**
	 * @param {Element} element
	 */
	function DOMContent (element) {
		DOMTarget(element).textContent = ''
	}
	
	/**
	 * @param {Element} element
	 * @param {(string|number)} value
	 */
	function DOMValue (element, value) {
		DOMTarget(element).nodeValue = value
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function DOMRemove (element, parent) {
		DOMTarget(parent).removeChild(DOMTarget(element))
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 */
	function DOMInsert (element, sibling, parent) {
		DOMTarget(parent).insertBefore(DOMTarget(element), DOMTarget(sibling))
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function DOMAppend (element, parent) {
		DOMTarget(parent).appendChild(DOMTarget(element))
	}
	
	/**
	 * @param {Element} element
	 * @param {Object} declaration
	 */
	function DOMStyle (element, declaration) {
		for (var key in declaration) {
			var value = declaration[key]
	
			if (key.indexOf('-') < 0)
				DOMTarget(element).style[key] = value !== false && value !== undefined ? value : null
			else
				DOMTarget(element).style.setProperty(key, value)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name 
	 * @param {*} value
	 */
	function DOMProperty (element, name, value) {
		switch (value) {
			case null:
			case false:
			case undefined:
				return DOMProperty(element, name, '')
		}
	
		DOMTarget(element)[name] = value
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {string} xmlns
	 */
	function DOMAttribute (element, name, value, xmlns) {
		switch (value) {
			case null:
			case false:
			case undefined:
				if (!xmlns)
					DOMTarget(element).removeAttribute(name)
				else
					DOMTarget(element).removeAttributeNS(xmlns, name)
				return
			case true:
				return DOMAttribute(element, name, '', xmlns)
		}
	
		if (!xmlns)
			DOMTarget(element).setAttribute(name, value)
		else
			DOMTarget(element).setAttributeNS(xmlns, name, value)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {string} xmlns
	 */
	function DOMProperties (element, name, value, xmlns) {
		switch (name) {
			case 'className':
				if (!xmlns && value)
					return DOMProperty(element, name, value)
			case 'class':
				return DOMAttribute(element, 'class', value, '')
			case 'style':
				if (typeof value === 'object')
					return DOMStyle(element, value)
				break
			case 'xlink:href':
				return DOMAttribute(element, name, value, 'http://www.w3.org/1999/xlink')
			case 'dangerouslySetInnerHTML':
				return DOMProperties(element, 'innerHTML', value ? value.__html : '', '')
			case 'innerHTML':
				if (DOMTarget(element)[name] !== value)
					DOMProperty(element, name, value)
				return
			case 'width':
			case 'height':
				if (element.type === 'img')
					break
			default:
				if (!xmlns && name in DOMTarget(element))
					return DOMProperty(element, name, value)
		}
	
		if (typeof value === 'object')
			DOMProperty(element, name, value)
		else
			DOMAttribute(element, name, value, '')
	}
	
	/**
	 * @param {string} type
	 * @param {string} xmlns
	 */
	function DOMType (type, xmlns) {
		switch (type) {
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
	 * @param {Element} parent
	 */
	function DOMFind (element, parent) {
		var type = element.type.toLowerCase()
		var prev = elementSibling(element, 'prev')
		var next = elementSibling(element, 'next')
		var prevNode = prev.DOM
		var nextNode = null
	
		var target = prevNode ? DOMTarget(prev).nextSibling : DOMTarget(parent).firstChild 
		var current = target
		var sibling = target
	
		while (target)
			switch (target.nodeName.toLowerCase()) {
				case type:
					if (element.id === SharedElementText) {
						if (next.id === SharedElementText && next !== element)
							target.splitText(element.children.length)
	
						if (target.nodeValue !== element.children)
							target.nodeValue = element.children
					}
	
					nextNode = DOM(target)
					type = ''
	
					if (!(target = target.nextSibling) || next !== element)
						break
			default:
				target = (sibling = target).nextSibling
	
				if (!prevNode || current !== sibling)
					sibling.parentNode.removeChild(sibling)
			}
	
		return nextNode
	}

	exports.version = version
	exports.render = render
	exports.hydrate = hydrate
	exports.Component = Component
	exports.PureComponent = PureComponent
	exports.Children = Children
	exports.findDOMNode = findDOMNode
	exports.cloneElement = cloneElement
	exports.isValidElement = isValidElement
	exports.h = exports.createElement = window.h = createElement
	
	require && require('./dio.server.js')(exports, Element, componentMount, commitElement)
}))
