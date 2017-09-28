/**
 * @param {Element} element
 * @param {*} err
 * @param {string} from
 * @param {number} signature
 * @param {Element}
 */
function invokeErrorBoundary (element, err, from, signature) {
	return getElementFrom(getErrorElement(element, getErrorException(element, err, from), from, signature))
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {number} signature
 * @return {Element?}
 */
function getErrorElement (element, error, from, signature) {
	if (signature === SharedErrorPassive || !isValidElement(element) || !element.id === SharedElementEmpty)
		return reportErrorException(error)

	var boundary = element.owner && !!element.owner[SharedComponentDidCatch] 
	var host = element.host
	var time = element.time

	requestAnimationFrame(function () {
		if (element.active)
			recoverErrorBoundary(element, getElementFrom(null))
	})

	if (boundary)
		if (boundary = (element.time = Date.now()) - time > 16) {
			element.work = SharedWorkUpdating
			getLifecycleBoundary(element, SharedComponentDidCatch, error, error)
			element.work = SharedWorkIdle
		}

	return getErrorElement(!boundary && host, error, from, signature)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function recoverErrorBoundary (element, snapshot) {
	reconcileElement(getElementChildren(element), getElementFrom(snapshot))
}

/**
 * @param {Error} error
 */
function reportErrorException (error) {
	if (!error.defaultPrevented)
		console.error(error.inspect())
}

/**
 * @param {*} value
 * @return {Object}
 */
function getErrorDescription (value) {
	return {enumerable: true, configurable: true, value: value}
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 */
function getErrorException (element, error, from) {
	if (!(error instanceof Error))
		return getErrorException(element, new Error(error), from)

	var componentStack = ''
	var tabs = '    '
	var host = element

	while (host && host.type) {
		componentStack += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	var errorMessage = 'The above error occurred in `\n' + componentStack + '` from "' + from + '"'
	var errorStack = error.stack + '\n\n' + errorMessage

	return defineProperties(error, {
		errorLocation: getErrorDescription(from),
		errorStack: getErrorDescription(errorStack),
		errorMessage: getErrorDescription(errorMessage),
		componentStack: getErrorDescription(componentStack),
		defaultPrevented: getErrorDescription(false),
		preventDefault: getErrorDescription(function () {
			return !!defineProperty(error, 'defaultPrevented', getErrorDescription(true))
		}),
		inspect: getErrorDescription(function () {
			return errorStack
		})
	})
}
