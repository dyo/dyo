/**
 * @param {Element} element
 * @param {*} err
 * @param {string} from
 * @param {number} signature
 * @param {Element}
 */
function invokeErrorBoundary (element, err, from, signature) {
	return commitElement(getErrorElement(element, getErrorException(element, err, from), from, signature))
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
		return throwErrorException(error)

	var owner = element.owner
	var boundary = owner && owner[SharedComponentDidCatch] 
	var host = !boundary && element.host
	var snapshot = commitElement(null)

	requestAnimationFrame(function () {
		if (element.active)
			recoverErrorBoundary(element, snapshot)
	})

	if (boundary) {
		element.work = SharedWorkUpdating
		try {
			merge(snapshot, commitElement(boundary.call(element.instance, error, error)))
		} catch (err) {
			invokeErrorBoundary(element.host, err, SharedComponentDidCatch, signature)
		}
		element.work = SharedWorkIdle
	}

	getErrorElement(host, error, from, signature)

	return snapshot
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function recoverErrorBoundary (element, snapshot) {
	reconcileElement(getElementChildren(element), commitElement(snapshot))
}

/**
 * @param {Error} error
 */
function throwErrorException (error) {
	if (error.defaultPrevented)
		return

	console.error(error)
	console.error(error.errorMessage)
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
	var errorMessage = ''
	var tabs = '    '
	var host = element

	while (host && host.type) {
		componentStack += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	errorMessage = 'The above error occurred in `\n' + componentStack + '` from "' + from + '"'

	return defineProperties(error, {
		errorLocation: getErrorDescription(from),
		errorMessage: getErrorDescription(errorMessage),
		componentStack: getErrorDescription(componentStack),
		defaultPrevented: getErrorDescription(false),
		preventDefault: getErrorDescription(function () {
			defineProperty(error, 'defaultPrevented', getErrorDescription(true))
		}),
	})
}
