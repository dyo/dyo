/**
 * @constructor
 * @param {Object?} props
 * @param {Object?} context
 */
function Component (props, context) {
	this.refs = {}
	this.state = {}
	this.props = props
	this.context = context
}
/**
 * @type {Object}
 */
Component[SharedSitePrototype] = createComponentPrototype(Component[SharedSitePrototype])

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
PureComponent[SharedSitePrototype] = create(Component[SharedSitePrototype], {
	shouldComponentUpdate: {value: shouldComponentUpdate}
})

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
 * @param {object} description
 * @return {function}
 */
function createClass (description) {
	return createComponentClass(Object(description), getDisplayName(description))
}

/**
 * @param {object} description
 * @param {string} displayName
 * @return {function}
 */
function createComponentClass (description, displayName) {
	switch (typeof description) {
		case 'function':
			return description[SymbolComponent] = createComponentClass(merge({render: description}, description))
		case 'object':
			for (var name in description)
				description[name] = {value: description[name]}
	}

	function klass () {}

	klass[SharedSitePrototype] = create(Component[SharedSitePrototype], description)
	klass[SharedSiteDisplayName] = displayName

	return klass
}

/**
 * @param {Object} prototype
 * @return {Object}
 */
function createComponentPrototype (prototype) {
	defineProperty(prototype, SymbolComponent, {value: SymbolComponent})
	defineProperty(prototype, SharedSiteSetState, {value: setState})
	defineProperty(prototype, SharedSiteForceUpdate, {value: forceUpdate})

	if (!prototype[SharedSiteRender])
		defineProperty(prototype, SharedSiteRender, {value: noop, configurable: true})

	return prototype
}

/**
 * @param {Element} element
 */
function mountComponentElement (element) {
	var type = element.type
	var props = element.props
	var host = Object(element.host)
	var context = element.context = Object(host.context)
	var prototype = type[SharedSitePrototype]
	var children
	var state
	var owner

	if (prototype && prototype.render)
		!prototype[SymbolComponent] && createComponentPrototype(prototype)
	else
		type = type[SymbolComponent] || createComponentClass(type, getDisplayName(type))

	element.owner = owner = getLifecycleClass(element, type, props, context)
	owner[SymbolContext] = element.xmlns = host.xmlns
	owner[SymbolElement] = element
	owner.props = props
	owner.context = context

	owner.state = state = Object(owner.state)
	owner.refs = Object(owner.refs)

	if (owner[SharedGetInitialState])
		owner.state = getLifecyclePayload(element, SharedGetInitialState, props, state, context) || state

	if (owner[SharedComponentWillMount])
		getLifecycleMount(element, SharedComponentWillMount, owner)

	if (!thenable(state = owner.state))
		children = getComponentSnapshot(element, owner)
	else
		children = createElementPromise(enqueueComponentState(element, owner, state))

	if (owner[SharedGetChildContext])
		element.context = getLifecyclePayload(element, SharedGetChildContext, props, state, context) || context

	return element.children = children
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {number} signature
 */
function updateComponentElement (element, snapshot, signature) {
	switch (element.work) {
		case SharedWorkProcessing:
			requestAnimationFrame(enqueueComponentElement(element, snapshot, signature))
		case SharedWorkIntermediate:
			return
	}

	var owner = element.owner
	var prevProps = element.props
	var nextProps = snapshot.props
	var nextContext = owner.context
	var prevState = owner.state
	var nextState = signature === SharedComponentStateUpdate ? assign({}, prevState, element.cache) : prevState

	switch (signature) {
		case SharedComponentPropsUpdate:
			if (owner[SharedComponentWillReceiveProps])
				getLifecycleReceive(element, SharedComponentWillReceiveProps, nextProps, nextState, nextContext)
		case SharedComponentStateUpdate:
			if (owner[SharedComponentShouldUpdate])
				if (!getLifecycleShould(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext))
					return
	}

	if (owner[SharedComponentWillUpdate])
		getLifecycleUpdate(element, SharedComponentWillUpdate, nextProps, nextState, nextContext)

	if (owner[SharedGetChildContext])
		merge(element.context, getLifecyclePayload(element, SharedGetChildContext, nextProps, nextState, nextContext))

	if (signature === SharedComponentPropsUpdate)
		owner.props = element.props = nextProps

	if (signature === SharedComponentStateUpdate)
		owner.state = nextState

	reconcileElement(element.children, getComponentSnapshot(element, owner))

	if (owner[SharedComponentDidUpdate])
		getLifecycleUpdate(element, SharedComponentDidUpdate, prevProps, prevState, nextContext)

	if (element.ref !== snapshot.ref)
		commitRefs(element, snapshot.ref, SharedRefsReplace)
}

/**
 * @param {Element} element
 */
function unmountComponentElement (element) {
	if (element.owner[SharedComponentWillUnmount])
		if (element.cache = getLifecycleUnmount(element, SharedComponentWillUnmount, element.owner))
			if (thenable(element.cache))
				return

	element.cache = null
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {number} signature
 * @return {function}
 */
function enqueueComponentElement (element, snapshot, signature) {
	return function then () {
		updateComponentElement(element, snapshot, signature)
	}
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {object} state
 * @return {function}
 */
function enqueueComponentState (element, owner, state) {
	return function then (resolve, reject) {
		enqueueStatePromise(element, owner, state).then(function () {
			resolve(element.children.type.then === then && getComponentSnapshot(element, owner))
		}, reject)
	}
}

/**
 * @param {AsyncGenerator} generator
 * @return {object}
 */
function enqueueComponentGenerator (generator) {
	return function then (resolve, reject) {
		requestAnimationFrame(function (timestamp) {
			generator.next(timestamp).then(function (value) {
				!value.done && then((resolve(getElementDefinition(value.value)), resolve), reject)
			}, reject)
		})
	}
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {function?} callback
 */
function enqueueComponentUpdate (element, owner, callback, signature) {
	if (!element)
		return requestAnimationFrame(function () {
			enqueueComponentUpdate(getComponentElement(owner), owner, callback, signature)
		})

	if (element.work === SharedWorkProcessing)
		return requestAnimationFrame(function () {
			enqueueComponentUpdate(element, owner, callback, signature)
		})

	if (element.active)
		updateComponentElement(element, element, signature)
	else
		merge(owner.state, element.cache)

	if (callback)
		enqueueStateCallback(element, owner, callback)
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {(Object|function)} state
 * @param {function?} callback
 */
function enqueueStateUpdate (element, owner, state, callback) {
	if (state) {
		if (element)
			switch (typeof state) {
				case 'function':
					return enqueueStateUpdate(element, owner, enqueueStateCallback(element, owner, state), callback)
				case 'object':
					if (thenable(element.cache = state))
						enqueueStatePromise(element, owner, state, callback)
					else
						enqueueComponentUpdate(element, owner, callback, SharedComponentStateUpdate)
			}
		else
			return requestAnimationFrame(function () {
				enqueueStateUpdate(getComponentElement(owner), owner, state, callback)
			})
	}
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {Promise} state
 * @param {function?} callback
 * @param {Promise}
 */
function enqueueStatePromise (element, owner, state, callback) {
	return state.then(function (value) {
		if (value)
			if (fetchable(value))
				enqueueStateUpdate(element, owner, value.json(), callback)
			else
				enqueueStateUpdate(element, owner, value, callback)
	}, function (err) {
		invokeErrorBoundary(element, err, SharedSitePromise+':'+SharedSiteSetState, SharedErrorCatch)
	})
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {function} callback
 */
function enqueueStateCallback (element, owner, callback) {
	try {
		if (typeof callback === 'function')
			return callback.call(owner, owner.state, owner.props, owner.context)
	} catch (err) {
		invokeErrorBoundary(element, err, SharedSiteSetState+':'+SharedSiteCallback, SharedErrorCatch)
	}
}

/**
 * @param {Element} element
 * @param {Object?} state
 */
function getLifecycleState (element, state) {
	switch (typeof state) {
		case 'object':
		case 'function':
			enqueueStateUpdate(element, element.owner, state)
	}
}

/**
 * @param {(Component|object)?} value
 * @param {*} key
 * @param {Element} element
 */
function getLifecycleRefs (value, key, element) {
	if (key !== element.ref)
		delete this.refs[element.ref]

	this.refs[key] = value
}

/**
 * @param {Element} element
 * @param {function} type
 * @param {object} props
 * @param {object} context
 * @return {Component}
 */
function getLifecycleClass (element, type, props, context) {
	try {
		element.owner = new type(props, context)
	} catch (err) {
		invokeErrorBoundary((element.owner = new Component(props, context), element), err, SharedSiteConstructor, SharedErrorCatch)
	} finally {
		return element.owner
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {Object} props
 * @param {Object} state
 * @param {Object} context
 * @return {Object?}
 */
function getLifecyclePayload (element, name, props, state, context) {
	try {
		return element.owner[name](props, state, context)
	} catch (err) {
		invokeErrorBoundary(element, err, name, SharedErrorCatch)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {Component} owner
 * @return {Promise?}
 */
function getLifecycleUnmount (element, name, owner) {
	try {
		return owner[name](getNodeOwner(getElementDescription(element)))
	} catch (err) {
		invokeErrorBoundary(element, err, name, SharedErrorCatch)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {Component} owner
 */
function getLifecycleMount (element, name, owner) {
	try {
		getLifecycleState(element, owner[name](element.active && getNodeOwner(getElementDescription(element))))
	} catch (err) {
		invokeErrorBoundary(element, err, name, SharedErrorCatch)
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
function getLifecycleShould (element, name, props, state, context) {
	try {
		return element.owner[name](props, state, context)
	} catch (err) {
		invokeErrorBoundary(element, err, name, SharedErrorCatch)
	} finally {
		element.work = SharedWorkIdle
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
function getLifecycleReceive (element, name, props, state, context) {
	try {
		getLifecycleState((element.work = SharedWorkIntermediate, element), element.owner[name](props, context))
	} catch (err) {
		invokeErrorBoundary(element, err, name, SharedErrorCatch)
	} finally {
		if (state !== (element.work = SharedWorkIdle, element.cache))
			merge(state, element.cache)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} error
 * @param {Exception} exception
 * @param {number} work
 * @return {boolean?}
 */
function getLifecycleBoundary (element, name, error, exception, work) {
	try {
		getLifecycleState(element, element.owner[name](error, exception))
	} catch (err) {
		invokeErrorBoundary(element.host, err, SharedComponentDidCatch, SharedErrorCatch)
	} finally {
		exception.bubbles = false
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
		getLifecycleState(element, element.owner[name](props, state, context))
	} catch (err) {
		invokeErrorBoundary(element, err, name, SharedErrorCatch)
	}
}

/**
 * @param {Element} element
 * @param {function} callback
 * @param {object?} props
 * @param {string?} name
 * @param {object?} state
 * @return {*?}
 */
function getLifecycleCallback (element, callback, props, name, state) {
	try {
		if (typeof callback === 'function')
			return callback.call(element.owner, props, name, state)
	} catch (err) {
		invokeErrorBoundary(element, err, SharedSiteCallback, SharedErrorCatch)
	}
}

/**
 * @param {Component} owner
 * @param {string} name
 * @param {function} callback
 */
function getLifecycleOnce (owner, name, callback) {
	return owner[name] = function () {
		return delete this[name] && callback(this)
	}
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @return {Element}
 */
function getComponentSnapshot (element, owner) {
	try {
		return getElementDefinition(owner.render(owner.props, owner.state, owner.context))
	} catch (err) {
		if (!invokeErrorBoundary(element, err, SharedSiteRender, SharedErrorCatch))
			return getElementDefinition()
	}
}

/**
 * @param {Component} owner
 * @return {Element}
 */
function getComponentElement (owner) {
	return owner[SymbolElement]
}

/**
 * @param {Component} owner
 * @return {Element}
 */
function getComponentChildren (owner) {
	return getComponentElement(owner).children
}
