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
	Schedule.checkout(resolve, element, value, callback, null)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 * @param {(function|function[])} callback
 */
export function resolve (fiber, element, value, callback) {
	try {
		enqueue(fiber, element, value, element.props, callback)
	} catch (error) {
		Exception.dispatch(fiber, element, element, error)
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 * @param {object} props
 * @param {(function|function[])} callback
 * @return {any?}
 */
export function enqueue (fiber, element, value, props, callback) {
	if (Utility.callable(callback)) {
		if (value = callback(value, props)) {
			if (Utility.callable(value)) {
				element.stack = value
			} else if (Utility.thenable(value)) {
				dequeue(fiber, element, value)
			}
		}
	} else if (callback) {
		for (var i = 0; i < callback.length; i++) {
			enqueue(fiber, element, value, props, callback[i])
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 */
export function dequeue (fiber, element, value) {
	Schedule.suspend(fiber, value, function () {
		return element.value
	}, Exception.throws(fiber, element))
}

/**
 * @param {object} element
 * @param {function} callback
 * @return {object}
 */
export function request (element, callback) {
	return Utility.resolve(Promise.resolve(element), function (element) {
		return Schedule.checkout(function () {
			callback(element)
		}, element, element, element, null)
	})
}
