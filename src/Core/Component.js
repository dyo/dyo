/**
 * @constructor
 */
function Component (props, context) {
	this.refs = null
	this.state = null
	this.props = props
	this.context = context
	this[UUID] = null
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
	enqueueState(this[UUID], this, state, callback)
}

/**
 * @param {function} callback
 */
function forceUpdate (callback) {
	enqueueUpdate(this[UUID], this, callback, 0)
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
	
	instance[UUID] = element	
	instance.refs = {}
	instance.props = element.props
	instance.context = element.context = element.context || {}

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
		return WorkTask
	
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
					return element.work = WorkSync
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

	return element.work = WorkSync
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
		errorBoundary(element, e, LifecycleCallback+':'+getDisplayName(callback), 1)
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
		errorBoundary(element.host, e, LifecycleConstructor, 1)
		return new Component()
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
		return errorBoundary(element, e, LifecycleRender, 1)
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
	return isValidElement(element) ? element : element[UUID]
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
