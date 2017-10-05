/**
 * @param {Element} element
 * @param {*} err
 * @param {string} from
 * @param {number} signature
 * @param {Element}
 */
function invokeErrorBoundary (element, err, from, signature) {
	return getElementDefinition(getErrorElement(element, getErrorException(element, err, from), from, signature))
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {number} signature
 * @return {Element?}
 */
function getErrorElement (element, error, from, signature) {
	if (signature === SharedErrorPassive)
		return reportErrorException(error)

	var host = element.host
	var owner = element.owner
	var instance = element.instance
	var caught = instance && !instance[SymbolError] && owner && owner[SharedComponentDidCatch]

	requestAnimationFrame(function () {
		if (element.active)
			recoverErrorBoundary(element, getElementDefinition(null))
	})

	if (caught) {
		element.work = SharedWorkProcessing
		getLifecycleBoundary(element, SharedComponentDidCatch, error, instance[SymbolError] = error)
		element.work = SharedWorkIdle
	}

	if (!caught && isValidElement(host) && element.id !== SharedElementIntermediate)
		return getErrorElement(host, error, from, signature)

	return getErrorElement(element, error, from, SharedErrorPassive)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function recoverErrorBoundary (element, snapshot) {
	reconcileElement(element.id === SharedElementComponent ? element.children : element, snapshot)
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
