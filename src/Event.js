import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Component from './Component.js'
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
	element.value = false

	try {
		enqueue(fiber, element, value, callback, element.props, element.state)

		if (element.value === element) {
			Component.dispatch(element)
		}
	} catch (error) {
		Exception.dispatch(fiber, element, element, error)
	} finally {
		element.value = null
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 * @param {(function|function[])} callback
 * @param {object} props
 * @param {object?} state
 */
export function enqueue (fiber, element, value, callback, props, state) {
	if (callback) {
		if (typeof callback === 'function') {
			if (value = callback(value, props, state)) {
				if (element.uid === Enum.component) {
					switch (typeof value) {
						case 'function':
							return enqueue(fiber, element, value, callback, props, state)
						case 'object':
							if (typeof value.then !== 'function') {
								element.value = element, Utility.assign(state, value)
							} else {
								dequeue(fiber, element, value)
							}
					}
				}
			}
		} else {
			for (var i = 0; i < callback.length; i++) {
				enqueue(fiber, element, value, callback[i], props, state)
			}
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 */
export function dequeue (fiber, element, value) {
	// return Utility.resolve(value, function (value) {
	// 	dispatch(element, value, function (value) {
	// 		console.log('async', value)
	// 		return value
	// 	})
	// })

	Schedule.promise(fiber, value, function (value) {
		resolve (fiber, element, value, function (value) { return value })
	}, Exception.throws(fiber, element, element))
}
