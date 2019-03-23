import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Schedule from './Schedule.js'
import * as Suspense from './Suspense.js'

/**
 * @constructor
 * @param {object} host
 * @param {any} value
 */
export var struct = Utility.extend(function exception (host, value) {
	this.name = 'Exception'
	this.message = value
	this.bubbles = Utility.thenable(value)
	this[Enum.identifier] = host
}, {
	toString: {value: function () { return this.name + ': ' + this.message + '\n' + this.stack }},
	stack: {get: function () { return Utility.define(this, 'stack', trace(this[Enum.identifier], '')) }, configurable: true}
})

/**
 * @param {object} host
 * @param {string} value
 * @return {string}
 */
export function trace (host, value) {
	return host.identity === Enum.target ? value : trace(host.host, '\tat <' + Element.display(host) + '>\n' + value)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @return {function}
 */
export function throws (fiber, host) {
	return function (exception) { dispatch(fiber, host, host, exception) }
}

/**
 * @param {object} host
 * @param {object?} value
 * @return {any}
 */
export function create (host, value) {
	return value !== null && value !== undefined && value instanceof struct ? value : new struct(host, value)
}

/**
 * @param {object} fiber
 * @param {object} export
 */
export function destroy (fiber, exception) {
	fiber.element = null

	try {
		Utility.throws(exception.message)
	} finally {
		Utility.report(exception + '')
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {any} exception
 */
export function dispatch (fiber, host, element, exception) {
	fiber.element !== null ? resolve(fiber, host, element, create(host, exception), host) : Utility.throws(exception)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} current
 */
export function resolve (fiber, host, element, exception, current) {
	switch (current.identity) {
		case Enum.target:
			return destroy(fiber, exception)
		case Enum.component:
			if (current !== element) {
				if (enqueue(fiber, host, element, exception, current) !== null) {
					return
				} else if (host !== element) {
					Utility.throws(exception)
				}
			}
	}

	resolve(fiber, host, element, exception, current.host)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} current
 * @return {void}
 */
export function enqueue (fiber, host, element, exception, current) {
	if (exception.bubbles) {
		Suspense.dispatch(fiber, current, element, exception.message)
	} else {
		for (var i = 1, index = 0, value = null, callback = [], children = current.children; i < children.length; i++) {
			if ((value = children[i]).length === 1) {
				callback[index++] = value
			}
		}

		return index === 0 ? null : Schedule.callback(current, exception, callback)
	}
}
