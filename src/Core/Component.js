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
	 * @alias PureComponent#constructor
	 * @memberof PureComponent
	 * @type {function}
	 * @this {Component}
	 */
	constructor: {
		value: PureComponent
	},
	/**
	 * @alias PureComponent#shouldComponentUpdate
	 * @memberof PureComponent
	 * @type {function}
	 * @this {Component}
	 * @param {object} props
	 * @param {object} state
	 * @return {boolean}
	 */
	shouldComponentUpdate: {
		value: function (props, state) {
			return compare(this.props, props) || compare(this.state, state)
		}
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
	 * @type {function}
	 */
	constructor: {
		value: CustomComponent
	},
	/**
	 * @alias CustomComponent#render
	 * @memberof CustomComponent
	 * @type {function}
	 * @this {Component}
	 * @param {object} props
	 * @return {Element}
	 */
	render: {
		value: function (props) {
			return createElementComponent(this[SymbolForElement].type, props)
		}
	}
})

/**
 * @alias Component#setState
 * @memberof Component
 * @this {Component}
 * @param {(object|function)} state
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
	return createComponentClass(Object(description), function constructor () {
		for (var i = 0, keys = ObjectKeys(constructor[SharedSitePrototype]); i < keys.length; ++i)
			this[keys[i]] = this[keys[i]].bind(this)
	})
}

/**
 * @param {(function|object)} description
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
	
	if (description[SharedPropTypes])
		constructor[SharedPropTypes] = description[SharedPropTypes]
	
	if (description[SharedContextTypes])
		constructor[SharedContextTypes] = description[SharedContextTypes]

	var descriptors = {}

	for (var name in description)
		descriptors[name] = getComponentDescriptor(name, description[name])

	constructor[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], descriptors)

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
 * @param {object} prototype
 * @return {function}
 */
function getComponentClass (type, prototype) {
	if (!prototype || !prototype[SharedSiteRender])
		if (type[SymbolForComponent])
			return type[SymbolForComponent]
		else if (isValidNodeComponent(type))
			return type[SymbolForComponent] = CustomComponent
		else
			return createComponentClass(type, function () {})

	if (!prototype[SymbolForComponent])
		createComponentPrototype(prototype)

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
 * @param {Element} element
 * @return {Element}
 */
function mountComponentInstance (element) {
	var type = element.type
	var props = element.props
	var children = element
	var host = element.host
	var context = element.context = host.context || getNodeContext(element)
	var owner = getLifecycleInstance(element, getComponentClass(type, type[SharedSitePrototype]), props, context)
	var state = owner.state = owner.state || {}

	owner.props = props
	owner.context = context
	owner.refs = owner.refs || {}
	owner[SymbolForState] = owner[SymbolForCache] = {}
	owner[SymbolForContext] = element.cache = host.cache
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
				return void element.cache.catch(function (err) {
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
		recoverErrorBoundary(element, host, err)
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
				getLifecycleUpdate(element, SharedComponentWillReceiveProps, element.props = nextProps, nextContext, nextState)

			if (tempState !== owner[SymbolForCache])
				break

		case SharedComponentForceUpdate:
			tempState = nextState
	}

	nextState = owner[SymbolForState] = tempState !== nextState ? assign({}, prevState, tempState) : nextState

	if (signature !== SharedComponentForceUpdate)
		if (owner[SharedComponentShouldUpdate])
			if (!getLifecycleUpdate(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext))
				return void(owner.state = nextState)

	if (owner[SharedComponentWillUpdate])
		getLifecycleUpdate(element, SharedComponentWillUpdate, nextProps, nextState, nextContext)

	switch (signature) {
		case SharedComponentPropsUpdate:
			element.props = nextProps
		case SharedComponentStateUpdate:
			owner.state = nextState
		case SharedComponentForceUpdate:
			owner.props = element.props
	}

	if (owner[SharedGetChildContext])
		merge(element.context, getLifecycleUpdate(element, SharedGetChildContext, nextProps, nextState, nextContext))

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
		return generator.next(element.cache).then(function (sequence) {
			if (sequence.done !== true || sequence.value !== undefined)
				resolve(element.cache = sequence.value, sequence.done, then(resolve, reject))
			else if (element.context)
				resolve(element.cache, sequence.done)
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
	else if (element.work === SharedWorkUpdating && signature === SharedComponentStateUpdate)
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

// The following is only availabe in the development packages of DIO
if (process.env.NODE_ENV === 'development') {
	/**
	 * @param {function} type component class or function 
	 * @param {object} props property object to validate
	 * @param {boolean?} checkForContext indicator whether "propTypes" or "contextTypes"
	 * 										shall be checked (default is false)
	 * 
	 * @throws {Exception} will be thrown if validation fails
	 */
	var checkPropTypes = function (type, props, checkForContext) {
		var
			validationType = checkForContext	// 'propTypes' or 'contextTypes'
				? SharedContextTypes
				: SharedPropTypes,

			propTypes = type[validationType],	// object with validation functions
			errorMsg = null,					// message of error to throw
			error,								// error to throw
			validationSubject,					// 'props' or 'context'
			componentName,						// display name of the component
			propName,							// name/key of property to validate
			propInfo,							// `propTypes.${propName} of component ${componentName}`
												// or `contextTypes.${propName} of component ${componentName}`
			validator,							// validator function
			result,								// result of the validator function invocation
			resultIsError						// true if result is instance of error, otherwise false

		if (!propTypes || typeof propTypes !== 'object') {
			return
		}

		validationSubject = checkForContext ? 'context' : 'props'
		componentName = getDisplayName(type)

		for (propName in propTypes) {
			if (propTypes.hasOwnProperty(propName)) {
				validator = propTypes[propName]
				
				propInfo =
					validationType
						+ '.' + propName
						+ ' of component '
						+ componentName

				if (typeof validator !== 'function') {
					errorMsg = 'Validator '
						+ propInfo
						+ ' must be a function'
				} else {
					try {
						result = validator(props, propName, componentName, validationSubject, propName)

						resultIsError = result !== null
							&& typeof result === 'object'
							&& typeof result.message === 'string'

						if (result !== null && !resultIsError) {
							errorMsg = 'Invalid validation result for '
								+ propInfo
								+ '(must be null or an error object)'
						} else if (resultIsError) {
							errorMsg = result.message
						}
					} catch (e) {
						errorMsg = 'An unexpected error has been thrown while validating '
							+ propInfo
							+ ': '
							+ (e && e.message ? e.message : e)
					}
				}

				if (errorMsg !== null) {
					errorMsg = 'Validation failure for '
						+ propInfo
						+ ': '
						+ errorMsg

					error = new Error(errorMsg)
				
					if (typeof console !== 'undefined') {
						console.error(error.toString())
					}

					throw error 
				}
			}
		}
	}
}

