import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
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
		Registry.set(this, [host === element ? host.host : host, element, ''])
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

/**
 * @param {object} host
 * @param {object} element
 * @param {string} value
 * @return {string}
 */
export function trace (host, element, value) {
	if (host.uid === Enum.target) {
		return element.uid === Enum.target ? value : value + display(element)
	} else {
		return trace(host.host, element, display(host) + value)
	}
}

/**
 * @param {object} host
 * @param {object} element
 * @param {*} exception
 * @return {object}
 */
export function create (host, element, exception) {
	return exception instanceof struct ? exception : new struct(host, element, exception)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {*} exception
 * @return {boolean?}
 */
export function resolve (fiber, host, element, exception) {
	return propagate(fiber, host, element, create(host, element, exception), host)
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
	switch (current.uid) {
		case Enum.target:
			return report(exception)
		case Enum.component:
			if (current !== element) {
				if (recover(fiber, current, exception, current.instance)) {
					return
				}
			}
		default:
			if (host === element) {
				return propagate(fiber, host, element, exception, current.host)
			}
	}

	throw exception
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} exception
 * @param {object} instance
 * @return {boolean?}
 */
export function recover (fiber, element, exception, instance) {
	if (Lifecycle.has(instance, Enum.componentDidCatch)) {
		return !Schedule.callback(fiber, element, instance, exception.error, exception, exception, Enum.componentDidCatch)
	}
}
