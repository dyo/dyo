import * as Utility from './Utility.js'
import * as Exception from './Exception.js'
import * as Schedule from './Schedule.js'

/**
 * @param {object} event
 */
export function handle (event) {
	dispatch(this.host, event, this.state[event.type])
}

/**
 * @param {object} element
 * @param {object} event
 * @param {(function|function[])} callback
 */
export function dispatch (element, event, callback) {
	Schedule.checkout(resolve, element, event, callback, undefined)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} event
 * @param {(function|function[])} callback
 */
export function resolve (fiber, element, event, callback) {
	try {
		enqueue(fiber, element, event, callback)
	} catch (error) {
		Exception.dispatch(fiber, element, element, error)
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} event
 * @param {(function|function[])} callback
 * @return {any?}
 */
export function enqueue (fiber, element, event, callback) {
	if (Utility.callable(callback)) {
		return callback.call(element, event)
	} else if (callback) {
		for (var i = 0, length = callback.length, value = event; i < length; i++) {
			if ((value = enqueue(fiber, element, event, callback[i])) !== undefined) {
				if (Utility.thenable(event = value)) {
					dequeue(fiber, element, event, callback.slice(i + 1, i = length))
				}
			}
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} event
 * @param {(function|function[])} callback
 */
export function dequeue (fiber, element, event, callback) {
	Schedule.suspend(fiber, event, function (value) {
		resolve(fiber, element, value, callback)
	}, Exception.throws(fiber, element))
}
