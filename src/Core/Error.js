/**
 * @constructor
 * @param {Element} element
 * @param {*} err
 * @param {string} origin
 * @param {number} signature
 */
function Exception (element, err, origin, signature) {
	var message = 'The following error occurred in `\n'
	var componentStack = createExecptionStack(element.host, '<'+getDisplayName(element)+'>\n')

	this.componentStack = componentStack
	this.error = err
	this.bubbles = true
	this.origin = origin
	this.message = message + componentStack + '` from "' + origin + '"'
}
/**
 * @type {Object}
 */
Exception.prototype = {
	toString: function () {
		return 'Error: ' + Object(this.error).toString() + '\n\n' + this.message
	}
}

/**
 * @param {Element} element
 * @param {string} stack
 * @return {string}
 */
function createExecptionStack (element, stack) {
	return element && element.host ? stack + createExecptionStack(element.host, '<' + getDisplayName(element) + '>\n') : stack
}

/**
 * @param {Element} element
 * @param {*} err
 * @param {string} origin
 * @param {number} signature
 */
function invokeErrorBoundary (element, err, origin, signature) {
	propagateErrorBoundary(element, element.host, err, new Exception(element, err, origin, signature), origin, signature)
}

/**
 * @param {Element} element
 * @param {*} err
 * @param {Exception} exception
 * @param {string} origin
 * @param {number} signature
 */
function propagateErrorBoundary (element, host, err, exception, origin, signature) {
	if (signature === SharedErrorCatch && recoverErrorBoundary(element, host, err, exception, origin, signature, element.owner))
		return propagateErrorBoundary(host, host.host, err, exception, origin, signature)

	if (exception.bubbles && printErrorException(exception))
		throw exception.error
}

/**
 * @param {Element} element
 * @param {Element?} host
 * @param {*} err
 * @param {Exception} exception
 * @param {string} origin
 * @param {number} signature
 * @param {Component} owner
 * @param {boolean?}
 */
function recoverErrorBoundary (element, host, err, exception, origin, signature, owner) {
	switch (origin) {
		case SharedComponentWillMount:
		case SharedGetInitialState:
			getLifecycleOnce(owner, SharedSiteRender, noop)
		case SharedSiteRender:
		case SharedComponentWillUnmount:
			break
		case SharedGetChildContext:
		case SharedComponentShouldUpdate:
		case SharedComponentWillUpdate:
		case SharedComponentWillReceiveProps:
			element.active && getLifecycleOnce(owner, SharedSiteRender, noop)
		default:
			element.active && replaceErrorChildren(element, getElementDefinition())
	}

	if (owner && !owner[SymbolException] && owner[SharedComponentDidCatch])
		return owner[SymbolException] = getLifecycleBoundary(element, SharedComponentDidCatch, owner[SymbolException] = err, exception)

	return isValidElement(host) && isValidElement(host.host)
}

/**
 * @param {Element} element
 * @param {Element} snapshot
 */
function replaceErrorChildren (element, snapshot) {
	reconcileElement(element.id === SharedElementComponent ? element.children : element, snapshot)
}

/**
 * @param {(object|string)} exception
 */
function printErrorException (exception) {
	try { console.error(exception.toString()) } catch (err) {} finally { return exception }
}
