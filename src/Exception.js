import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'
import * as Schedule from './Schedule.js'

import Registry from './Registry.js'

/**
 * @constructor
 * @param {object} host
 * @param {*} value
 */
export var struct = Utility.extend(function exception (host, value) {
	this.error = value
	Registry.set(this, host)
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
			return trace(Registry.get(this), '')
		}
	}
})

/**
 * @param {object} host
 * @param {string} value
 * @return {string}
 */
export function trace (host, value) {
	return host.uid === Enum.target ? value : trace(host.host, '\tat ' + Element.display(host) + '\n' + value)
}

/**
 * @param {object} host
 * @param {*} value
 * @return {object}
 */
export function create (host, value) {
	return value instanceof struct ? value : new struct(host, value)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @return {function}
 */
export function throws (fiber, host, element) {
	return function (exception) { resolve(fiber, host, element, exception) }
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {*} exception
 * @return {boolean?}
 */
export function resolve (fiber, host, element, exception) {
	return propagate(fiber, host, element, create(host, exception), host)
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
			try {
				throw exception.error
			} finally {
				if (exception.value = exception + '') {
					Utility.report(exception.value)
				}
			}
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
		return Schedule.enqueue(fiber, element, instance, exception.error, exception, exception, Enum.componentDidCatch)
	}
}
