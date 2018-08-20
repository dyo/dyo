import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Commit from './Commit.js'

/**
 * @type {object}
 */
export var descriptors = {
	/**
	 * @type {function}
	 */
	toString: {
		value: function () {
			return this.message
		}
	},
	/**
	 * @type {string}
	 */
	message: {
		get: function () {
			return this.message = delete this.message && (
				'Exception: ' + Object(this.error).toString() + '\n\n' +
				'The following error occurred in `\n' + this.componentStack + '` from "' + this.origin + '"'
			)
		}
	},
	/**
	 * @type {string}
	 */
	componentStack: {
		get: function () {
			this.componentStack = delete this.componentStack && (
				trace(this[Constant.element].host, '<' + Element.display(this[Constant.element]) + '>\n')
			)
		}
	}
}

/**
 * @constructor
 * @param {object} element
 * @param {any} err
 * @param {string} origin
 */
export var constructor = Utility.extend(function Exception (element, err, origin) {
	this.error = err
	this.origin = origin
	this.bubbles = true
	this[Constant.element] = element
}, descriptors)

export var prototype = constructor[Constant.prototype]

/**
 * @throws object
 * @param {object} element
 * @param {any} err
 * @param {string} origin
 */
export function raise (element, err, origin) {
	throw new constructor(element, err, origin)
}

/**
 * @throws {any}
 * @param {Element} element
 * @param {any} err
 * @param {string} origin
 */
export function report (element, err, origin) {
	throw print(new constructor(element, err, origin))
}

/**
 * @param {(object|string)} value
 * @return {any}
 */
export function print (value) {
	try {
		console.error(value.toString())
	} catch (err) {} finally {
		return value.error
	}
}

/**
 * @param {object} element
 * @param {string} stack
 * @return {string}
 */
export function trace (host, stack) {
	return host && host.host ? stack + trace(host.host, '<' + Element.display(host) + '>\n') : stack
}

/**
 * @param {object} element
 * @param {any} err
 * @param {string} origin
 */
export function invoke (element, err, origin) {
	propagate(element, element, element.host, new constructor(element, err, origin))
}

/**
 * @param {object} host
 * @param {object} value
 */
export function delegate (host, value) {
	propagate(value[Constant.element], host, host, value[Constant.exception] = value)
}

/**
 * @param {object} element
 * @param {object} host
 * @param {object} value
 */
export function recover (element, host, value) {
	propagate(value[Constant.element], host, element, value)
}

/**
 * @throws {object} throws when an uncaught
 * @param {object} element
 * @param {object} host
 * @param {object} parent
 * @param {object} value
 */
export function propagate (element, host, parent, value) {
	if (element === parent && element !== host) {
		throw value
	}

	if (value.origin !== Constant.componentWillUnmount) {
		if (!value[Constant.exception]) {
			clear(parent.children, parent, element)
		}
	}

	if (Lifecycle.has(Utility.object(owner), Constant.componentDidCatch)) {
		if (!owner[Constant.exception]) {
			owner[Constant.exception] = Lifecycle.exception(element, Constant.componentDidCatch, owner[Constant.exception] = value)
		}
	}

	if (value.bubbles) {
		if (!Element.valid(parent.host)) {
			throw print(value)
		} else if (element !== host) {
			throw value
		} else {
			propagate(element, host, parent.host, value)
		}
	}
}

/**
 * @param {object} element
 * @param {object} host
 * @param {object} children
 */
export function clear (element, host, children) {
	// Commit.clear(children, element)
	// Commit.replace(element, Element.resolve(Commit.owner(host)), host)
}
