import * as Utility from './Utility.js'

/**
 * @param {object} element
 * @return {object}
 */
export function state (element) {
	return element.state !== null ? element.state : element.state = {stack: null}
}

/**
 * @return {}
 */
export function stack (element) {
	return element.stack !== null ? element.stack : element.stack = []
}

/**
 * @param {object} element
 * @param {number} index
 * @param {function} value
 * @return {number}
 */
export function enqueue (element, index, value) {
	var array = stack(element)

	if (index === 0) {
		return array[index = array.length] = value, index + 1
	} else {
		return array[index - 1] = value, 0
	}
}

/**
 * @param {object} element
 * @param {number} index
 * @return {any?}
 */
export function dequeue (element, index) {
	if (index !== 0) {
		element.stack[index - 1]()
	}
}

/**
 * @param {object} element
 * @return {object?}
 */
export function destroy (element) {
	var defer = null
	var array = element.stack
	var value = element.stack = null

	for (var i = 0; i < array.length; i++) {
		if (value = array[i]()) {
			if (Utility.thenable(value)) {
				enqueue(element, 0, defer = value)
			}
		}
	}

	return defer
}
