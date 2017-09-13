/*! DIO 8.0.0 @license MIT */

var version = '8.0.0'

var SharedElementPromise = -3
var SharedElementFragment = -2
var SharedElementPortal = -1
var SharedElementEmpty = 0
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

var SharedErrorPassive = -2
var SharedErrorActive = -1

var SharedPropsMount = 1
var SharedPropsUpdate = 2

var SharedSiblingElement = 1
var SharedSiblingChildren = 2

var SharedSiblingPrevious = 'prev'
var SharedSiblingNext = 'next'

var SharedSiteCallback = 'callback'
var SharedSiteRender = 'render'
var SharedSiteConstructor = 'constructor'
var SharedSiteAsync = 'async'
var SharedSiteSetState = 'setState'
var SharedSiteFindDOMNode = 'findDOMNode'

var SharedTypeKey = '.'
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

var SharedDOMObject = {target: null}
var SharedElementObject = {active: false, DOM: null}

var Symbol = window.Symbol || function (d) {return 'Symbol('+d+')'}
var WeakMap = window.WeakMap || WeakHash
var Promise = window.Promise || noop

var root = new WeakMap()
var document = window.document || noop
var requestAnimationFrame = window.requestAnimationFrame || function(c) {setTimeout(c, 16)}
var defineProperty = Object.defineProperty
var defineProperties = Object.defineProperties
var hasOwnProperty = Object.hasOwnProperty
var isArray = Array.isArray

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
			callback.call(this, node = node.next, i)
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
	var value = iterable.next()
	var index = 0

	while (!value.done) {
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

/**
 * @constructor
 * @param {number} id
 */
function Element (id) {
	this.id = id
	this.work = SharedWorkSync
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
function createElementImmutable (element) {
	return assign(new Element(SharedElementNode), element, SharedElementObject)
}

/**
 * @param {*} content
 * @param {*} key
 * @return {Element}
 */
function createElementText (content, key) {
	var element = new Element(SharedElementText)

	element.type = SharedTypeText
	element.key = SharedTypeKey+key
	element.children = content+''

	return element
}

/**
 * @param {DOM?} node
 * @return {Element}
 */
function createElementNode (node) {
	var element = new Element(SharedElementEmpty)

	element.DOM = node

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
		setElementChildren(element, children, iterable, i)
	else if (isArray(iterable))
		for (; i < iterable.length; ++i)
			setElementChildren(element, children, iterable[i], i)				

	setElementBoundary(children)

	return element
}

/**
 * @param {Iterable} iterable
 * @param {Element} element
 */
function createElementIterable (iterable) {	
	var element = createElementFragment(iterable)

	each(iterable, function (value, index) {
		return setElementChildren(element, element.children, value, index)
	})

	return element
}

/**
 * @param {*} element
 * @param {*} key
 * @return {Element}
 */
function createElementBranch (element, key) {
	switch (element.constructor) {
		case Promise:
		case Function:
			return createElement(element)
		case Boolean:
			return createElementText('', key)
		case Date:
			return createElementText(element, key)			
	}

	if (typeof element.next === 'function')
		return createElementIterable(element)
	if (typeof element[SymbolIterator] === 'function')
		return createElementBranch(element[SymbolIterator]())
	if (typeof element === 'function')
		return createElementBranch(element())
	if (element instanceof Error)
		return createElement('details', createElement('summary', element+''), h('pre', element.report || element.stack))

	invariant(SharedSiteRender, 'Invalid element [object '+getDisplayName(element)+']')
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
 * @param {(Element|Array)} children
 * @param {Object} container
 * @param {(string|number|Symbol)=} key
 * @return {Element}
 */
function createPortal (children, container, key) {
	return createElement(container, key !== undefined ? {key: key} : key, children)
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
							props.children = void setElementChildren(element, children, props.children, index)
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
				index = setElementChildren(element, children, arguments[i], index)
		else {
			if (size > 1)
				for (children = []; i < length; ++i)
					children.push(arguments[i])
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
		default:
			if (isValidDOMNode(type))
				element.id = SharedElementPortal

			setElementBoundary(children)
	}

	return element
}

/**
 * @param {Element} parent
 * @param {List} children
 * @param {*} element
 * @param {number} index
 */
function setElementChildren (parent, children, element, index) {
	if (element != null)
		switch (element.constructor) {
			case Element:
				if (element.key === null)
					element.key = SharedTypeKey + index

				children.insert(element.active === false ? element : createElementImmutable(element), children)
				break
			case Array:
				for (var i = 0; i < element.length; ++i)
					setElementChildren(parent, children, element[i], index + i)

				return index + i
			case String:
			case Number:
				children.insert(createElementText(element, index), children)
				break
			default:
				children.insert(createElementBranch(element, index), children)
		}
	else
		children.insert(createElementText('', index), children)

	return index + 1
}

/**
 * @param {List} children
 */
function setElementBoundary (children) {
	var head = createElementText('', SharedTypeKey)
	var tail = createElementText('', SharedTypeKey)
	
	head.xmlns = tail.xmlns = SharedTypeText

	children.insert(head, children)
	children.insert(tail, children.next)
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
 * @param  {Element} element
 * @return {Element}
 */
function getElementChildren (element) {
	return element.children
}

/**
 * @param {Element}
 * @param {Element} 
 */
function getElementParent (element) {
	if (element.id < SharedElementPortal)
		return getElementParent(element.parent)
	
	if (element.id === SharedElementPortal)
		return createElementNode(createDOMObject(element.type))
	else
		return element
}

/**
 * @param {Element} element
 * @return {Element}
 */
function getElementDescription (element) {
	if (isValidElement(element) && element.id === SharedElementComponent)
		return getElementDescription(getElementChildren(element))
	else
		return element
}

/**
 * @param {Element} element
 * @param {string} direction
 * @return {Element} 
 */
function getElementBoundary (element, direction) {
	if (element.id < SharedElementEmpty)
		return getElementBoundary(getElementChildren(element)[direction])
	else
		return element
}

/**
 * @param {Element} element
 * @param {string} direction
 * @return {Element}
 */
function getElementSibling (element, direction) {
	if (isValidElement(element[direction]))
		return element[direction]

	if (getElementDescription(element.host) === element)
		return getElementSibling(element.host, direction)

	return createElementNode(SharedDOMObject)
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
	enqueueStateUpdate(this[SymbolElement], this, state, callback)
}

/**
 * @param {function} callback
 */
function forceUpdate (callback) {
	enqueueComponentUpdate(this[SymbolElement], this, callback, SharedComponentForceUpdate)
}

/**
 * @param {Element} element
 * @return {number}
 */
function mountComponent (element) {
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
		instance.state = getComponentState(element, instance, getLifecycleData(element, SharedGetInitialState))
	else if (!instance.state)
		instance.state = {}

	if (owner[SharedComponentWillMount] && element.work === SharedWorkTask) 
		getLifecycleMount(element, SharedComponentWillMount)
	
	children = element.children = getComponentElement(element, instance)

	if (owner[SharedGetChildContext])
		element.context = getComponentContext(element)

	return children
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {number} signature
 */
function updateComponent (element, snapshot, signature) {
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
				if (getLifecycleUpdate(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext) === false)
					return void (element.work = SharedWorkSync)
	}

	if (owner[SharedComponentWillUpdate])
		getLifecycleUpdate(element, SharedComponentWillUpdate, nextProps, nextState, nextContext)

	if (signature === SharedComponentPropsUpdate)
		instance.props = nextProps

	if (signature === SharedComponentStateUpdate)
		instance.state = nextState

	reconcileElement(getElementChildren(element), getComponentElement(element, instance))

	if (owner[SharedComponentDidUpdate])
		getLifecycleUpdate(element, SharedComponentDidUpdate, prevProps, prevState, nextContext)

	if (element.ref !== snapshot.ref)
		commitReference(element, snapshot.ref, SharedReferenceReplace)

	element.work = SharedWorkSync
}

/**
 * @param {Element} element
 */
function unmountComponent (element) {
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
			enqueueComponentUpdate(instance[SymbolElement], instance, callback, signature)
		})

	if (element.work === SharedWorkTask)
		return void requestAnimationFrame(function () {
			if (element.id === SharedElementComponent)
				enqueueComponentUpdate(element, instance, callback, signature)
		})

	if (!element.active)
		return

	updateComponent(element, element, signature)

	if (typeof callback === 'function')
		enqueueStateCallback(element, instance, callback)
}

/**
 * @param {Element} Element
 * @param {Component} instance
 * @param {(Object|function)} state
 * @param {function?} callback
 */
function enqueueStateUpdate (element, instance, state, callback) {
	if (state)
		switch (state.constructor) {
			case Promise:
				return enqueueStatePromise(element, instance, state, callback)
			case Function:
				return enqueueStateUpdate(element, instance, enqueueStateCallback(element, instance, state), callback)
			default:
				if (element.work !== SharedWorkSync && !element.active)
					return void assign(instance.state, element.state, state)
				else
					element.state = state

				enqueueComponentUpdate(element, instance, callback, SharedComponentStateUpdate)
		}
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
	}).catch(function (e) {
		invokeErrorBoundary(element, e, SharedSiteAsync+':'+SharedSiteSetState, SharedErrorActive)
	})
}

/**
 * @param {Element} element
 * @param {Component} instance
 * @param {function} callback
 */
function enqueueStateCallback (element, instance, callback) {
	try {
		return callback.call(instance, instance.state, instance.props)
	} catch (e) {
		invokeErrorBoundary(element, e, SharedSiteSetState+':'+SharedSiteCallback, SharedErrorActive)
	}
}

/**
 * @param {Element} element
 * @param {Component} instance
 * @param {Object} state
 * @return {Object}
 */
function getComponentState (element, instance, state) {	
	if (state instanceof Object)
		return state

	if (state instanceof Promise)
		enqueueStatePromise(element, instance, state)

	return instance.state || {}
}

/**
 * @param {Element} element
 * @param {function} owner
 * @return {Component}
 */
function getComponentInstance (element, owner) {
	try {
		return new owner(element.props, element.context)
	} catch (e) {
		invokeErrorBoundary(element, e, SharedSiteConstructor, SharedErrorActive)
	}

	return new Component()
}

/**
 * @param {Element} element
 * @param {Component}
 * @return {Element}
 */
function getComponentElement (element, instance) {
	try {
		return commitElement(instance.render(instance.props, instance.state, element.context))
	} catch (e) {
		return commitElement(invokeErrorBoundary(element, e, SharedSiteRender, SharedErrorActive))
	}
}

/**
 * @param {Element} element
 * @return {Object?}
 */
function getComponentContext (element) {
	if (element.owner[SharedGetChildContext])
		return getLifecycleData(element, SharedGetChildContext) || element.context || {}
	else
		return element.context || {}
}

/**
 * @param {Element} element
 * @param {string} name
 */
function getLifecycleData (element, name) {
	try {
		return element.owner[name].call(element.instance, element.props)
	} catch (e) {
		invokeErrorBoundary(element, e, name, SharedErrorActive)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 */
function getLifecycleMount (element, name) {
	try {
		var state = element.owner[name].call(element.instance, element.active && findDOMNode(element))
		
		if (name === SharedComponentWillUnmount && state instanceof Promise)
			return state

		getLifecycleReturn(element, state)
	} catch (e) {
		invokeErrorBoundary(element, e, name, name === SharedComponentWillMount ? SharedErrorActive : SharedErrorPassive)
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
		invokeErrorBoundary(element, e, name, SharedErrorActive)
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
		return callback.call(element.instance, first, second, third)
	} catch (e) {
		invokeErrorBoundary(element, e, SharedSiteCallback, SharedErrorPassive)
	}
}

/**
 * @param {(Component|Node)?} value
 * @param {*} key
 * @param {Element} element
 */
function setComponentReference (value, key, element) {
	if (this.refs) {
		if (key !== element.ref)
			delete this.refs[element.ref]

		this.refs[key] = value
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

	if (element.active && isValidElement(element))
		return getDOMNode(element)

	if (isValidDOMNode(element))
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
				return createElementFragment(element)
			case String:
			case Number:
				return createElementText(element, SharedTypeKey)
			default:
				return createElementBranch(element, SharedTypeKey)
		}

	return createElementText('', SharedTypeKey)
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} host
 * @param {number} signature
 * @param {number} mode
 */
function commitChildren (element, sibling, host, signature, mode) {
	var children = element.children
	var length = children.length
	var next = children.next

	while (length-- > 0) {
		commitMount(next, sibling, element, host, signature, mode)
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
 			
 			commitMount(mountComponent(element), sibling, parent, element, signature, mode)
 			element.DOM = commitCreate(element)

 			if (element.ref)
 				commitReference(element, element.ref, SharedReferenceAssign)
 			
 			if (element.owner[SharedComponentDidMount])
 				getLifecycleMount(element, SharedComponentDidMount)

 			element.work = SharedWorkSync
 			return
 		case SharedElementPromise:
 			commitWillReconcile(element, element)
 		case SharedElementFragment:
 		case SharedElementPortal:
 			element.DOM = parent.DOM
 			commitChildren(element, sibling, host, signature, mode)
 			element.DOM = commitCreate(element)
 			return
 		case SharedElementNode:
 			element.xmlns = getDOMType(element, parent.xmlns)
 		case SharedElementText:
 			switch (mode) {
 				case SharedMountClone:
 					if (element.DOM = commitQuery(element, parent))
	 					break
 				default:
 					element.DOM = commitCreate(element)
 					
 					if (signature < SharedMountInsert)
 						commitAppend(element, parent)
 					else
 						commitInsert(element, sibling, parent)
 			}

 			if (element.id === SharedElementText)
 				return
 	}

 	commitChildren(element, element, host, SharedMountAppend, mode)
 	commitProperties(element, element.props, SharedPropsMount)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 * @param {boolean}
 */
function commitDismount (element, parent, signature) {
	switch (element.id) {
		case SharedElementComponent:
			unmountComponent(element)
			commitDismount(getElementChildren(element), parent, -signature)
		case SharedElementText:
			break
		case SharedElementPortal:
			if (signature < SharedElementEmpty)
				if (parent.id > SharedElementEmpty)
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
 * @return {(Promise|void)}
 */
function commitUnmount (element, parent, signature) {
	if (signature > SharedElementEmpty)
		commitDismount(element, parent, signature)

	if (element.id !== SharedElementComponent)
		return commitRemove(element, parent)

	if (element.state)
		return element.state
			.then(commitWillUnmount(element, parent, SharedElementEmpty))
			.catch(commitWillUnmount(element, parent, SharedErrorPassive))

	if (!element.active)
		commitUnmount(getElementChildren(element), parent, SharedElementEmpty)
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {number} signature
 * @return {function}
 */
function commitWillUnmount (element, parent, signature) {	
	return function (e) {
		commitUnmount(getElementChildren(element), parent)

		if (signature === SharedErrorPassive)
			invokeErrorBoundary(element, e, SharedSiteAsync+':'+SharedComponentWillUnmount, signature)
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function commitWillReconcile (element, snapshot) {
	snapshot.type.then(function (value) {
		if (element.active)
			if (element.id === SharedElementPromise)
				reconcileChildren(element, createElementFragment(commitElement(value)))
			else
				reconcileElement(element, commitElement(value))
	}).catch(function (e) {
		invokeErrorBoundary(element, e, SharedSiteAsync+':'+SharedSiteRender, SharedErrorActive)
	})
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} parent
 * @param {Element} host
 * @param {number} signature
 */
function commitReplace (element, snapshot, parent, host, signature) {
	if (signature === SharedMountReplace)
		if (element.state instanceof Promise)
			return element.state = commitWillReplace(element, snapshot, parent, host, signature)
		else if (element.state = commitUnmount(element, parent, signature))
			return commitWillReplace(element, snapshot, parent, host, -signature)

	commitMount(snapshot, getElementSibling(element, SharedSiblingNext), parent, host, SharedMountInsert, SharedMountCommit)
	
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
 * @param {Element} snapshot
 * @param {Element} parent
 * @param {Element} host
 * @param {number} signature
 */
function commitWillReplace (element, snapshot, parent, host, signature) {
	return void element.state.then(function () {
		commitReplace(element, snapshot, parent, host, signature)
	}).catch(function () {
		invokeErrorBoundary(snapshot, e, SharedSiteRender, SharedErrorActive)
	})
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
			return commitReference(element, setComponentReference, signature, callback)			
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
 * @return {Object}
 */
function commitCreate (element) {
	try {		
		switch ((element.active = true, element.id)) {
			case SharedElementNode:
				return createDOMElement(element)
			case SharedElementText:
				return createDOMText(element)
			case SharedElementComponent:
				return getElementChildren(element).DOM
			default:
				return createDOMObject(getDOMNode(getElementBoundary(element, SharedSiblingNext)))
		}
	} catch (e) {
		return commitDOMNode(commitElement(invokeErrorBoundary(element, e, SharedSiteRender, SharedErrorActive)))
	}
}

/**
 * @param {Element} element
 * @param {Element} parent
 * @param {boolean} signature
 * @return {DOM?}
 */
function commitQuery (element, parent, signature) {
	if (element.active = true)
		return getDOMQuery(
			element,
			parent,
			getElementSibling(element, SharedSiblingPrevious),
			getElementSibling(element, SharedSiblingNext)
		)
}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function commitValue (element, value) {
	setDOMValue(element, value)
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitRemove (element, parent) {
	if (parent.id < SharedElementEmpty)
		return commitRemove(element, getElementParent(parent))

	if (element.id > SharedElementEmpty)
		removeDOMNode(element, parent)
	else
		getElementChildren(element).forEach(function (children) {
			commitRemove(children, element)
		})
}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function commitInsert (element, sibling, parent) {
	if (parent.id < SharedElementEmpty)
		return commitInsert(element, sibling, getElementParent(parent))

	if (sibling.id === SharedElementPortal)
		return commitInsert(element, getElementSibling(sibling, SharedSiblingNext), parent)

	if (element.id > SharedElementEmpty)
		insertDOMNode(element, sibling, parent)
	else
		getElementChildren(element).forEach(function (children) {
			commitInsert(children, sibling, element)
		})
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function commitAppend (element, parent) {
	if (parent.id < SharedElementEmpty)
		if (parent.active)
			return commitInsert(element, getElementBoundary(parent, SharedSiblingPrevious), parent)
		else
			return commitAppend(element, getElementParent(parent))

	if (element.id > SharedElementEmpty)
		appendDOMNode(element, parent)
	else
		getElementChildren(element).forEach(function (children) {
			commitAppend(children, element)
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
			delta[(length++, key)] = undefined

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
		return commitReplace(element, snapshot, element.parent, element.host, SharedMountReplace)

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
	var aLength = children.length
	var bLength = siblings.length

	if (aLength+bLength === 0)
		return

	var aPos = 0
	var bPos = 0
	var aEnd = aLength - 1
	var bEnd = bLength - 1
	var aHead = children.next
	var bHead = siblings.next
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
	if (aPos > aEnd++) {
		if (bPos <= bEnd++) {
			if (bEnd < bLength) 
				signature = SharedMountInsert
			else if (aLength > 0)
				bHead = bHead.next

			while (bPos++ < bEnd) {
				bHead = (aHead = bHead).next
				commitMount(children.insert(aHead, aTail), aTail, element, host, signature, SharedMountCommit)
			}
		}
	} else if (bPos > bEnd++) {
		if (bEnd === bLength && bLength > 0)
			aHead = aHead.next

		while (aPos++ < aEnd) {
			aHead = (bHead = aHead).next
			commitUnmount(children.remove(bHead), element, SharedMountRemove)
		}
	} else {
		reconcileSiblings(element, host, children, aHead, bHead, aPos, bPos, aEnd, bEnd)
	}
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
function reconcileSiblings (element, host, children, aHead, bHead, aPos, bPos, aEnd, bEnd) {
	var aIndx = aPos
	var bIndx = bPos
	var aNode = aHead
	var bNode = bHead
	var aNext = aHead
	var bNext = bHead
	var bHash = ''
	var aSize = 0
	var aPool = {}

	// step 3, hashmap
	while (aIndx < aEnd)
		if (aNode.key !== bNode.key) {
			aPool[aNode.key] = aNode
			aNode = aNode.next
			aSize++
			aIndx++
		} else {
			reconcileElement(aNode, bNode)
			aNode = aNode.next
			bNode = bNode.next
			aIndx++
			bIndx++
		}

	// step 4, insert/append
	while (bIndx++ < bEnd) {
		bHash = bNode.key
		bNext = bNode.next
		aNext = aPool[bHash]

		if (aNext = aPool[bHash]) {
			if (aNode === children)
				commitAppend(children.insert(children.remove(aNext), aNode), element)
			else
				commitInsert(children.insert(children.remove(aNext), aNode), aNode, element)

			reconcileElement(aNext, bNode)
			
			if (delete aPool[bHash])
				aSize--
		} else if (aNode === children)
			commitMount(children.insert(bNode, aNode), bNode, element, host, SharedMountAppend, SharedMountCommit)
		else
			commitMount(children.insert(bNode, aNode), aNode, element, host, SharedMountInsert, SharedMountCommit)	

		bNode = bNext
	}

	// step 5, remove
	if (aSize > 0)
		for (bHash in aPool)
			commitUnmount(children.remove(aPool[bHash]), element, SharedMountRemove)
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
		invokeErrorBoundary(host, e, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), SharedErrorPassive)
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
function invokeErrorBoundary (element, e, from, signature) {
	var error = getErrorException(element, e, from)
	var element = getErrorElement(element, error, from, signature)

	if (error.report)
		console.error(error.report)

	return element
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 */
function getErrorException (element, error, from) {
	if (!(error instanceof Error))
		return getErrorException(element, new Error(error), from)

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
 * @param {Element} element
 * @param {Object} snapshot
 * @param {Error} error
 * @param {string} from
 * @param {number} signature
 * @return {Element?}
 */
function getErrorElement (element, error, from, signature) {	
	var snapshot

	if (signature === SharedErrorPassive || !element || element.id === SharedElementEmpty)
		return

	if (element.owner && element.owner[SharedComponentDidCatch])
		try {
			element.sync = SharedWorkTask
			snapshot = element.owner[SharedComponentDidCatch].call(element.instance, error, {})
			element.sync = SharedWorkSync
		} catch (e) {
			return invokeErrorBoundary(element.host, e, SharedComponentDidCatch, signature)
		}
	else
		getErrorElement(element.host, error, from, signature)

	if (from === SharedSiteRender)
		return commitElement(snapshot)

	if (element.active)
		requestAnimationFrame(function () {
			reconcileElement(getElementDescription(element), commitElement(snapshot))
		})
}

/**
 * @param {Element} element
 * @param {Node} target
 * @param {function=} callback
 */
function render (element, target, callback) {	
	if (!target)
		return render(element, getDOMDocument(), callback)

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
		return hydrate(element, getDOMDocument(), callback)
	
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
		return mount(element, createElementNode(createDOMObject(parent)), callback, mode)

	if (!isValidDOMNode(getDOMNode(parent)))
		invariant(SharedSiteRender, 'Target container is not a DOM element')

	root.set(getDOMNode(parent), element)

	if (mode === SharedMountCommit)
		setDOMContent(parent)
	
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
				return array.push(value)
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

/**
 * @param {Node} target
 */
function DOM (target) {
	return {target: target}
}

/**
 * @param {Node} target
 * @param {boolean}
 */
function isValidDOMNode (target) {
	return !!(target && target.ELEMENT_NODE)
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
 */
function setDOMContent (element) {
	getDOMNode(element).textContent = ''
}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function setDOMValue (element, value) {
	getDOMNode(element).nodeValue = value
}

/**
 * @param {Element} element
 * @param {Object} declaration
 */
function setDOMStyle (element, declaration) {
	for (var key in declaration) {
		var value = declaration[key]

		if (key.indexOf('-') < 0)
			getDOMNode(element).style[key] = value !== false && value !== undefined ? value : null
		else
			getDOMNode(element).style.setProperty(key, value)
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
			return setDOMProperty(element, name, '')
	}

	getDOMNode(element)[name] = value
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
			if (!xmlns)
				getDOMNode(element).removeAttribute(name)
			else
				getDOMNode(element).removeAttributeNS(xmlns, name)
			return
		case true:
			return setDOMAttribute(element, name, '', xmlns)
	}

	if (!xmlns)
		getDOMNode(element).setAttribute(name, value)
	else
		getDOMNode(element).setAttributeNS(xmlns, name, value)
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
		case 'dangerouslySetInnerHTML':
			return setDOMProperties(element, 'innerHTML', value ? value.__html : '', '')
		case 'innerHTML':
			if (getDOMNode(element)[name] !== value)
				setDOMProperty(element, name, value)
			return
		case 'width':
		case 'height':
			if (element.type === 'img')
				break
		default:
			if (!xmlns && name in getDOMNode(element))
				return setDOMProperty(element, name, value)
	}

	if (typeof value === 'object')
		setDOMProperty(element, name, value)
	else 
		setDOMAttribute(element, name, value, '')
}

/**
 * @return {Node}
 */
function getDOMDocument () {
	return document.documentElement
}

/**
 * @param {Element} element
 * @return {Node}
 */
function getDOMNode (element) {
	return element.DOM.target
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
 * @param {Element} parent
 * @param {Element} prev
 * @param {Element} next
 */
function getDOMQuery (element, parent, prev, next) {
	var type = element.type.toLowerCase()
	var xmlns = element.xmlns
	var children = element.children
	var node = null
	var previous = prev.active && getDOMNode(prev)
	var target = previous ? previous.nextSibling : getDOMNode(parent).firstChild 
	var current = target
	var sibling = target

	while (target)
		switch (target.nodeName.toLowerCase()) {
			case type:
				if (type === '#text') {
					if (element !== next && element.id === next.id)
						target.splitText(children.length)

					if (target.nodeValue !== children)
						target.nodeValue = children
				}

				node = DOM(target)
				type = ''

				if (!(target = target.nextSibling) || next !== element)
					break
		default:
			if (type === '#text' && (xmlns === type || children.length === 0))
				if (getDOMNode(parent).insertBefore((node = createDOMText(element)).target, target))
					return node

			target = (sibling = target).nextSibling

			if (!previous || current !== sibling)
				sibling.parentNode.removeChild(sibling)
		}

	return node
}

/**
 * @param {Node} target
 * @return {DOM}
 */
function createDOMObject (target) {
	return DOM(target)
}

/**
 * @param {Element} element
 * @return {DOM}
 */
function createDOMElement (element) {
	if (element.xmlns)
		return DOM(document.createElementNS(element.xmlns, element.type))
	else
		return DOM(document.createElement(element.type))
}

/**
 * @param {Element} element
 * @return {DOM}
 */
function createDOMText (element) {
	return DOM(document.createTextNode(element.children))
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

var exports = {}

exports.version = version
exports.render = render
exports.hydrate = hydrate
exports.Component = Component
exports.PureComponent = PureComponent
exports.Children = Children
exports.findDOMNode = findDOMNode
exports.cloneElement = cloneElement
exports.isValidElement = isValidElement
exports.createPortal = createPortal
exports.createElement = createElement
exports.h = window.h = createElement

export default exports
export {
	version,
	render,
	hydrate,
	Component,
	PureComponent,
	Children,
	findDOMNode,
	cloneElement,
	isValidElement,
	createPortal,
	createElement,
	createElement as h
}
