import * as Utility from './Utility.js'
import * as Exception from './Exception.js'
import * as Schedule from './Schedule.js'

/**
 * @param {object} value
 */
export function handle (value) {
	dispatch(this.host, value, this.state[value.type])
}

/**
 * @param {object} element
 * @param {object} value
 * @param {(function|function[])} callback
 */
export function dispatch (element, value, callback) {
	Schedule.checkout(resolve, element, value, callback, undefined)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 * @param {(function|function[])} callback
 */
export function resolve (fiber, element, value, callback) {
	try {
		enqueue(fiber, element, value, callback)
	} catch (error) {
		Exception.dispatch(fiber, element, element, error)
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 * @param {(function|function[])} callback
 * @return {any?}
 */
export function enqueue (fiber, element, value, callback) {
	if (Utility.callable(callback)) {
		dequeue(fiber, element, callback.call(element, value, element.props))
	} else if (callback) {
		for (var i = 0; i < callback.length; i++) {
			enqueue(fiber, element, value, callback[i])
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 */
export function dequeue (fiber, element, value) {
	if (value !== undefined) {
		if (Utility.thenable(value)) {
			Schedule.suspend(fiber, value, function () {}, Exception.throws(fiber, element))
		}
	}
}
