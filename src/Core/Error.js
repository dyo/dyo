/**
 * @constructor
 * @param {Element} element
 * @param {*} err
 * @param {string} origin
 */
function Exception (element, err, origin) {
	this.error = err
	this.origin = origin
	this.bubbles = true
	this[SymbolElement] = element
}
/**
 * @type {object}
 */
objectDefineProperties(Exception[SharedSitePrototype], {
	toString: {
		value: function () {
			return 'Error: ' + Object(this.error).toString() + '\n\n' + this.message
		}
	},
	message: {
		get: function () {
			return 'The following error occurred in `\n' + this.componentStack + '` from "' + this.origin + '"'
		}
	},
	componentStack: {
		get: function () {
			return this[SymbolComponent] = this[SymbolComponent] ? this[SymbolComponent] : (
				createErrorStack(this[SymbolElement].host, '<'+getDisplayName(this[SymbolElement])+'>\n')
			)
		}
	}
})

/**
 * @param {Element} element
 * @param {*} err
 * @param {string} origin
 */
function createErrorException (element, err, origin) {
	return new Exception(element, err, origin)
}

/**
 * @throws Exception
 * @param {Element} element
 * @param {*} err
 * @param {string} origin
 */
function throwErrorException (element, err, origin) {
	throw createErrorException(element, err, origin)
}

/**
 * @throws
 * @param {Element} element
 * @param {*} err
 * @param {string} origin
 */
function reportErrorException (element, err, origin) {
	throw printErrorException(createErrorException(element, err, origin))
}

/**
 * @param {(object|string)} exception
 * @return {*}
 */
function printErrorException (exception) {
	try {
		console.error(exception.toString())
	} catch (err) {} finally {
		return exception.error
	}
}

/**
 * @param {Element} element
 * @param {string} stack
 * @return {string}
 */
function createErrorStack (host, stack) {
	return host && host.host ? stack + createErrorStack(host.host, '<' + getDisplayName(host) + '>\n') : stack
}

/**
 * @param {Element} element
 */
function clearErrorBoundary (element) {
	reconcileElement(element.children, getElementDefinition(), element)
}

/**
 * @param {Element} element
 * @param {Element} host
 * @param {Element} parent
 * @param {Exception} exception
 */
function replaceErrorBoundary (element, host, parent, exception) {
	commitUnmountElement(element, parent)
	delegateErrorBoundary(element, host, exception)
}

/**
 * @param {Element} element
 * @param {*} err
 * @param {string} origin
 */
function invokeErrorBoundary (element, err, origin) {
	propagateErrorBoundary(element, element, element.host, createErrorException(element, err, origin))
}

/**
 * @param {Element} element
 * @param {Element} host
 * @param {Exception} exception
 */
function delegateErrorBoundary (element, host, exception) {
	propagateErrorBoundary(element, host, host, exception)
}

/**
 * @param {Element} element
 * @param {Exception} exception
 * @param {Component} owner
 */
function catchErrorBoundary (element, exception, owner) {
	if (owner && owner[SharedComponentDidCatch] && !owner[SymbolException])
		owner[SymbolException] = getLifecycleBoundary(element, owner, owner[SymbolException] = exception)
}

/**
 * @param {Element} element
 * @param {Element} host
 * @param {Element} parent
 * @param {Exception} exception
 */
function propagateErrorBoundary (element, host, parent, exception) {
	clearErrorBoundary(parent)
	catchErrorBoundary(parent, exception, parent.owner)

	if (!exception.bubbles)
		return

	if (!isValidElement(parent.host))
		throw printErrorException(exception)

	if (element !== host)
		throw exception

	propagateErrorBoundary(element, host, parent.host, exception)
}
