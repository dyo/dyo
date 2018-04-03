/**
 * @name Component
 * @constructor
 * @param {object} props
 * @param {object} context
 * @property {object} refs
 * @property {object} state
 * @property {object} props
 * @property {object} context
 * @public
 */
function Component (props, context) {
	this.refs = {}
	this.state = {}
	this.props = props
	this.context = context
}
Component[SharedSitePrototype] = createComponentPrototype(Component[SharedSitePrototype])

/**
 * @type {symbol}
 * @public
 */
var Fragment = SymbolForFragment

/**
 * @name PureComponent
 * @constructor
 * @extends Component
 * @param {object} props
 * @param {object} context
 * @public
 */
function PureComponent (props, context) {
	Component.call(this, props, context)
}
PureComponent[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
	/**
	 * @alias PureComponent#shouldComponentUpdate
	 * @memberof PureComponent
	 * @type {function}
	 */
	shouldComponentUpdate: {
		value: shouldComponentUpdate
	}
})

/**
 * @name CustomComponent
 * @constructor
 * @extends Component
 * @param {object} props
 * @param {object} context
 */
function CustomComponent (props, context) {
	Component.call(this, props, context)
}
CustomComponent[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
	/**
	 * @alias CustomComponent#render
	 * @memberof CustomComponent
	 * @type {function}
	 * @param {object} props
	 * @return {Element}
	 */
	render: {
		value: function (props) {
			return createElementComponent(this[SymbolForElement].type, props, props.children)
		}
	}
})

/**
 * @alias PureComponent#shouldUpdateComponent
 * @memberof PureComponent
 * @this {Component}
 * @param {object} props
 * @param {object} state
 * @return {boolean}
 */
function shouldComponentUpdate (props, state) {
	return compare(this.props, props) || compare(this.state, state)
}

/**
 * @alias Component#setState
 * @memberof Component
 * @this {Component}
 * @param {(Object|function)} state
 * @param {function?} callback
 */
function setState (state, callback) {
	enqueueComponentUpdate(this[SymbolForElement], this, state, SharedComponentStateUpdate, callback)
}

/**
 * @alias Component#forceUpdate
 * @memberof Component
 * @this {Component}
 * @param {function} callback
 */
function forceUpdate (callback) {
	enqueueComponentUpdate(this[SymbolForElement], this, {}, SharedComponentForceUpdate, callback)
}

/**
 * @param {object} description
 * @return {function}
 * @public
 */
function createClass (description) {
	return createComponentClass(Object(description), function constructor (props, context) {
		for (var i = 0, keys = ObjectKeys(constructor[SharedSitePrototype]); i < keys.length; ++i)
			this[keys[i]] = this[keys[i]].bind(this)
	})
}

/**
 * @param {object} description
 * @param {function} constructor
 * @return {function}
 */
function createComponentClass (description, constructor) {
	if (description[SymbolForComponent])
		return description[SymbolForComponent]

	if (typeof description === 'function' && !description[SharedSiteRender])
		return createComponentClass(description[SharedSiteRender] = description, constructor)

	if (description[SharedSiteDisplayName])
		constructor[SharedSiteDisplayName] = description[SharedSiteDisplayName]

	if (description[SharedGetDefaultProps])
		constructor[SharedDefaultProps] = description[SharedGetDefaultProps]

	for (var name in description)
		description[name] = getComponentDescriptor(name, description[name])

	constructor[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], description)

	return description[SymbolForComponent] = constructor
}

/**
 * @param {object} prototype
 * @return {object}
 */
function createComponentPrototype (prototype) {
	ObjectDefineProperty(prototype, SymbolForComponent, {value: SymbolForComponent})
	ObjectDefineProperty(prototype, SharedSiteSetState, {value: setState})
	ObjectDefineProperty(prototype, SharedSiteForceUpdate, {value: forceUpdate})

	if (!prototype[SharedSiteRender])
		ObjectDefineProperty(prototype, SharedSiteRender, getComponentDescriptor(SharedSiteRender, noop))

	return prototype
}

/**
 * @param {function} type
 * @return {function}
 */
function getComponentClass (type) {
	if (!type[SharedSitePrototype] || !type[SharedSitePrototype][SharedSiteRender])
		return type[SymbolForComponent] || (isValidNodeComponent(type) ? CustomComponent : createComponentClass(type, function () {}))

	if (!type[SharedSitePrototype][SymbolForComponent])
		createComponentPrototype(type[SharedSitePrototype])

	return type
}

/**
 * @param {string} name
 * @param {any} value
 * @return {object}
 */
function getComponentDescriptor (name, value) {
	switch (name) {
		case SharedComponentWillMount:
		case SharedComponentDidMount:
		case SharedComponentWillReceiveProps:
		case SharedComponentShouldUpdate:
		case SharedComponentWillUpdate:
		case SharedComponentDidUpdate:
		case SharedComponentWillUnmount:
		case SharedComponentDidCatch:
		case SharedGetDefaultProps:
		case SharedGetChildContext:
		case SharedGetInitialState:
		case SharedSiteConstructor:
		case SharedSiteDisplayName:
		case SharedSiteRender:
			return {value: value, writable: true, configurable: true, enumerable: false}
		default:
			return {value: value, writable: true, configurable: true, enumerable: typeof value === 'function'}
	}
}

/**
 * @this {Component}
 * @param {(Component|object)?} value
 * @param {any} key
 * @param {Element} element
 */
function getComponentRefs (value, key, element) {
	if (key !== element.ref)
		delete this.refs[element.ref]

	this.refs[key] = value
}

/**
 * @param {Element} element
 * @return {Element}
 */
function mountComponentInstance (element) {
	var children = element
	var props = element.props
	var host = element.host
	var context = element.context = host.context || getNodeContext(element)
	var owner = getLifecycleInstance(element, getComponentClass(element.type), props, context)
	var state = owner.state = owner.state || {}

	owner.props = props
	owner.context = context
	owner.refs = owner.refs || {}
	owner[SymbolForState] = owner[SymbolForCache] = {}
	owner[SymbolForElement] = element

	if (owner[SharedGetInitialState])
		owner.state = getLifecycleUpdate(element, SharedGetInitialState, props, state, context) || state

	if (owner[SharedComponentWillMount])
		getLifecycleUpdate(element, SharedComponentWillMount, props, state, context)

	if (thenable(state = owner.state))
		children = createElementPromise(enqueueComponentInitialState(element, owner, state))
	else
		children = getLifecycleRender(element, owner)

	if (owner[SharedGetChildContext])
		element.context = assign({}, context, getLifecycleUpdate(element, SharedGetChildContext, props, state, context))

	return element.children = children
}

/**
 * @param {Element} element
 * @return {Promise<any>?}
 */
function unmountComponentInstance (element) {
	if (element.owner[SharedComponentWillUnmount])
		if (element.cache = getLifecycleUnmount(element, SharedComponentWillUnmount))
			if (thenable(element.cache))
				return element.cache.catch(function (err) {
					invokeErrorBoundary(element, err, SharedComponentWillUnmount)
				})

	element.cache = null
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {Element} host
 * @param {number} signature
 */
function updateComponentElement (element, snapshot, host, signature) {
	try {
		updateComponentChildren(element, snapshot, signature)
	} catch (err) {
		delegateErrorBoundary(element, host, err)
	}
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 * @param {number} signature
 */
function updateComponentChildren (element, snapshot, signature) {
	var owner = element.owner
	var prevProps = element.props
	var nextProps = snapshot.props
	var nextContext = owner.context
	var prevState = owner.state
	var tempState = owner[SymbolForState] = owner[SymbolForCache]
	var nextState = prevState

	switch (signature) {
		case SharedComponentPropsUpdate:
			if (owner[SharedComponentWillReceiveProps])
				getLifecycleUpdate(element, SharedComponentWillReceiveProps, nextProps, nextContext)

			if (tempState !== owner[SymbolForCache])
				break
		case SharedComponentForceUpdate:
			tempState = nextState
	}

	nextState = owner[SymbolForState] = tempState !== nextState ? assign({}, prevState, tempState) : nextState

	if (signature !== SharedComponentForceUpdate)
		if (owner[SharedComponentShouldUpdate])
			if (!getLifecycleUpdate(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext))
				return

	if (owner[SharedComponentWillUpdate])
		getLifecycleUpdate(element, SharedComponentWillUpdate, nextProps, nextState, nextContext)

	if (owner[SharedGetChildContext])
		merge(element.context, getLifecycleUpdate(element, SharedGetChildContext, nextProps, nextState, nextContext))

	switch (signature) {
		case SharedComponentPropsUpdate:
			owner.props = element.props = nextProps
		case SharedComponentStateUpdate:
			owner.state = nextState
	}

	reconcileElement(element.children, getLifecycleRender(element, owner), element)

	if (owner[SharedComponentDidUpdate])
		getLifecycleUpdate(element, SharedComponentDidUpdate, prevProps, prevState, nextContext)

	if (element.ref !== snapshot.ref)
		commitOwnerRefs(element, snapshot.ref, SharedRefsReplace)
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {object} state
 * @return {function}
 */
function enqueueComponentInitialState (element, owner, state) {
	return function then (resolve, reject) {
		enqueueStatePromise(element, owner, state, SharedComponentStateUpdate, function () {
			if (owner[SymbolForException])
				reject(owner[SymbolForException])
			else
				resolve(element.children.type.then === then && getLifecycleRender(element, owner))
		})
	}
}

/**
 * @param {Element} element
 * @param {AsyncGenerator} generator
 * @return {object}
 */
function enqueueComponentGenerator (element, generator) {
	return function then (resolve, reject) {
		return generator.next(element.cache).then(function (value) {
			if (value.done !== true || value.value !== undefined)
				resolve(element.cache = value.value, value.done, then(resolve, reject))
			else if (element.context)
				resolve(element.cache, value.done)
		}, reject)
	}
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {(object|function)} state
 * @param {number} signature
 * @param {function?} callback
 */
function enqueueComponentUpdate (element, owner, state, signature, callback) {
	if (state)
		if (!element)
			owner.state = state
		else switch (typeof state) {
			case 'function':
				return enqueueComponentUpdate(element, owner, enqueueStateCallback(element, owner, state), signature, callback)
			case 'object':
				if (thenable(owner[SymbolForCache] = state))
					return enqueueStatePromise(element, owner, state, signature, callback)
				else
					enqueueComponentElement(element, owner, signature)
		}

	if (callback)
		enqueueStateCallback(element, owner, callback)
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {number} signature
 */
function enqueueComponentElement (element, owner, signature) {
	if (!element.active)
		merge(owner.state, owner[SymbolForCache])
	else if (element.work === SharedWorkUpdating)
		merge(owner[SymbolForState], owner[SymbolForCache])
	else
		updateComponentElement(element, element, element, signature)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {object?} value
 */
function enqueueComponentValue (element, name, value) {
	if (value)
		switch (typeof value) {
			case 'object':
			case 'function':
				switch (name) {
					case SharedGetInitialState:
					case SharedGetChildContext:
					case SharedComponentShouldUpdate:
						break
					default:
						enqueueComponentUpdate(element, element.owner, value, SharedComponentStateUpdate)
				}
		}

	return value
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {Promise<object>} state
 * @param {number} signature
 * @param {function?} callback
 */
function enqueueStatePromise (element, owner, state, signature, callback) {
	state.then(function (value) {
		if (fetchable(Object(value)))
			enqueueComponentUpdate(element, owner, value.json(), signature, callback)
		else
			enqueueComponentUpdate(element, owner, value, signature, callback)
	}, function (err) {
		if (!thenable(element.children.type))
			invokeErrorBoundary(element, err, SharedSiteSetState)
		else try {
			owner[SymbolForException] = createErrorException(element, err, SharedSiteSetState)
		} finally {
			enqueueStateCallback(element, owner, callback)
		}
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
		invokeErrorBoundary(element, err, SharedSiteCallback)
	}
}

/**
 * @param {Element} element
 * @param {function} callback
 * @param {any?} a
 * @param {any?} b
 * @param {any?} c
 * @return {any?}
 */
function getLifecycleCallback (element, callback, a, b, c) {
	try {
		if (typeof callback === 'function')
			return callback.call(element.owner, a, b, c)
	} catch (err) {
		throwErrorException(element, err, SharedSiteCallback)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 */
function getLifecycleUnmount (element, name) {
	try {
		return element.owner[name](getNodeOwner(getElementDescription(element)))
	} catch (err) {
		invokeErrorBoundary(element, err, name)
	}
}

/**
 * @param {Element} element
 * @param {string} name
 */
function getLifecycleMount (element, name) {
	try {
		enqueueComponentValue(element, name, element.owner[name](getNodeOwner(getElementDescription(element))))
	} catch (err) {
		throwErrorException(element, err, name)
	}
}

/**
 * @param {Element} element
 * @param {function} type
 * @param {object} props
 * @param {object} context
 * @return {Component}
 */
function getLifecycleInstance (element, type, props, context) {
	try {
		return element.owner = new type(props, context)
	} catch (err) {
		throwErrorException(element, err, SharedSiteConstructor)
	}
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @return {Element}
 */
function getLifecycleRender (element, owner) {
	try {
		return getElementDefinition(owner.render(owner.props, owner.state, owner.context))
	} catch (err) {
		throwErrorException(element, err, SharedSiteRender)
	}
}

/**
 * @param {Element} element
 * @param {Component} owner
 * @param {Exception} exception
 */
function getLifecycleBoundary (element, owner, exception) {
	try {
		enqueueComponentValue(element, SharedComponentDidCatch, owner[SharedComponentDidCatch](exception.error, exception))
	} catch (err) {
		throwErrorException(element, err, SharedComponentDidCatch)
	} finally {
		exception.bubbles = false
	}
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @return {any}
 */
function getLifecycleUpdate (element, name, props, state, context) {
	if (name !== SharedComponentDidUpdate)
		element.work = SharedWorkUpdating

	try {
		return enqueueComponentValue(element, name, element.owner[name](props, state, context))
	} catch (err) {
		throwErrorException(element, err, name)
	} finally {
		element.work = SharedWorkIdle
	}
}

