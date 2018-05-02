/**
 * @param {Element} element
 * @param {function} callback
 */
function getLifecycleCallback (element, callback) {
	try {
		if (typeof callback === 'function')
			callback.call(element.owner)
	} catch (err) {
		throwErrorException(element, err, SharedSiteCallback)
	}
}

/**
 * @param {Element} element
 * @param {object?} owner
 * @param {any?} value
 */
function getLifecycleRefs (element, owner, value) {
	try {
		if (element.id === SharedElementComponent && typeof element.xmlns === 'function')
			return

		switch (typeof value) {
			case 'object':
				return value.current = owner
			case 'function':
				return value.call(element.host.owner, owner)
		}

		Object(element.host.owner.refs)[value] = owner
	} catch (err) {
		throwErrorException(element.host, err, SharedSiteCallback)
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
