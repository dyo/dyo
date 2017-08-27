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
			if (client)
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
		errorBoundary(element, e, LifecycleCallback, 0)
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
		errorBoundary(element, e, name, 1)
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
		errorBoundary(element, e, name, 1)
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
		errorBoundary(element, e, name, 1)
	}
}
