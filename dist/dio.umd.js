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
			for (var i = 0, element = this; i < this.length; ++i)
				callback.call(this, element = element.next, i)
		}}
	})
	
	/**
	 * @constructor
	 */
	function Hash () {
		this.hash = ''
	}
	Hash.prototype = Object.create(null, {
		constructor: {value: Hash},
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
	 * @param {function} callback
	 */
	function enqueue (callback) {
		requestAnimationFrame(callback, 16)
	}
	
	/**
	 * @param {string} from
	 * @param {string} message
	 */
	function invariant (from, message) {
		throw new Error('#'+from+'(...): '+message+'.')
	}
	
	var Node = window.Node || noop
	var Symbol = window.Symbol || noop
	var Iterator = Symbol.iterator
	var Promise = window.Promise || noop
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
	
	var WorkTask = 0
	var WorkSync = 1
	
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
		this.host = null
		this.parent = null
		this.event = null
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
	 * @param {Object} object
	 * @return {Element}
	 */
	function elementIntermediate (object) {
		var element = new Element(ElementIntermediate)
	
		element.context = {}
		element.DOM = object
	
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
	 * @param {string} summary
	 * @param {string} details
	 * @return {Element}
	 */
	function elementError (summary, details) {
		return createElement('details', createElement('summary', summary), h('pre', details))
	}
	
	/**
	 * @param {*} child
	 * @return {Element}
	 */
	function elementUnknown (child) {
		if (typeof child.next === 'function')
			return elementIterable(child, elementFragment(child))
		if (typeof child[Iterator] === 'function')
			return elementUnknown(child[Iterator]())
		else if (typeof child === 'function')
			return elementUnknown(child())
		else if (child.constructor === Error)
			return elementError(child+'', (child.children||'')+'\n'+child.stack)
		else
			return createElement('pre', JSON.stringify(child, null, 2))
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
						child.key += '#'+index
					else if (element.keyed === false)
						element.keyed = true
	
					children.push(child)
					break
				case Array:
					for (var i = 0; i < child.length; ++i)
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
		var children
		
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
				for (children = element.children = new List(); i < length; ++i)
					index = elementChildren(element, children, arguments[i], index)
			else {
				if (size > 1)
					for (children = Array(size); i < length; ++i)
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
				if (!server)
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
			errorBoundary(element, e, LifecycleCallback)
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
			errorBoundary(element, e, name)
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 */
	function lifecycleMount (element, name) {
		try {
			var state = element.owner[name].call(element.instance, findDOMNode(element))
			
			if (state instanceof Promise)
				return state
	
			lifecycleReturn(element, state)
		} catch (e) {
			errorBoundary(element, e, name)
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
	
			if (typeof state !== 'object')
				return state
	
			lifecycleReturn(element, state)
		} catch (e) {
			errorBoundary(element, e, name)
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
	var ComponentMethod = {
		forceUpdate: {value: forceUpdate},
		setState: {value: setState}
	}
	/**
	 * @type {Object}
	 */
	var ComponentDefault = {
		constructor: {value: Component},
		render: {value: noop}
	}
	/**
	 * @type {Object}
	 */
	Component.prototype = Object.create(null, merge(ComponentDefault, ComponentMethod))
	
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
	 * @param {Element} element
	 * @return {number}
	 */
	function componentMount (element) {
		var owner = element.type
		var prototype = owner.prototype
		var instance
		var children
	
		if (prototype && prototype.render) {
			if (!prototype.setState)
				Object.defineProperties(prototype, ComponentMethod)
	
			instance = owner = getChildInstance(element)
		} else {
			instance = new Component()
			instance.render = owner
		}
	
		element.owner = owner
		element.instance = instance
		
		instance.refs = {}
		instance.props = element.props
		instance.context = element.context = element.context || {}
		instance.children = element
	
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
		if (element.work < WorkSync)
			return
	
		element.work = WorkTask
	
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
	
		reconcileElement(element.children, getChildElement(element))
	
		if (owner[LifecycleDidUpdate])
			lifecycleUpdate(element, LifecycleDidUpdate, prevProps, prevState, context)
	
		if (element.ref !== snapshot.ref)
			commitReference(element, snapshot.ref, 2)
	
		element.work = WorkSync
	}
	
	/**
	 * @param {Element} element
	 * @param {List} children
	 * @param {Element} parent
	 * @param {number} signature
	 * @param {number} resolve
	 */
	function componentUnmount (element, children, parent, signature, resolve) {
		if (resolve > 0 && element.owner[LifecycleWillUnmount])
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
					element.state = element.work === WorkSync ? state : assign({}, element.state, state)
	
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
			errorBoundary(element, e, LifecycleCallback+':'+getDisplayName(callback))
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
			enqueue(function () {
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
			return enqueue(function () {
				enqueueUpdate(getHostChildren(instance), instance, callback, signature)
			})
	
		if (element.work < WorkSync)
			return enqueue(function () {
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
			return errorBoundary(element.host, e, LifecycleConstructor), new Component()
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
			return errorBoundary(element, e, LifecycleRender)
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
				reconcileChildren(element, elementFragment(commitElement(value)))
			else
				reconcileElement(element, commitElement(value))
		})
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
	 * @param {Element} parent
	 * @return {string}
	 */
	function commitXmlns (element, parent) {
		switch (element.type) {
			case 'svg':
				return 'http://www.w3.org/2000/svg'
			case 'math':
				return 'http://www.w3.org/1998/Math/MathML'
		}
	
		return parent.xmlns && !element.xmlns && parent.type !== 'foreignObject' ? parent.xmlns : ''
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
	 			element.work = WorkTask
	 			
	 			componentMount(element)
	
	 			if (element.owner[LifecycleWillMount]) 
	 				lifecycleMount(element, LifecycleWillMount)
	
	 			commitMount(element.children, sibling, parent, element, signature)
	
	 			if ((element.DOM = element.children.DOM, element.ref)) 
	 				commitReference(element, element.ref, 1)
	 			
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
	 			element.DOM = DOM(parent.DOM.target)
	 			break
	 		case ElementNode:
	 			element.xmlns = commitXmlns(element, parent)
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
	 * @param {(boolean|void)}
	 */
	function commitUnmount (element, parent, signature) {
		if (element.flag === ElementComponent)
			return componentUnmount(element, element.children, parent, signature, 1)
	
		commitRemove(element, parent)
		commitDemount(element, 1, signature)
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
	
		if (element.ref)
			commitReference(element, element.ref, -1)
	
		if (signature < 1) {
			element.context = null
			element.state = null
			element.event = null
			element.DOM = null
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function commitMerge (element, snapshot) {
		if (commitUnmount(element, element.parent, 1))
			element.state.then(function () {
				commitRebase(element, snapshot)
			})
		else
			commitRebase(element, snapshot)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function commitRebase (element, snapshot) {
		commitMount(snapshot, elementSibling(element, 0), element.parent, element.host, 1)
	
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
						lifecycleCallback(element.host, callback, element.instance || findDOMNode(element), key, element)
						break
					case 2:
						commitReference(element, callback, -1, key)
						commitReference(element, callback, 0, key)
				}
		}
	}
	
	/**
	 * @param {Element} element
	 */
	function commitProperties (element) {
		var xmlns = element.xmlns
		var props = element.props
	
		for (var key in props)
			commitProperty(element, key, props[key], xmlns, props[key] != null ? 1 : 0)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {boolean} xmlns
	 * @param {number} signature
	 */
	function commitProperty (element, name, value, xmlns, signature) {	
		switch (name) {
			case 'ref':
				commitReference(element, value, signature)
			case 'key':
			case 'xmlns':
			case 'children':
				break
			case 'className':
				if (xmlns)
					return commitProperty(element, 'class', value, !xmlns, signature)
			case 'id':
				return commitAttribute(element, name, value, xmlns, 3, signature)
			case 'innerHTML':
				return commitAttribute(element, name, value, xmlns, 2, signature)
			case 'dangerouslySetInnerHTML':
				if (signature > 1 && (!value || !element.props[name] || element.props[name].__html !== value.__html))
					return
	
				return commitProperty(element, 'innerHTML', value ? value.__html : '', xmlns, 2, signature)
			case 'xlink:href':
				return commitAttribute(element, name, value, xmlns, 1, signature)
			case 'style':
				if (typeof value === 'object' && value !== null)
					return commitStyle(element, name, value, 0)
			default:
				if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110)
					return commitEvent(element, name.toLowerCase(), value)
	
				commitAttribute(element, name, value, xmlns, 4, signature)
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
		
		element.event[type] = callback
		Event.addEventListener(element, type)
	}
	
	/**
	 * @param {Element} element
	 * @return {Object}
	 */
	function commitDOM (element) {
		try {
			return element.flag === ElementNode ? DOMElement(element.type, element.xmlns) : DOMText(element.children)
		} catch (e) {
			return commitDOM(errorBoundary(element, e, LifecycleRender))
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Object} value
	 * @param {number} signature
	 */
	function commitStyle (element, name, value, signature) {
		DOMStyle(element, name, value, signature)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {boolean} xmlns
	 * @param {number} signature
	 * @param {boolean} hash
	 */
	function commitAttribute (element, name, value, xmlns, hash, signature) {
		DOMAttribute(element, name, value, xmlns, hash, signature)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function commitText (element, snapshot) {
		DOMValue(element, element.children = snapshot.children)
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
			return commitInsert(element, elementSibling(sibling, 1), parent)
	
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
			return commitInsert(element, elementSibling(parent, 0), parent)
	
		if (element.flag > ElementIntermediate)
			DOMAppend(element, parent)
		else if (element.flag < ElementPortal)
			element.children.forEach(function (children) {
				commitAppend(children, parent)
			})
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function reconcileProperties (element, snapshot) {
		var xmlns = element.xmlns
		var next = snapshot.props
		var prev = element.props
		var value = null
		var style = null
	
		for (var key in prev)
			if (next[key] == null)
				commitProperty(element, key, value, xmlns, 0)
	
		for (var key in next)
			if ((value = next[key]) !== (style = prev[key]))
				if (key !== 'style' || typeof value !== 'object') {
					commitProperty(element, key, value, xmlns, 1)
				} else {
					for (var name in style)
						if (!value || value[name] == null)
							commitStyle(element, name, null, 1)
	
					for (var name in value)
						if (!style || value[name] !== style[name])
							commitStyle(element, name, value[name], 1)
				}
	
		element.props = next
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} snapshot
	 */
	function reconcileElement (element, snapshot) {	
		if (snapshot.flag === ElementPromise)
			return commitPromise(element, snapshot)
	
		if (element.key !== snapshot.key || element.type !== snapshot.type)
			return commitMerge(element, snapshot)
	
		switch (element.flag) {
			case ElementPortal:
			case ElementFragment:
				return reconcileChildren(element, snapshot)
			case ElementComponent:
				return componentUpdate(element, snapshot, 1)
			case ElementText:
				if (element.children !== snapshot.children)
					commitText(element, snapshot)
				break
			case ElementNode:
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
				return reconcileInsert(bHead, bHead, element, host, children, 0, bLength, 0)
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
			if (bPos <= bEnd++)
				reconcileInsert(bEnd < bLength ? (i = 1, bHead) : bHead.next, aTail, element, host, children, bPos, bEnd, i)
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
			reconcileRemove(aHead, element, children, 0, aEnd)
			reconcileInsert(bHead, bHead, element, host, children, 0, bEnd, 0)
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
			commitMount(children.push((next = (prev = next).next, prev)), sibling, parent, host, signature)
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
	 * @type {Object}
	 */
	var Event = {
		/**
		 * @param {Element} element
		 * @param {string} type
		 */
		addEventListener: function addEventListener (element, type) {
			if (!this[type]) {
				this[type] = new Map()
				DOMEvent(type.substring(2), this, true)
			}
	
			this[type].set(element.DOM.target, element)
		},
		/**
		 * @param {Event} event
		 */
		handleEvent: function handleEvent (event) {
			var type = 'on'+event.type
			var element = this[type].get(event.target)
	
			if (element)
				try {
					var host = element.host
					var instance = host.instance
					var callback = element.event[type]
					var state = null
	
					if (!callback)
						return
	
					if (typeof callback === 'function')
						state = callback.call(instance, event)
					else if (typeof callback.handleEvent === 'function')
						state = callback.handleEvent(event)
	
					if (instance && state)
						lifecycleReturn(host, state)
				} catch (e) {
					errorBoundary(host, e, type+':'+getDisplayName(callback.handleEvent || callback))
				}
		}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} from
	 */
	function errorException (element, from) {
		if (!(this instanceof Error))
			return errorException.call(new Error(this), element, from)
	
		var children = ''
		var tabs = ''
		var host = element
		var stack = this.stack
	
		while (host.type) {
			children += tabs + '<' + getDisplayName(host.type) + '>\n'
			tabs += '  '
			host = host.host
		}
	
		this.children = children
		this.from = from
	
		console.error('Error caught in `\n\n'+children+'\n` from "'+from+'"\n\n'+stack+'\n\n')
		
		return this
	}
	
	/**
	 * @param {Element} element
	 * @param {Error} error
	 * @param {string} from
	 * @param {Element?}
	 */
	function errorBoundary (element, error, from) {
		return errorRecovery(element, errorException.call(error, element, from), from)
	}
	
	/**
	 * @param {Element} element
	 * @param {Error} error
	 * @param {string} from
	 * @return {Element}
	 */
	function errorRecovery (element, error, from) {	
		var children = elementText('')
	
		try {
			if (!/on\w+:\w+/.test(from)) {
					if (element.owner && element.owner[LifecycleDidCatch]) {
						element.work = WorkTask
						children = commitElement(element.owner[LifecycleDidCatch].call(element.instance, error))
						element.work = WorkSync
					} else if (element.host.owner)
						enqueue(function () {
							errorBoundary(element.host, error, from)
						})
	
				if (from !== LifecycleRender && !server)
					enqueue(function () {
						reconcileElement(getHostElement(element), children)
					})
			}
		} catch (e) {
			enqueue(function () {
				errorBoundary(element.host, e, LifecycleDidCatch)
			})
		}
	
		return children
	}
	
	/**
	 * @param {Node} target
	 */
	function DOM (target) {
		return {target: target}
	}
	
	/**
	 * @return {Node}
	 */
	function DOMRoot () {
		return document.documentElement
	}
	
	/**
	 * @param {Node} target
	 * @param {boolean}
	 */
	function DOMValid (target) {
		return target instanceof Node
	}
	
	/**
	 * @param {string} type
	 * @param {string} xmlns
	 * @return {DOM}
	 */
	function DOMElement (type, xmlns) {
		return DOM(xmlns ? document.createElementNS(xmlns, type) : document.createElement(type))
	}
	
	/**
	 * @param {(string|number)} value
	 * @return {DOM}
	 */
	function DOMText (value) {
		return DOM(document.createTextNode(value))
	}
	
	/**
	 * @param {string} type
	 * @param {EventListener} listener
	 * @param {*} options
	 */
	function DOMEvent (type, listener, options) {
		document.addEventListener(type, listener, options)
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
		if (signature < 1)
			return hash !== 1 ? element.DOM.target.removeAttribute(name) : element.DOM.target.removeAttributeNS(name)
	
		switch (hash) {
			case 1:
				return element.DOM.target.setAttributeNS('http://www.w3.org/1999/xlink', name, value)
			case 2:
				return DOMProperty(element, name, value)
			case 3:
				if (!xmlns)
					return DOMProperty(element, name, value)
		}
	
		if (!xmlns && name in element.DOM.target)
			switch (name) {
				case 'width':
				case 'height':
					if (element.type === 'img')
						break
				default:
					return DOMProperty(element, name, value)
			}
	
		if (value !== false)
			element.DOM.target.setAttribute(name, value)
		else
			DOMAttribute(element, name, value, xmlns, hash, -1)
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 */
	function DOMProperty (element, name, value) {
		try {
			element.DOM.target[name] = value
		} catch (e) {}
	}
	
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {*} value
	 * @param {number} signature
	 */
	function DOMStyle (element, name, value, signature) {
		if (signature > 0) {
			if (name.indexOf('-') < 0)
				element.DOM.target.style[name] = value
			else
				element.DOM.target.style[value != null ? 'setProperty' : 'removeProperty'](name, value)
		} else
			for (var key in value)
				DOMStyle(element, key, value[key], 1)
	}
	
	/**
	 * @param {Element} element
	 */
	function DOMContent (element) {
		element.DOM.target.textContent = ''
	}
	
	/**
	 * @param {Element} element
	 * @param {(string|number)} value
	 */
	function DOMValue (element, value) {
		element.DOM.target.nodeValue = value
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function DOMRemove (element, parent) {
		parent.DOM.target.removeChild(element.DOM.target)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @param {Element} parent
	 */
	function DOMInsert (element, sibling, parent) {
		parent.DOM.target.insertBefore(element.DOM.target, sibling.DOM.target)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} parent
	 */
	function DOMAppend (element, parent) {
		parent.DOM.target.appendChild(element.DOM.target)
	}
	
	/**
	 * @param {Element} subject
	 * @param {Node} target
	 */
	function render (subject, target) {
		if (!isValidElement(subject))
			return render(commitElement(subject), target)
		
		if (!target)
			return render(subject, DOMRoot())
			
		if (root.has(target))
			return reconcileElement(root.get(target), commitElement(subject))
	
		mount(subject, elementIntermediate(DOM(target)), target)	
	}
	
	/**
	 * @param {Element} subject
	 * @param {Element} parent
	 * @param {Node} target
	 */
	function mount (subject, parent, target) {
		if (!DOMValid(target))
			return invariant('render', 'Target container is not a DOM element')
	
		root.set(target, subject)
	
		commitContent(parent)
		commitMount(subject, subject, parent, parent, 0)
	}
	
	/**
	 * @param {(Component|Element|DOM|Node)} element
	 * @return {Node?}
	 */
	function findDOMNode (element) {
		if (element) {
			if (DOMValid(element))
				return element
	
			if (DOMValid(element.target))
				return element.target
	
			if (isValidElement(element.children))
				return findDOMNode(element.children)
	
			if (isValidElement(element))
				return findDOMNode(element.flag > ElementFragment ? element.DOM : elementSibling(element, 1))
		}
	
		return null
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
			else if (typeof children !== 'object')
				return [children]
			else if (children instanceof Array)
				array = children
			else if (typeof children.next === 'function')
				each(children, function (value) {
					array.push(value)
				})
			else if (typeof children[Iterator] === 'function')
				return this.toArray(child[Iterator]())
	
			return flatten(children, [])
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
	 * @exports
	 */
	exports.version = version
	exports.render = render
	exports.Component = Component
	exports.Children = Children
	exports.findDOMNode = findDOMNode
	exports.cloneElement = cloneElement
	exports.isValidElement = isValidElement
	exports.h = exports.createElement = window.h = createElement
	
	if (server)
		__require__('./dio.node.js')(exports, componentMount, commitElement, Element)
}))
