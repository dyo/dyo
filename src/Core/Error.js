/**
 * @name Exception
 * @constructor
 * @param {Element} element
 * @param {any} err
 * @param {string} origin
 * @property {any} error
 * @property {string} origin
 * @property {boolean} bubbles
 */
function Exception (element, err, origin) {
	this.error = err
	this.origin = origin
	this.bubbles = true
	this[SymbolForElement] = element
}
ObjectDefineProperties(Exception[SharedSitePrototype], {
	/**
	 * @alias Exception#toString
	 * @memberof Exception
	 * @type {function}
	 * @return {string}
	 */
	toString: {
		value: function () {
			return this.message
		}
	},
	/**
	 * @alias Exception#message
	 * @memberof Exception
	 * @type {string}
	 */
	message: {
		get: function () {
			return this[SymbolForCache] = this[SymbolForCache] || (
				'Exception: ' + Object(this.error).toString() + '\n\n' +
				'The following error occurred in `\n' +
				this.componentStack + '` from "' + this.origin + '"'
			)
		}
	},
	/**
	 * @alias Exception#componentStack
	 * @memberof Exception
	 * @type {string}
	 */
	componentStack: {
		get: function () {
			return this[SymbolForComponent] = this[SymbolForComponent] || (
				createErrorStack(this[SymbolForElement].host, '<'+getDisplayName(this[SymbolForElement])+'>\n')
			)
		}
	}
})

/**
 * @param {Element} element
 * @param {any} err
 * @param {string} origin
 * @return {Exception}
 */
function createErrorException (element, err, origin) {
	return new Exception(element, err, origin)
}

/**
 * @throws Exception
 * @param {Element} element
 * @param {any} err
 * @param {string} origin
 */
function throwErrorException (element, err, origin) {
	throw createErrorException(element, err, origin)
}

/**
 * @throws {any}
 * @param {Element} element
 * @param {any} err
 * @param {string} origin
 */
function reportErrorException (element, err, origin) {
	throw printErrorException(createErrorException(element, err, origin))
}

/**
 * @param {(Exception|string)} exception
 * @return {any}
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
 * @param {any} err
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
	if (owner && owner[SharedComponentDidCatch] && !owner[SymbolForException])
		owner[SymbolForException] = getLifecycleBoundary(element, owner, owner[SymbolForException] = exception)
}

/**
 * @throws {Exception} throws when an ErrorBoundary is not found.
 * @param {Element} element
 * @param {Element} host
 * @param {Element} parent
 * @param {Exception} exception
 */
function propagateErrorBoundary (element, host, parent, exception) {
	catchErrorBoundary(parent, exception, parent.owner)

	if (!exception.bubbles)
		return

	clearErrorBoundary(parent)

	if (!isValidElement(parent.host))
		throw printErrorException(exception)

	if (element !== host)
		throw exception

	propagateErrorBoundary(element, host, parent.host, exception)
}
