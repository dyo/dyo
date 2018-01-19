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
		defineProperty(instance = new Component(), SharedSiteRender, {value: owner, writable: true})
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

	if (owner[SharedComponentWillMount])
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

	if (element.active)
		updateComponent(element, element, signature)
	else
		instance.state = assign({}, instance.state, element.state)

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

	switch (typeof state) {
		case 'function':
			return enqueueStateUpdate(element, instance, enqueueStateCallback(element, instance, state), callback)
		case 'object':
			element.state = state
	}

	if (typeof state.then === 'function')
		if (element.active)
			return enqueueStatePromise(element, instance, state, callback)

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
