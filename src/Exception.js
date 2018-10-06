import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'
import * as Schedule from './Schedule.js'

import Registry from './Registry.js'

/**
 * @constructor
 * @param {object} host
 * @param {object} element
 * @param {*} value
 */
export var struct = Utility.extend(function (host, element, value) {
	try {
		this.error = value
	} finally {
		Registry.set(this, [host === element ? Element.get(host, Enum.host) : host, element, ''])
	}
}, {
	/**
	 * @type {function}
	 * @return {string}
	 */
	toString: {
		value: function () {
			return this.componentStack
		}
	},
	/**
	 * @type {string}
	 */
	componentStack: {
		get: function () {
			return trace.apply(null, Registry.get(this))
		}
	}
})

/**
 * @param {object} host
 * @param {object} element
 * @param {string} value
 * @return {string}
 */
export function trace (host, element, value) {
	if (host.constructor === Enum.portal) {
		return value + display(element)
	} else {
		return trace(Element.get(host, Enum.host), element, display(host) + value)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {*} exception
 * @return {boolean?}
 */
export function resolve (fiber, host, element, exception) {
	return propagate(fiber, host, element, exception instanceof struct ? exception : new struct(host, element, exception), host)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} current
 * @return {boolean?}
 */
export function propagate (fiber, host, element, exception, current) {
	switch (current.constructor) {
		case Enum.portal:
			return report(exception)
		case Enum.component:
			if (current !== element) {
				if (recover(fiber, host, current, exception, Element.get(current, Enum.owner), Enum.componentDidCatch)) {
					return true
				}
			}
		default:
			if (host === element) {
				return propagate(fiber, host, element, exception, Element.get(host, Enum.host))
			}
	}

	throw exception
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} owner
 */
export function recover (fiber, host, element, exception, owner, origin) {
	if (Lifecycle.has(owner, origin)) {
		return !Schedule.callback(fiber, origin, host, element, owner, exception.error, exception, exception)
	}
}

/**
 * @param {object} exception
 * @throws {*}
 */
export function report (exception) {
	try {
		throw exception.error
	} finally {
		if (exception.message = exception.toString()) {
			Utility.report(exception.message)
		}
	}
}

/**
 * @param {object} element
 * @return {string}
 */
export function display (element) {
	return '\tat ' + Element.display(element) + '\n'
}
