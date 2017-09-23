/**
 * @param {Element} element
 * @param {*} err
 * @param {string} from
 * @param {number} signature
 * @param {Element?}
 */
function invokeErrorBoundary (element, err, from, signature) {
	var error = getErrorException(element, err, from)
	var snapshot = getErrorElement(element, error, from, signature)

	if (!error.defaultPrevented)
		console.error(error.componentStack)

	return commitElement(snapshot)
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {number} signature
 * @return {Element?}
 */
function getErrorElement (element, error, from, signature) {	
	if (signature === SharedErrorPassive || !isValidElement(element))
		return

	var owner = element.owner
	var host = element.host
	var snapshot

	if (!owner || !owner[SharedComponentDidCatch])
		return host ? void getErrorElement(host, error, from, signature) : snapshot

	element.sync = SharedWorkTask

	try {
		snapshot = owner[SharedComponentDidCatch].call(element.instance, error, error)
	} catch (err) {
		invokeErrorBoundary(host, err, SharedComponentDidCatch, signature)
	}

	element.sync = SharedWorkSync

	if (from !== SharedSiteRender)
		requestAnimationFrame(function () {
			if (element.active)
				reconcileElement(getElementDescription(element), commitElement(snapshot))
		})

	return snapshot
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 */
function getErrorException (element, error, from) {
	if (!(error instanceof Error))
		return getErrorException(element, new Error(error), from)

	var componentStack = 'Error caught in `\n\n'
	var tabs = ''
	var host = element
	var stack = error.stack
	var message = error.message

	while (host && host.type) {
		componentStack += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	componentStack += '\n` from "' + from + '"\n\n' + stack + '\n\n'

	return defineProperties(error, {
		stack: getErrorDescription(stack),
		message: getErrorDescription(message),
		componentStack: getErrorDescription(componentStack),
		defaultPrevented: getErrorDescription(false),
		preventDefault: getErrorDescription(function () {
			defineProperty(error, 'defaultPrevented', getErrorDescription(true))
		}),
	})
}

/**
 * @param {*} value
 * @return {Object}
 */
function getErrorDescription (value) {
	return {enumerable: true, configurable: true, value: value}
}
