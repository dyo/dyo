/* DIO 8.0.0 */
(function (factory) {
	/* eslint-disable */
	if (typeof exports === 'object' && typeof module !== 'undefined')
		factory(exports, global, typeof __webpack_require__ === 'undefined' ? require : global)
	else
		factory(window.dio = {}, window, window)
}(function (exports, window, __require__) {
	/* eslint-disable */
	'use strict'

	var version = '8.0.0'
	var server = __require__ !== window

	/**
	 * @constructor
	 */
	function List () {
		this.next = this
		this.prev = this
		this.length = 0
	}
	List.prototype = Object.create(null, {
		constructor: {value: List},
		/**
		 * @param {Element} element
		 * @param {Element} sibling
		 * @return {Element}
		 */
		insert: {value: function insert (element, sibling) {
			element.next = sibling
			element.prev = sibling.prev
			sibling.prev.next = element
			sibling.prev = element
			this.length++
			
			return element
		}},
		/**
		 * @param {Element} element
		 * @return {Element}
		 */
		remove: {value: function remove (element) {
			if (this.length < 1) 
				return
			
			element.next.prev = element.prev
			element.prev.next = element.next
			this.length--
			
			return element
		}},
		/**
		 * @return {Element}
		 */
		pop: {value: function pop () {
			return this.remove(this.prev)
		}},
		/**
		 * @param {Element} element
		 * @return {Element}
		 */
		push: {value: function push (element) {
			return this.insert(element, this)
		}},
		/**
		 * @param {function} callback
		 */
		forEach: {value: function forEach (callback) {
			for (var i = 0, element = this; i < this.length; i++)
				callback.call(this, element = element.next, i)
		}}
	})
	
	/**
	 * @constructor
	 */
	function Hash () {
		this.k = []
		this.v = []
	}
	Hash.prototype = Object.create(null, {
		/**
		 * @param  {*} key
		 * @param  {*} value
		 * @return {Hash}
		 */
		set: {value: function set (key, value) {
			var k = this.k
			var i = k.lastIndexOf(key)
	
			k[i < 0 ? (i = k.length) : i] = key
			this.v[i] = value
	
			return this
		}},
		/**
		 * @param  {*} key
		 * @return {*}
		 */
		get: {value: function get (key) {
			return this.v[this.k.lastIndexOf(key)]
		}},
		/**
		 * @param {*} key
		 * @return {boolean}
		 */
		has: {value: function has (key) {
			return this.k.lastIndexOf(key) > -1
		}}
	})
	
	/**
	 * @param {Object} destination
	 * @param {Object} source
	 */
	function merge (destination, source) {
		for (var key in source)
			destination[key] = source[key]
	}
	
	/**
	 * @param {Object} destination
	 * @param {Object} source
	 * @param {Object} delta
	 * @return {Object}
	 */
	function assign (destination, source, delta) {
		for (var key in source)
			destination[key] = source[key]
		
		for (var key in delta)
			destination[key] = delta[key]
	
		return destination
	}
	
	/**
	 * @param {function} callback
	 */
	function setImmediate (callback) {
		requestAnimationFrame(callback, 16)
	}
	
	/**
	 * @type {function}
	 * @return {void}
	 */
	function noop () {}
	
	var Node = window.Node || noop
	var Symbol = window.Symbol || noop
	var Iterator = Symbol.iterator
	var Promise = window.Promise || noop
	var Map = window.Map || Hash
	var WeakMap = window.WeakMap || Hash
	
	var root = new WeakMap()
	var document = window.document || noop
	var requestAnimationFrame = window.requestAnimationFrame || setTimeout
	
	var ElementPromise = -3
	var ElementFragment = -2
	var ElementPortal = -1
	var ElementIntermediate = 0
	var ElementComponent = 1
	var ElementNode = 2
	var ElementText = 3
	
	var PriorityLow = -9
	var PriorityTask = 0
	var PriorityHigh = 1
	
	var LifecycleCallback = 'callback'
	var LifecycleRender = 'render'
	var LifecycleConstructor = 'constructor'
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
	
	var NSSvg = 'http://www.w3.org/2000/svg'
	var NSMathML = 'http://www.w3.org/1998/Math/MathML'
	var NSXlink = 'http://www.w3.org/1999/xlink'
	
	/**
	 * @constructor
	 * @param {number} flag
	 */
	function Element (flag) {
		this.flag = flag
		this.sync = 0
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
		this.host = null
		this.parent = null
		this.event = null
		this.style = null
		this.DOM = null
		this.context = null
		this.next = null
		this.prev = null
	}
	Element.prototype = Object.create(null, {
		constructor: {value: Element}
	})
	
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
	 * @return {Element} children
	 */
	function elementIntermediate (children) {
		var element = new Element(ElementIntermediate)
	
		element.children = children
		element.context = {}
		element.DOM = {node: null}
	
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
				for (var i = 0; i < fragment.length; i++)
					elementChildren(element, children, fragment[i], i)
				break
			case List:
				fragment.forEach(function (fragment, i) {
					elementChildren(element, children, fragment, i)
				})
		}
	
		return element
	}
	
	/**
	 * @param {Iterable} iterable
	 * @param {Element} element
	 */
	function elementIterable (iterable, element) {	
		var index = 0
		var children = element.children
		var value = iterable.next()
	
		while (value.done !== true) {
			index = elementChildren(element, children, value.value, index)
			value = iterable.next(value.value)
		}
	
		return element
	}
	
	/**
	 * @param {*} child
	 * @return {Element}
	 */
	function elementUnknown (child) {
		if (typeof child.next === 'function')
			return elementIterable(child, elementFragment(child))
		else if (typeof child[Iterator] === 'function')
			return elementUnknown(child[Iterator]())
		else if (typeof child === 'function')
			return elementUnknown(child())
		else if (child.constructor !== Error)
			return createElement('pre', JSON.stringify(child, null, 2))
	
		return createElement('details', createElement('summary', child+''), h('pre', (child.trace||'')+'\n'+child.stack))
	}
	
	/**
	 * @param {Element} element
	 * @param {number} signature
	 * @return {Element}
	 */
	function elementSibling (element, signature) {
		if (signature > 0 && element.flag !== ElementPortal && isValidElement(element.children.next))
			return element.children.next
		else if (isValidElement(element.next))
			return element.next
		else
			return elementIntermediate(element)
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
					if (child.key !== null && element.keyed === false)
						element.keyed = true
	
					children.push(child)
					break
				case List:
				case Array:
					for (var i = 0; i < child.length; i++)
						elementChildren(element, children, child[i], index+i)
	
					return index+i
				case String:
				case Number:
					return elementChildren(element, children, elementText(child), index)
				case Function:
				case Promise:
					return elementChildren(element, children, createElement(child), index)
				case Boolean:
				case Symbol:
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
	 * @param {Object}
	 * @return {boolean}
	 */
	function isValidPortal (element) {
		return element instanceof Node
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
		var children = null
		var length = arguments.length
		var element = new Element(flag)
	
		if (i < 2)
			switch (props.constructor) {
				case Object:
					if (props[Iterator] === undefined) {
						if (props.key != null)
							element.key = props.key
	
						if (props.xmlns != null)
							element.xmlns = props.xmlns
	
						if (props.ref != null)
							element.ref = props.ref
	
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
				for (children = element.children = new List(); i < length; i++)
					index = elementChildren(element, children, arguments[i], index)
			else {
				if (size > 1)
					for (children = Array(size); i < length; i++)
						children[index++] = arguments[i]
				else
					children = arguments[i]
	
				element.props.children = children
			}
		} else if (flag === ElementNode)
			element.children = new List()
	
		switch ((element.type = type).constructor) {
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
				if (isValidPortal(type))
					element.flag = ElementPortal
		}
	
		return element
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
			Boundary(element, e, LifecycleCallback)
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
			Boundary(element, e, name)
		}
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
				if (!server)
					enqueueState(element, element.instance, state)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 */
	function lifecycleMount (element, name) {
		try {
			var state = element.owner[name].call(element.instance, element.DOM ? element.DOM.node : null)
				
			return state && state.constructor === Promise ? state : lifecycleReturn(element, state)
		} catch (e) {
			Boundary(element, e, name)
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
	
			return typeof state !== 'object' ? state : lifecycleReturn(element, state)
		} catch (e) {
			Boundary(element, e, name)
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
		this.children = null
	}
	/**
	 * @type {Object}
	 */
	Component.prototype = Object.create(null, {
		constructor: {value: Component},
		forceUpdate: {value: forceUpdate}, 
		setState: {value: setState}
	})
	
	/**
	 * @param {(Object|function)} state
	 * @param {function?} callback
	 */
	function setState (state, callback) {
		enqueueState(this.children, this, state, callback)
	}
	
	/**
	 * @param {function} callback
	 */
	function forceUpdate (callback) {
		enqueueUpdate(this.children, this, callback, 0)
	}
	
	/**
	 * @param {Object}
	 */
	function componentPrototype (owner, prototype) {
		Object.defineProperties(prototype, {
			setState: {value: setState},
			forceUpdate: {value: forceUpdate}
		}) 
	}
	
	/**
	 * @param {Element} element
	 * @return {number}
	 */
	function componentMount (element) {
		var owner = element.type
		var prototype = owner.prototype
		var instance = null
		var children = null
	
		if (prototype && prototype.render) {
			if (!prototype.setState)
				componentPrototype(owner, prototype)
	
			instance = owner = getChildInstance(element) || new Component()
		} else {
			instance = new Component()
			instance.render = owner
		}
	
		instance.refs = {}
		instance.props = element.props
		instance.context = element.context
		instance.children = element
	
		element.owner = owner
		element.instance = instance
	
		if (owner[LifecycleInitialState])
			instance.state = getInitialState(element, instance, lifecycleData(element, LifecycleInitialState))
		else if (!instance.state)
			instance.state = {}
		
		if (owner[LifecycleChildContext])
			element.context = getChildContext(element)
	
		children = getChildElement(element)
		children.context = element.context
	
		return element.children = children
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {number} signature
	 */
	function componentUpdate (element, snapshot, signature) {
		if (element.sync < PriorityHigh)
			return
	
		element.sync = PriorityTask
	
		var instance = element.instance
		var owner = element.owner
		var context = instance.context
		var prevState = instance.state
		var nextState = signature > 1 ? assign({}, prevState, element.state) : prevState
		var prevProps = element.props
		var nextProps = snapshot.props
	
		if (owner[LifecycleChildContext])
			merge(element.context, getChildContext(element))
	
		switch (signature) {
			case 0:
				break
			case 1:
				if (owner[LifecycleWillReceiveProps])
					lifecycleUpdate(element, LifecycleWillReceiveProps, nextProps, nextState, context)
			case 2:
				if (owner[LifecycleShouldUpdate])
					if (lifecycleUpdate(element, LifecycleShouldUpdate, nextProps, nextState, context) === false)
						return
		}
	
		if (owner[LifecycleWillUpdate])
			lifecycleUpdate(element, LifecycleWillUpdate, nextProps, nextState, context)
	
		instance.state = nextState
		instance.props = nextProps
	
		patchElement(element.children, getChildElement(element))
	
		if (owner[LifecycleDidUpdate])
			lifecycleUpdate(element, LifecycleDidUpdate, prevProps, prevState, context)
	
		if (element.ref !== snapshot.ref)
			commitReference(element, snapshot.ref, 2)
	
		element.sync = PriorityHigh
	}
	
	/**
	 * @param {Element} host
	 * @param {List} children
	 * @param {Element} parent
	 * @param {number} signature
	 * @param {number} resolve
	 */
	function componentUnmount (host, children, parent, signature, resolve) {
		if (resolve > 0 && host.owner[LifecycleWillUnmount])
			if (host.state = lifecycleMount(host, LifecycleWillUnmount))
				if (host.state.constructor === Promise)
					return void host.state.then(function () {
						host.state = componentUnmount(host, children, element, parent, signature, 0)
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
					element.state = element.sync === PriorityHigh ? state : assign({}, element.state, state)
	
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
			return callback.call(instance, instance.state)
		} catch (e) {
			Boundary(element, e, LifecycleCallback+':'+getDisplayName(callback))
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
			setImmediate(function () {
				enqueueState(element, instance, value, callback)
			})
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
			return setImmediate(function () {
				enqueueUpdate(getHostChildren(instance), instance, callback, signature)
			})
	
		if (element.sync < PriorityHigh)
			return setImmediate(function () {
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
			Boundary(element.host, e, LifecycleConstructor)
		}
	}
	
	/**
	 * @param {Element} element
	 * @return {Element}
	 */
	function getChildElement (element) {
		try {
			return commitElement(
				element.instance.render(element.instance.props, element.instance.state, element.context)
			)
		} catch (e) {
			return Boundary(element, e, LifecycleRender)
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
		return isValidElement(element) ? element : element.children	
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
				return 'anonymous'
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
	
		Object.defineProperty(element.type, 'defaultProps', {
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
				case List:
				case Array:
					return elementFragment(element)
				case String:
				case Number:
					return elementText(element)
				case Function:
				case Promise:
					return createElement(element)
				case Boolean:
				case Symbol:
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
				patchChildren(element, elementFragment(commitElement(value)))
			else
				patchElement(element, commitElement(value))
		})
	}
	
	/**
	 * @param {Element} element
	 * @return {Object}
	 */
	function commitDOM (element) {
		try {
			return element.flag === ElementNode ? DOMElement(element.type, element.xmlns) : DOMText(element.children)
		} catch (e) {
			return commitDOM(Boundary(element, e, LifecycleRender))
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} host
	 */
	function commitChildren (element, sibling, host) {
		var children = element.children
		var length = children.length
		var next = children.next
	
		while (length-- > 0) {
			commitMount(!next.DOM ? next : merge(new Element(ElementNode), next), sibling, element, host, 0)
			next = next.next
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 * @param {Element} host
	 * @param {number} signature
	 */
	function commitMount (element, sibling, parent, host, signature) {
		element.host = host
		element.parent = parent
		element.context = host.context
	
	 	switch (element.flag) {
	 		case ElementComponent:
	 			element.sync = PriorityTask
	 			
	 			componentMount(element)
	
	 			if (element.owner[LifecycleWillMount]) 
	 				lifecycleMount(element, LifecycleWillMount)
	
	 			commitMount(element.children, sibling, parent, element, signature)
	
	 			if ((element.DOM = element.children.DOM, element.ref)) 
	 				commitReference(element, element.ref, 1)
	 			if (element.owner[LifecycleDidMount]) 
	 				lifecycleMount(element, LifecycleDidMount)
	
	 			element.sync = PriorityHigh
	 			return
	 		case ElementPortal:
	 			element.DOM = {node: element.type}
	 			break
	 		case ElementPromise:
	 			commitPromise(element, element)
	 		case ElementFragment:
	 			element.DOM = {node: parent.DOM.node}
	 			break
	 		case ElementNode:
	 			switch (element.type) {
	 				case 'svg':
	 					element.xmlns = NSSvg
	 					break
	 				case 'math':
	 					element.xmlns = NSMathML
	 					break
	 				default:
	 					if (parent.xmlns && !element.xmlns && parent.type !== 'foreignObject')
							element.xmlns = parent.xmlns
	 			}
	 		case ElementText:
	 			element.DOM = commitDOM(element)
	 			
	 			if (signature < 1) 
	 				commitAppend(element, parent)
	 			else
	 				commitInsert(element, sibling, parent)
	 
	 			if (element.flag > ElementNode)
	 				return
	 	}
	
		commitChildren(element, element, host)
		commitProperties(element)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {number} signature
	 */
	function commitUnmount (element, parent, signature) {
		if (element.flag !== ElementComponent) {
			commitRemove(element, parent)
			commitDemount(element, 1, signature)
		} else
			componentUnmount(element, element.children, parent, signature, 1)
	}
	
	/**
	 * @param {Element} element
	 * @param {number} flag
	 * @param {number} signature
	 */
	function commitDemount (element, flag, signature) {
		switch (element.flag*flag) {
			case ElementText:
				break
			default:
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
							commitDemount(next, 1, 1)
							next = next.next
					}
		}
	
		if (signature < 1)
			element.context = element.DOM = null
	
		if (element.ref)
			commitReference(element, element.ref, -1)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function commitMerge (element, snapshot) {
		commitMount(snapshot, element, element.parent, element.host, 1)	
		commitUnmount(element, element.parent, 1)
	
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
	 */
	function commitProperties (element) {
		var props = element.props
		var xmlns = !!element.xmlns
		var value = null
	
		for (var key in props)
			if ((value = props[key]) != null)
				commitProperty(element, key, value, 1, xmlns)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {number} signature
	 * @param {boolean} xmlns
	 */
	function commitProperty (element, name, value, signature, xmlns) {	
		switch (name) {
			case 'dangerouslySetInnerHTML':
				if (signature > 1 && (!value || !element.props[name] || element.props[name].__html !== value.__html))
					return
				else
					return commitProperty(element, 'innerHTML', value.__html, signature, xmlns)
			case 'ref':
				commitReference(element, value, signature)
			case 'key':
			case 'xmlns':
			case 'children':
				break
			case 'className':
				if (xmlns)
					return commitProperty(element, 'class', value, signature, !xmlns)
			case 'id':
				return DOMAttribute(element.DOM, name, value, signature, xmlns, 3)
			case 'innerHTML':
				return DOMAttribute(element.DOM, name, value, signature, xmlns, 2)
			case 'xlink:href':
				return DOMAttribute(element, name, value, signature, xmlns, 1)
			case 'style':
				if (value != null && typeof value !== 'string') {
					if (signature > 1)
						return DOMAttribute(element.DOM, name, patchStyle(element.style, value), signature, xmlns, 0)
					else
						return DOMAttribute(element.DOM, name, element.style = value, signature, xmlns, 0)
				}
			default:
				if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110)
					return commitEvent(element, name.toLowerCase(), value, signature)
	
				DOMAttribute(element.DOM, name, value, signature, xmlns, 4)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} type
	 * @param {(function|EventListener)} listener
	 * @param {number} signature
	 */
	function commitEvent (element, type, listener, signature) {
		switch (signature) {
			case -1:
				if (element.event !== null && element.event.length > 0) {
					delete element.event[type]
	
					if (--element.event.length === 0)
						DOMEvent(element.DOM, type.substring(2), element.event, 0)
				}
				break
			case 0:
				commitEvent(element, type, listener, signature-1)
			case 1:
				if (element.event === null)
					element.event = new Event(element)
	
				element.event[type] = listener
				element.event.length++
	
				DOMEvent(element.DOM, type.substring(2), element.event, 1)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} instance
	 * @param {string} key
	 * @param {(function|string)?} callback
	 * @param {number} signature
	 * @param {*} key
	 */
	function commitReference (element, callback, signature, key) {
		switch (typeof callback) {
			case 'string':
				return commitReference(element, componentReference, signature, callback)
			case 'undefined':
			case 'object':
				return commitReference(element, element.ref || noop, -1, key)
			case 'function':
				switch (signature) {
					case -1:
						return lifecycleCallback(element.host, callback, element.ref = null, key, element)
					case 0:
						element.ref = callback
					case 1:
						lifecycleCallback(element.host, callback, element.instance || element.DOM.node, key, element)
						break
					case 2:
						commitReference(element, callback, -1, key)
						commitReference(element, callback, 0, key)
				}
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function commitText (element, snapshot) {
		DOMValue(element.DOM, element.children = snapshot.children)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function commitRemove (element, parent) {
		if (element.flag > ElementIntermediate)
			DOMRemove(element.DOM, parent.DOM)
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
			return commitInsert(element, elementSibling(sibling, 1), parent)
	
		if (element.flag > ElementIntermediate)
			DOMInsert(element.DOM, sibling.DOM, parent.DOM)
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
			return commitInsert(element, elementSibling(parent, 0), parent)
	
		if (element.flag > ElementIntermediate)
			DOMAppend(element.DOM, parent.DOM)
		else if (element.flag < ElementPortal)
			element.children.forEach(function (children) {
				commitAppend(children, parent)
			})
	}
	
	/**
	 * @param {Object} prev
	 * @param {Object} next
	 */
	function patchStyle (prev, next) {
		var value, delta = {}
	
		for (var key in next)
			switch (value = next[key]) {
				case prev[key]:
					break
				default:
					delta[key] = value
			}
	
		return element.style = next, delta
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 * @param {number} signature
	 */
	function patchProps (element, snapshot, signature) {
		var props = element.props
		var delta = assign({}, props, snapshot.props)
		var xmlns = !!element.xmlns
		var value = null
	
		for (var key in delta)
			switch (value = delta[key]) {
				case props[key]:
					break
				default:
					commitProperty(element, key, value, value == null ? 0 : 2, xmlns)
			}
	
		element.props = snapshot.props
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function patchElement (element, snapshot) {	
		if (snapshot.flag === ElementPromise)
			return commitPromise(element, snapshot)
	
		if (element.key !== snapshot.key || element.type !== snapshot.type)
			return commitMerge(element, snapshot)
				
		switch (element.flag) {
			case ElementPortal:
			case ElementFragment:
				return patchChildren(element, snapshot)
			case ElementComponent:
				return componentUpdate(element, snapshot, 1)
			case ElementText:
				if (element.children !== snapshot.children)
					commitText(element, snapshot)
				break
			case ElementNode:
				patchChildren(element, snapshot)
				patchProps(element, snapshot, 1)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function patchChildren (element, snapshot) {
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
				return patchRemove(aHead, element, children, 0, aLength)
			case bLength:
				return patchInsert(bHead, bHead, element, host, children, 0, bLength, 0)
		}
	
		// non-keyed
		if (!snapshot.keyed) {
			i = aLength > bLength ? bLength : aLength
	
			while (i--) { 
				patchElement(aHead, bHead) 
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
						commitMount(children.push(aHead), aHead, element, host, 0)
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
				patchElement(aHead, bHead)
				aPos++
				bPos++
				
				if (aPos > aEnd || bPos > bEnd) 
					break outer
				
				aHead = aHead.next
				bHead = bHead.next
			}
			while (aTail.key === bTail.key) {
				patchElement(aTail, bTail)
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
					i = 1
				else
					bHead = bHead.next
	
				patchInsert(bHead, aTail, element, host, children, bPos, bEnd, i)
			}
		} else if (bPos > bEnd)
			patchRemove(bEnd+1 < bLength ? aHead : aHead.next, element, children, aPos, aEnd+1)
			else
				patchMove(element, host, children, aHead, bHead, aPos, bPos, aEnd+1, bEnd+1)
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
	function patchMove (element, host, children, aHead, bHead, aPos, bPos, aEnd, bEnd) {
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
	
			patchElement(aNode, bNode)
	
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
	
					patchElement(aNext, bNode)
					delete aPool[bHash]
				} else if (aNode === children)
					commitMount(children.push(bNode), bNode, element, host, 0)
					else
						commitMount(children.insert(bNode, aNode), aNode, element, host, 1)	
	
				bNode = bNext
			}
	
			if (aSize > 0)
				for (bHash in aPool)
					commitUnmount(children.remove(aPool[bHash]), element, 0)
		} else {
			patchRemove(aHead, element, children, 0, aEnd)
			patchInsert(bHead, bHead, element, host, children, 0, bEnd, 0)
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
	function patchInsert (element, sibling, parent, host, children, index, length, signature) {
		var i = index
		var next = element
		var prev = element
	
		while (i++ < length)
			commitMount(children.push((next = (prev = next).next, prev)), sibling, parent, host, signature)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 * @param {List} children
	 * @param {number} index
	 * @param {number} length
	 */
	function patchRemove (element, parent, children, index, length) {
		var i = index
		var next = element
		var prev = element
		
		while (i++ < length)
			commitUnmount(children.remove((next = (prev = next).next, prev)), parent, 0)
	}
	
	/**
	 * @constructor
	 * @param {Object} element
	 */
	function Event (element) {
		this.length = 0
		this.element = element
	}
	/**
	 * @type {Object}
	 */
	Event.prototype = Object.create(null, {
		/**
		 * @param {Event} event
		 */
		handleEvent: {value: function handleEvent (event) {
			try {
				var type = 'on'+event.type
				var callback = this[type]
				var element = this.element
				var host = element.host
				var instance = host.instance
				var state = null
	
				switch (typeof callback) {
					case 'object':
						if (callback && typeof callback.handleEvent === 'function')
							state = callback.handleEvent(event)
						break
					case 'function':
						state = callback.call(instance, event)
				}
	
				if (state && instance)
					lifecycleReturn(host, state)
			} catch (e) {
				Boundary(host, e, type+':'+getDisplayName(callback.handleEvent || callback))
			}
		}}
	})
	
	/**
	 * @param {Element} element
	 * @param {string} from
	 */
	function Exception (element, from) {
		if (!(this instanceof Error))
			return Exception.call(new Error(this), element, from)
	
		var trace = ''
		var tabs = ''
		var host = element
	
		while (host.type) {
			trace += tabs + '<' + getDisplayName(host.type) + '>\n'
			tabs += '  '
			host = host.host
		}
	
		this.from = from
		this.trace = trace
	
		console.error('Error caught in `\n\n'+trace+'\n`'+' from "'+from+'"'+'\n\n'+this.stack+'\n\n')
	
		return this
	}
	
	/**
	 * @param {Element} element
	 * @param {Error} error
	 * @param {string} from
	 * @param {Element?}
	 */
	function Boundary (element, error, from) {
		return Recovery(element, Exception.call(error, element, from), from)
	}
	
	/**
	 * @param {Element} element
	 * @param {Error} error
	 * @param {string} from
	 * @return {Element?}
	 */
	function Recovery (element, error, from) {	
		try {
			var children = elementText('')
	
			if (/on\w+:\w+/.test(from))
				return
	
			if (element && element.owner) {
				if (!element.owner[LifecycleDidCatch])
					return Recovery(element.host, error, from)
	
				element.sync = PriorityTask
				children = commitElement(element.owner[LifecycleDidCatch].call(element.instance, error))
				element.sync = PriorityHigh
			}
	
			if (from === LifecycleRender)
				return children
	
			if (!server)
				patchElement(getHostElement(element), children)
		} catch (e) {
			return Boundary(element.host, e, LifecycleDidCatch)
		}
	}
	
	/**
	 * @return {Node}
	 */
	function DOMDocument () {
		return document.documentElement
	}
	
	/**
	 * @param {Object} element
	 * @param {string} name
	 * @param {*} value
	 */
	function DOMProperty (element, name, value) {
		try {
			element.node[name] = value
		} catch (e) {}
	}
	
	/**
	 * @param {Object} element
	 * @param {string} name
	 * @param {*} value
	 * @param {number} signature
	 * @param {boolean} xmlns
	 * @param {number} type
	 */
	function DOMAttribute (element, name, value, signature, xmlns, type) {
		if (signature > 0)
			switch (type) {
				case 0:
					return merge(element.node[name], value)
				case 1:
					return element.node.setAttributeNS(NSXlink, name, value)
				case 2:
					return DOMProperty(element, name, value)
				case 3:
					if (xmlns === false)
						return DOMProperty(element, name, value)
				default:
					if (xmlns === false && name in element.node)
						switch (name) {
							case 'width':
							case 'height':
								if (typeof value === 'string')
									break
							default:
								return DOMProperty(element, name, value)
						}
	
					if (value !== false)
						element.node.setAttribute(name, value)
					else
						DOMAttribute(element, name, value, -1, xmlns, type)
			}
		else if (type !== 1)
			element.node.removeAttribute(name)
		else
			element.node.removeAttributeNS(name)
	}
	
	/**
	 * @param {Object} element
	 * @param {string} type
	 * @param {(function|EventListener)} listener
	 * @param {number} signature
	 */
	function DOMEvent (element, type, listener, signature) {
		if (signature > 0)
			element.node.addEventListener(type, listener, false)
		else
			element.node.removeEventListener(type, listener, false)
	}
	
	/**
	 * @param {Object} element
	 */
	function DOMContent (element) {
		element.node.textContent = ''
	}
	
	/**
	 * @param {Object} element
	 * @param {(string|number)} value
	 */
	function DOMValue (element, value) {
		element.node.nodeValue = value
	}
	
	/**
	 * @param {(string|number)} value
	 * @return {Object}
	 */
	function DOMText (value) {
		return {node: document.createTextNode(value)}
	}
	
	/**
	 * @param {string} type
	 * @param {string?} xmlns
	 * @return {Object}
	 */
	function DOMElement (type, xmlns) {
		return {node: !xmlns ? document.createElement(type) : document.createElementNS(xmlns, type)}
	}
	
	/**
	 * @param {Object} element
	 * @param {Object} parent
	 */
	function DOMRemove (element, parent) {
		parent.node.removeChild(element.node)
	}
	
	/**
	 * @param {Object} element
	 * @param {Object} sibling
	 * @param {Object} parent
	 */
	function DOMInsert (element, sibling, parent) {
		parent.node.insertBefore(element.node, sibling.node)
	}
	
	/**
	 * @param {Object} element
	 * @param {Object} parent
	 */
	function DOMAppend (element, parent) {
		parent.node.appendChild(element.node)
	}
	
	/**
	 * @param {*} subject
	 * @param {Node?} target
	 */
	function render (subject, target) {
		if (!isValidElement(subject))
			return render(commitElement(subject), target)
		if (!target)
			return render(subject, DOMDocument())
			
		if (root.has(target))
			return patchElement(root.get(target), commitElement(subject))
	
		var element = elementIntermediate(subject)
	
		root.set(element.DOM.node = target, subject)
		commitMount(subject, subject, element, element, (DOMContent(element.DOM), 0))
	}

	/**
	 * @exports
	 */
	exports.version = version
	exports.h = exports.createElement = window.h = createElement
	exports.isValidElement = isValidElement
	exports.cloneElement = cloneElement
	exports.Component = Component
	exports.render = render
	
	if (server)
		__require__('./dio.node.js')(exports, componentMount, commitElement, Element)
}))
