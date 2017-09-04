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

	if (!prototype.hasOwnProperty(SharedSiteRender))
		defineProperty(prototype, SharedSiteRender, {value: noop, writable: true})
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
	var prototype = owner.prototype
	var instance

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
	element.context = element.context || {}
	
	instance[SymbolElement] = element
	instance.refs = {}
	instance.props = element.props
	instance.context = element.context

	if (owner[SharedGetInitialState])
		instance.state = getInitialState(element, instance, getLifecycleData(element, SharedGetInitialState))
	else if (!instance.state)
		instance.state = {}
	
	element.children = getChildElement(element)
	element.children.context = element.context

	if (owner[SharedComponentWillMount] && element.work === SharedWorkTask) 
		getLifecycleMount(element, SharedComponentWillMount)

	if (owner[SharedGetChildContext])
		element.context = getChildContext(element)

	return element.children
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
				element.state = element.work !== SharedWorkTask ? state : assign(instance.state, element.state, state)

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
