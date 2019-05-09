import * as Utility from './Utility.js'

/**
 * @param {object} element
 * @return {any[]}
 */
export function create (element) {
	return element.stack !== null ? element.stack : element.stack = []
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
		if (Utility.callable(value = array[i])) {
			if (Utility.thenable(value = value())) {
				create(element).push(defer = value)
			}
		}
	}

	return defer
}

/**
 * @param {object} element
 * @param {any?} value
 * @return {any?}
 */
export function resolve (element, value) {
	return Utility.callable(value) ? value(element.props) : value
}
