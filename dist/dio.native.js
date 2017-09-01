/*
 * DIO
 *
 * version 8.0.0
 * license MIT
 */
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
	var client = true

	var ElementPromise = -3
	var ElementFragment = -2
	var ElementPortal = -1
	var ElementIntermediate = 0
	var ElementComponent = 1
	var ElementNode = 2
	var ElementText = 3
	
	var WorkTask = 0
	var WorkSync = 1
	
	var ModePull = 0
	var ModePush = 1
	
	var MountRemove = 0
	var MountAppend = 1
	var MountInsert = 2
	var MountReplace = 3
	
	var RefRemove = -1
	var RefAssign = 0
	var RefDispatch = 1
	var RefReplace = 2
	
	var PropsAppend = 1
	var PropsReplace = 2
	
	var LifecycleCallback = 'callback'
	var LifecycleRender = 'render'
	var LifecycleConstructor = 'constructor'
	var LifecycleAsync = 'async'
	var LifecycleState = 'setState'
	var LifecycleFindDOMNode = 'findDOMNode'
	var LifecycleWillMount = 'componentWillMount'
	var LifecycleDidMount = 'componentDidMount'
	var LifecycleWillReceiveProps = 'componentWillReceiveProps'
	var LifecycleShouldUpdate = 'shouldComponentUpdate'
	var LifecycleWillUpdate = 'componentWillUpdate'
	var LifecycleDidUpdate = 'componentDidUpdate'
	var LifecycleWillUnmount = 'componentWillUnmount'
	var LifecycleDidCatch = 'componentDidCatch'
	var LifecycleChildContext = 'getChildContext'
	var LifecycleInitialState = 'getInitialState'
	
	var Symbol = window.Symbol || function (d) {return 'Symbol('+d+')'}
	var WeakMap = window.WeakMap || Hash
	var Promise = window.Promise || noop
	var Node = window.Node || noop
	
	var SymbolIterator = Symbol.iterator || Symbol('Iterator')
	var SymbolElement = Symbol('Element')
	var SymbolComponent = Symbol('Component')
	
	var root = new WeakMap()
	var document = window.document || noop
	var requestAnimationFrame = window.requestAnimationFrame || function(c) {setTimeout(c, 16)}
	var defineProperty = Object.defineProperty
	var defineProperties = Object.defineProperties
	
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
	function Hash () {
		this.hash = ''
	}
	Hash.prototype = {
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
	
		while (value.done !== true) {
			callback(value.value)
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
	 * @constructor
	 * @param {number} flag
	 */
	function Element (flag) {
		this.flag = flag
		this.work = WorkSync
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
		var element = new Element(ElementText)
	
		element.type = '#text'
		element.children = content
	
		return element
	}
	
	/**
	 * @param {*} node
	 * @return {Element}
	 */
	function elementIntermediate (node) {
		var element = new Element(ElementIntermediate)
	
		element.context = {}
		element.DOM = node
	
		return element
	}
	
	/**
	 * @param {(Element|Array|List)} fragment
	 * @return {Element}
	 */
	function elementFragment (fragment) {
		var element = new Element(ElementFragment)
		var children = new List()
		
		element.type = '#fragment'
		element.children = children
	
		switch (fragment.constructor) {
			case Element:
				elementChildren(element, children, fragment, 0)
				break
			case Array:
				for (var i = 0; i < fragment.length; ++i)
					elementChildren(element, children, fragment[i], i)
		}
	
		return element
	}
	
	/**
	 * @param {Iterable} iterable
	 * @param {Element} element
	 */
	function elementIterable (iterable, element) {	
		var index = 0
	
		each(iterable, function (value) {
			index = elementChildren(element, element.children, value, index)
		})
	
		return element
	}
	
	/**
	 * @param {*} child
	 * @return {Element}
	 */
	function elementUnknown (child) {
		if (typeof child.next === 'function')
			return elementIterable(child, elementFragment(child))
		if (typeof child[SymbolIterator] === 'function')
			return elementUnknown(child[SymbolIterator]())
		else if (typeof child === 'function')
			return elementUnknown(child())
		else if (child instanceof Error)
			return createElement('details', createElement('summary', child+''), h('pre', child.trace || child.stack))
		else if (child instanceof Date)
			return elementText(child)
	
		invariant(LifecycleRender, 'Invalid element [object '+getDisplayName(child)+']')
	}
	
	/**
	 * @param {Element} element
	 * @param {number} signature
	 * @return {Element}
	 */
	function elementPrev (element, signature) {
		return elementSibling(element, 'prev', signature)
	}
	
	/**
	 * @param {Element} element
	 * @param {number} signature
	 * @return {Element}
	 */
	function elementNext (element, signature) {
		return elementSibling(element, 'next', signature)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} direction
	 * @param {number} signature
	 * @return {Element}
	 */
	function elementSibling (element, direction, signature) {
		if (signature > MountAppend && element.flag !== ElementPortal && isValidElement(element.children[direction]))
			return element.children[direction]
		else if (isValidElement(element[direction]))
			return element[direction]
	
		return elementIntermediate(DOM(null))
	}
	
	/**
	 * @param {Element} element
	 * @param {List} children
	 * @param {*} child
	 * @param {number} index
	 */
	function elementChildren (element, children, child, index) {
		if (child == null)
			return elementChildren(element, children, elementText(''), index)
		else
			switch (child.constructor) {
				case Element:
					if (child.key == null)
						child.key = '0|'+index
					else if (element.keyed === false)
						element.keyed = true
	
					children.push(child)
					break
				case Array:
					for (var i = 0; i < child.length; ++i)
						elementChildren(element, children, child[i], index + i)
	
					return index + i
				case String:
				case Number:
					return elementChildren(element, children, elementText(child), index)
				case Function:
				case Promise:
					return elementChildren(element, children, createElement(child), index)
				case Boolean:
					return elementChildren(element, children, null, index)
				default:
					return elementChildren(element, children, elementUnknown(child), index)
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
		var flag = typeof type !== 'function' ? ElementNode : ElementComponent
		var length = arguments.length
		var element = new Element(flag)
		var children = flag !== ElementComponent ? new List() : null
		
		if (i < 2)
			switch (props.constructor) {
				case Object:
					if (props[SymbolIterator] === undefined) {
						if (props.key !== undefined)
							element.key = props.key
	
						if (props.ref !== undefined)
							element.ref = props.ref
	
						if (flag !== ElementComponent) {
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
			if (flag !== ElementComponent)
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
				if (type.defaultProps != null)
					element.props = getDefaultProps(element, type.defaultProps, props)
			case String:
				break
			case Element:
				element.flag = type.flag
				element.type = type.type
				element.props = assign({}, type.props, element.props)						
				break
			case Promise:
				element.flag = ElementPromise
				break
			default:
				if (DOMValid(type))
					element.flag = ElementPortal
		}
	
		return element
	}
	
	/**
	 * @param {Element} element
	 * @param {Object?} state
	 */
	function lifecycleReturn (element, state) {
		switch (typeof state) {
			case 'object':
				if (!state)
					break
			case 'function':
				if (client)
					enqueueState(element, element.instance, state)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {function} callback
	 * @param {*} primary
	 * @param {*} secondary
	 * @param {*} optional
	 */
	function lifecycleCallback (element, callback, primary, secondary, optional) {
		try {
			return callback.call(element.instance, primary, secondary, optional)
		} catch (e) {
			errorBoundary(element, e, LifecycleCallback, 0)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 */
	function lifecycleData (element, name) {
		try {
			return element.owner[name].call(element.instance)
		} catch (e) {
			errorBoundary(element, e, name, 1)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 */
	function lifecycleMount (element, name) {
		try {
			var state = element.owner[name].call(element.instance, element.DOM ? DOMTarget(element) : null)
			
			if (name === LifecycleWillUnmount)
				return state
	
			lifecycleReturn(element, state)
		} catch (e) {
			errorBoundary(element, e, name, 1)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Object} props
	 * @param {Object} state
	 * @param {Object} context
	 */
	function lifecycleUpdate (element, name, props, state, context) {
		try {
			var state = element.owner[name].call(element.instance, props, state, context)
	
			if (name === LifecycleShouldUpdate)
				return state
	
			lifecycleReturn(element, state)
		} catch (e) {
			errorBoundary(element, e, name, 1)
		}
	}
	
	/**
	 * @constructor
	 */
	function Component (props, context) {
		this.refs = null
		this.state = null
		this.props = props
		this.context = context
		this[SymbolElement] = null
	}
	/**
	 * @type {Object}
	 */
	var ComponentPrototype = {
		forceUpdate: {value: forceUpdate}, 
		setState: {value: setState}
	}
	
	createComponent(Component.prototype)
	
	/**
	 * @param {Object} prototype
	 * @return {Object}
	 */
	function createComponent (prototype) {
		defineProperty(defineProperties(prototype, ComponentPrototype), SymbolComponent, {value: SymbolComponent})
	
		if (!prototype.hasOwnProperty(LifecycleRender))
			defineProperty(prototype, LifecycleRender, {value: noop, writable: true})
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
		enqueueUpdate(this[SymbolElement], this, callback, 0)
	}
	
	/**
	 * @param {Element} element
	 * @return {number}
	 */
	function componentMount (element) {
		var owner = element.type
		var prototype = owner.prototype
		var children
		var instance
	
		if (prototype && prototype.render) {
			if (prototype[SymbolComponent] !== SymbolComponent)
				createComponent(prototype)
	
			instance = owner = getChildInstance(element)
		} else {
			instance = new Component()
			instance.render = owner
		}
	
		element.owner = owner
		element.instance = instance
		
		instance[SymbolElement] = element
		instance.refs = {}
		instance.props = element.props
		instance.context = element.context = element.context || {}
	
		if (owner[LifecycleInitialState])
			instance.state = getInitialState(element, instance, lifecycleData(element, LifecycleInitialState))
		else if (!instance.state)
			instance.state = {}
		
		children = getChildElement(element)
		children.context = element.context
	
		element.children = children
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {number} signature
	 */
	function componentUpdate (element, snapshot, signature) {
		if (element.work < WorkSync)
			return
	
		element.work = WorkTask
	
		var instance = element.instance
		var owner = element.owner
		var nextContext = instance.context
		var prevProps = element.props
		var nextProps = snapshot.props
		var prevState = instance.state
		var nextState = signature > 1 ? assign({}, prevState, element.state) : prevState
	
		if (owner[LifecycleChildContext])
			merge(element.context, getChildContext(element))
	
		switch (signature) {
			case 0:
				break
			case 1:
				if (owner[LifecycleWillReceiveProps]) {
					lifecycleUpdate(element, LifecycleWillReceiveProps, nextProps, nextContext)
				}
			case 2:
				if (owner[LifecycleShouldUpdate])
					if (lifecycleUpdate(element, LifecycleShouldUpdate, nextProps, nextState, nextContext) === false)
						return void (element.work = WorkSync)
		}
	
		if (owner[LifecycleWillUpdate])
			lifecycleUpdate(element, LifecycleWillUpdate, nextProps, nextState, nextContext)
	
		instance.state = nextState
		instance.props = nextProps
	
		reconcileElement(element.children, getChildElement(element))
	
		if (owner[LifecycleDidUpdate])
			lifecycleUpdate(element, LifecycleDidUpdate, prevProps, prevState, nextContext)
	
		if (element.ref !== snapshot.ref)
			commitRef(element, snapshot.ref, RefReplace)
	
		element.work = WorkSync
	}
	
	/**
	 * @param {Element} element
	 * @param {List} children
	 * @param {Element} parent
	 * @param {number} signature
	 */
	function componentUnmount (element, children, parent, signature) {
		if (element.owner[LifecycleWillUnmount])
			if (element.state = lifecycleMount(element, LifecycleWillUnmount))
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
	function componentRef (value, key, element) {
		if (this.refs) {
			if (key !== element.ref)
				delete this.refs[element.ref]
	
			this.refs[key] = element.instance
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
					element.state = element.work > WorkTask ? state : assign(instance.state, element.state, state)
	
					enqueueUpdate(element, instance, callback, 2)
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
			errorBoundary(element, e, LifecycleState+':'+LifecycleCallback, 1)
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
			errorBoundary(element, e, LifecycleAsync+':'+LifecycleState, 1)
		})
	}
	
	/**
	 * @param {Element} element
	 * @param {Component} instance
	 * @param {function=} callback
	 * @param {number} signature
	 */
	function enqueueUpdate (element, instance, callback, signature) {
		if (element == null)
			return void requestAnimationFrame(function () {
				enqueueUpdate(getHostChildren(instance), instance, callback, signature)
			})
	
		if (element.work < WorkSync)
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
	 * @param {(Component|Element)} instance
	 * @param {Object} state
	 * @return {Object}
	 */
	function getInitialState (element, instance, state) {	
		if (state)
			switch (state.constructor) {
				case Promise:
					enqueuePending(element, instance, state)
				case Boolean:
					break
				default:
					return state
			}
	
		return instance.state || {}
	}
	
	/**
	 * @param {Element} element
	 * @return {Component}
	 */
	function getChildInstance (element) {
		try {
			return new element.type(element.props, element.context)
		} catch (e) {
			errorBoundary(element, e, LifecycleConstructor, 1)
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
			return commitElement(errorBoundary(element, e, LifecycleRender, 1))
		}
	}
	
	/**
	 * @param {Element} element
	 * @return {Object?}
	 */
	function getChildContext (element) {
		if (element.owner[LifecycleChildContext])
			return lifecycleData(element, LifecycleChildContext) || element.context || {}
		else
			return element.context || {}
	}
	
	/**
	 * @param {Element} element
	 * @return {Element}
	 */
	function getHostElement (element) {
		return element.flag !== ElementComponent ? element : getHostElement(element.children)
	}
	
	/**
	 * @param  {(Element|Component)} element
	 * @return {Element?}
	 */
	function getHostChildren (element) {
		return isValidElement(element) ? element : element[SymbolElement]
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
			value: getDefaultProps(element, lifecycleCallback(element, defaultProps), props)
		})
	
		return element.type.defaultProps
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
	 * @param {Element} snapshot
	 */
	function commitPromise (element, snapshot) {
		snapshot.type.then(function (value) {
			if (!element.DOM)
				return
			if (element.flag === ElementPromise)
				reconcileChildren(element, elementFragment(commitElement(value)))
			else
				reconcileElement(element, commitElement(value))
		}).catch(function (e) {
			errorBoundary(element, e, LifecycleAsync+':'+LifecycleRender, 1)
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
			if (!next.DOM && mode > ModePull) {
				children.insert(next = merge(new Element(ElementNode), sibling = next), sibling)
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
	
	 	switch (element.flag) {
	 		case ElementComponent:
	 			element.work = WorkTask
	 			
	 			componentMount(element)
	
	 			if (element.owner[LifecycleWillMount]) 
	 				lifecycleMount(element, LifecycleWillMount)
	
	 			if (element.owner[LifecycleChildContext])
	 				element.context = getChildContext(element)
	
	 			commitMount(element.children, sibling, parent, element, signature, mode)
	 			element.DOM = element.children.DOM
	
	 			if (element.ref)
	 				commitRef(element, element.ref, RefAssign)
	 			
	 			if (element.owner[LifecycleDidMount])
	 				lifecycleMount(element, LifecycleDidMount)
	
	 			element.work = WorkSync
	 			return
	 		case ElementPortal:
	 			element.DOM = DOM(element.type)
	 			break
	 		case ElementPromise:
	 			commitPromise(element, element)
	 		case ElementFragment:
	 			element.DOM = DOM(DOMTarget(parent))
	 			break
	 		case ElementNode:
	 			element.xmlns = DOMType(element.type, parent.xmlns)
	 		case ElementText:
	 			switch (mode) {
	 				case ModePull:
	 					if (element.DOM = DOMFind(element, elementPrev(element), parent))
	 						break
	 				default:
	 					element.DOM = commitDOM(element)
	 					
	 					if (signature < MountInsert)
	 						commitAppend(element, parent)
	 					else
	 						commitInsert(element, sibling, parent)
	 			}
	
	 			if (element.flag > ElementNode)
	 				return
	 	}
	
	 	commitChildren(element, element.children, host, MountAppend, mode)
	 	commitProps(element, element.props, PropsAppend)	
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {number} signature
	 */
	function commitUnmount (element, parent, signature) {
		if (element.flag === ElementComponent)
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
		if (signature > MountInsert && commitUnmount(element, element.parent, MountReplace))
			return void element.state.then(function () {
				commitReplace(element, snapshot, MountInsert)
			})
	
		commitMount(snapshot, elementNext(element, MountAppend), element.parent, element.host, MountInsert, ModePush)
	
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
		if (element.flag !== ElementText) {
			var index = 0
			var children = element.children
			var length = children.length
			var next = children.next
	
			while (index++ < length)
				switch (next.flag) {
					case ElementComponent:
						if (next.owner[LifecycleWillUnmount])
							lifecycleMount(next, LifecycleWillUnmount)
					default:
						commitDetach(next, MountAppend)
						next = next.next
				}
		}
	
		if (element.ref)
			commitRef(element, element.ref, RefRemove)
	
		if (signature < MountReplace) {
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
	function commitRef (element, callback, signature, key) {
		switch (typeof callback) {
			case 'string':
				return commitRef(element, componentRef, signature, callback)			
			case 'function':
				switch (signature) {
					case RefRemove:
						return lifecycleCallback(element.host, callback, element.ref = null, key, element)
					case RefAssign:
						element.ref = callback
						return lifecycleCallback(element.host, callback, element.instance || DOMTarget(element), key, element)
					case RefReplace:
						commitRef(element, callback, RefRemove, key)
						commitRef(element, callback, RefAssign, key)
				}
				break
			default:
				commitRef(element, element.ref || noop, RefRemove, key)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} type
	 * @param {(function|EventListener)} callback
	 */
	function commitEvent (element, type, callback) {
		if (!element.event)
			DOMEvent((element.event = {}, element), type)
	
		element.event[type] = callback
	}
	
	/**
	 * @param {Element} element
	 * @param {number} props
	 * @param {number} signature
	 */
	function commitProps (element, props, signature) {
		for (var key in props)
			if (key === 'ref')
				commitRef(element, props[key], signature)
			else if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110)
				commitEvent(element, key.substring(2).toLowerCase(), props[key])
			else
				DOMProperties(element, key, props[key], element.xmlns)
	}
	
	/**
	 * @param {Element} element
	 * @return {Object}
	 */
	function commitDOM (element) {
		try {
			return element.flag === ElementNode ? DOMElement(element) : DOMText(element)
		} catch (e) {
			return commitDOM(commitElement(errorBoundary(element, e, LifecycleRender, 1)))
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
		if (element.flag > ElementIntermediate)
			DOMRemove(element, parent)
		else
			element.children.forEach(function (children) {
				commitRemove(children, element.flag < ElementPortal ? parent : element)
			})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 */
	function commitInsert (element, sibling, parent) {
		if (sibling.flag < ElementIntermediate)
			return commitInsert(element, elementNext(sibling, MountInsert), parent)
	
		if (element.flag > ElementIntermediate)
			DOMInsert(element, sibling, parent)
		else if (element.flag < ElementPortal)
			element.children.forEach(function (children) {
				commitInsert(children, sibling, parent)
			})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitAppend (element, parent) {
		if (parent.flag < ElementPortal)
			return commitInsert(element, elementNext(parent, MountAppend), parent)
	
		if (element.flag > ElementIntermediate)
			DOMAppend(element, parent)
		else if (element.flag < ElementPortal)
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
	function reconcileProps (element, snapshot) {
		commitProps(element, reconcileObject(element.props, snapshot.props), PropsReplace)
		element.props = snapshot.props
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function reconcileElement (element, snapshot) {	
		if (snapshot.flag === ElementPromise)
			return commitPromise(element, snapshot)
	
		if (element.key !== snapshot.key || element.type !== snapshot.type)
			return commitReplace(element, snapshot, MountReplace)
	
		switch (element.flag) {
			case ElementPortal:
			case ElementFragment:
				return reconcileChildren(element, snapshot)
			case ElementComponent:
				return componentUpdate(element, snapshot, 1)
			case ElementText:
				if (element.children !== snapshot.children)
					commitValue(element, element.children = snapshot.children)
				break
			case ElementNode:
				reconcileChildren(element, snapshot)
				reconcileProps(element, snapshot)
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
				return reconcileInsert(bHead, bHead, element, host, children, 0, bLength, MountAppend)
		}
	
		// non-keyed
		if (!snapshot.keyed) {
			i = aLength > bLength ? bLength : aLength
	
			while (i--) { 
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
						commitMount(children.push(aHead), aHead, element, host, MountAppend, ModePush)
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
					reconcileInsert(bHead, aTail, element, host, children, bPos, bEnd, MountInsert)
				else
					reconcileInsert(bHead.next, aTail, element, host, children, bPos, bEnd, MountAppend)
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
					commitMount(children.push(bNode), bNode, element, host, MountAppend, ModePush)
				else
					commitMount(children.insert(bNode, aNode), aNode, element, host, MountInsert, ModePush)	
	
				bNode = bNext
			}
	
			if (aSize > 0)
				for (bHash in aPool)
					commitUnmount(children.remove(aPool[bHash]), element, 0)
		} else {
			reconcileRemove(aHead, element, children, 0, aEnd)
			reconcileInsert(bHead, bHead, element, host, children, 0, bEnd, MountAppend)
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
			commitMount(children.push((next = (prev = next).next, prev)), sibling, parent, host, signature, ModePush)
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
			var host = element.host
			var instance = host.instance
			var callback = element.event[type]
			var state
	
			if (!callback)
				return
	
			if (typeof callback === 'function')
				state = callback.call(instance, event)
			else if (typeof callback.handleEvent === 'function')
				state = callback.handleEvent(event)
	
			if (instance && state)
				lifecycleReturn(host, state)
		} catch (e) {
			errorBoundary(host, e, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), 0)
		}
	}
	
	defineProperty(Element.prototype, 'handleEvent', {value: handleEvent})
	
	/**
	 * @param {Element} element
	 * @param {string} from
	 */
	function errorException (element, from) {
		if (!(this instanceof Error))
			return errorException.call(new Error(this), element, from)
	
		var trace = 'Error caught in `\n\n'
		var tabs = ''
		var host = element
		var stack = this.stack
	
		while (host.type) {
			trace += tabs + '<' + getDisplayName(host.type) + '>\n'
			tabs += '  '
			host = host.host
		}
	
		console.error(trace + '\n` from "'+from+'"\n\n'+stack+'\n\n')
		
		return this
	}
	
	/**
	 * @param {Element} element
	 * @param {*} error
	 * @param {string} from
	 * @param {number} signature
	 * @param {Element?}
	 */
	function errorBoundary (element, error, from, signature) {
		return errorElement(element, {}, errorException.call(error, element, from), from, signature)
	}
	
	/**
	 * @param  {Element} element
	 * @param  {Object} snapshot
	 * @param  {Error} error
	 * @param  {string} from
	 * @param  {number} signature
	 * @return {*}
	 */
	function errorElement (element, snapshot, error, from, signature) {	
		if (!signature || !element.owner)
			return
	
		if (element.owner[LifecycleDidCatch])
			try {
				element.sync = WorkTask
				snapshot.children = commitElement(element.owner[LifecycleDidCatch].call(element.instance, error))
				element.sync = WorkSync
			} catch (e) {
				return errorBoundary(element.host, e, LifecycleDidCatch, signature)
			}
		else
			errorElement(element.host, snapshot, error, from, signature)
	
		if (from === LifecycleRender)
			return snapshot.children
		else if (client)
			requestAnimationFrame(function () {
				reconcileElement(getHostElement(element), snapshot.children)
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
			mount(element, target, callback, ModePush)
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
			mount(element, target, callback, ModePull)
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
			invariant(LifecycleRender, 'Target container is not a DOM element')
	
		root.set(DOMTarget(parent), element)
	
		if (mode > ModePull)
			commitContent(parent)
		
		commitMount(element, element, parent, parent, MountAppend, mode)
	
		if (typeof callback === 'function')
			lifecycleCallback(element, callback, findDOMNode(element))
	}
	
	/**
	 * @param {(Component|Element|Node)} element
	 * @return {Node}
	 */
	function findDOMNode (element) {
		if (!element)
			invariant(LifecycleFindDOMNode, 'Expected to receive a component')
	
		if (isValidElement(element[SymbolElement]))
			return findDOMNode(element[SymbolElement])
			
		if (isValidElement(element)) {
			if (element.flag < ElementPortal)
				return findDOMNode(elementNext(element, 1))
			else if (element.DOM)
				return DOMTarget(element)
		}
	
		if (DOMValid(element))
			return element
	
		invariant(LifecycleFindDOMNode, 'Called on an unmounted component')
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
			else
				return children
		},
		/**
		 * @param {*} children 
		 * @return {Element}
		 */
		only: function only (children) {
			if (!isValidElement(children))
				invariant('Children.only', 'Expected to receive a single element')
			else
				return children
		},
		/**
		 * @param {*} children 
		 * @return {number}
		 */
		count: function count (children) {
			return this.toArray(children).length
		}
	}
	
	/**
	 * @param {View} target
	 */
	function DOM (target) {
		return {target: target}
	}
	
	/**
	 * @param {Element} element
	 * @return {View}
	 */
	function DOMNode (element) {
		return element.DOM.target
	}
	
	/**
	 * @param {View} target
	 * @param {boolean}
	 */
	function DOMValid (target) {
		return target instanceof View
	}
	
	/**
	 * @return {View}
	 */
	function DOMRoot () {
	
	}
	
	/**
	 * @param {string} type
	 * @param {EventListener} listener
	 * @param {*} options
	 */
	function DOMEvent (type, listener, options) {
		DOMRoot().addEventListener(type, listener.handleEvent, listener)
	}
	
	/**
	 * @param {string} type
	 * @param {string} xmlns
	 * @return {DOM}
	 */
	function DOMElement (type, xmlns) {
		switch (type) {
			default:
				return DOM(new View())
		}
	}
	
	/**
	 * @param {(string|number)} value
	 * @return {DOM}
	 */
	function DOMText (value) {
		return DOM(new Span())
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name 
	 * @param {*} value
	 */
	function DOMProperty (element, name, value) {
		DOMNode(element).set(name, value)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {boolean} xmlns
	 * @param {number} hash
	 * @param {number} signature
	 */
	function DOMAttribute (element, name, value, xmlns, hash, signature) {
		switch (name) {
	
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {number} signature
	 */
	function DOMStyle (element, name, value, signature) {
	
	}
	
	/**
	 * @param {Element} element
	 */
	function DOMContent (element) {
	
	}
	
	/**
	 * @param {Element} element
	 * @param {(string|number)} value
	 */
	function DOMValue (element, value) {
		DOMNode(element).text = value
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function DOMRemove (element, parent) {
	
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 */
	function DOMInsert (element, sibling, parent) {
	
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function DOMAppend (element, parent) {
	
	}

	exports.version = version
	exports.render = render
	exports.hydrate = hydrate
	exports.Component = Component
	exports.Children = Children
	exports.findDOMNode = findDOMNode
	exports.cloneElement = cloneElement
	exports.isValidElement = isValidElement
	exports.h = exports.createElement = window.h = createElement
}))
