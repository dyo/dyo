import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'

export default {only: only, count: count, filter: filter, find: find, map: map, forEach: each, toArray: array}

/**
 * @throws {Error} if invalid element
 * @param {*} value
 * @return {object?}
 */
export function only (value) {
	if (Element.valid(value)) {
		return value
	} else {
		Utility.invariant('Expected to receive a single element!')
	}
}

/**
 * @memberof Children
 * @param {*} value
 * @return {number}
 */
export function count (value) {
	var length = 0

	Utility.each(function () {
		length++
	}, value)

	return length
}

/**
 * @param {*} value
 * @param {function} callback
 * @param {*} that
 */
export function filter (value, callback, that) {
	if (value != null) {
		var children = []

		Utility.each(function (v, i) {
			if (callback.call(that, v, i, value)) {
				children[i] = v
			}
		}, value)

		return children
	}
}

/**
 * @param {*} value
 * @param {function} callback
 * @param {*} that
 */
export function find (value, callback, that) {
	if (value != null) {
		var children = null

		Utility.each(function (v, i) {
			if (callback.call(that, v, i, value)) {
				return children = v
			}
		}, value)

		return children
	}
}

/**
 * @param {*} value
 * @param {function} callback
 * @param {*} that
 * @return {Array<*>}
 */
export function map (value, callback, that) {
	if (value != null) {
		var children = []

		Utility.each(function (v, i) {
			children[i] = callback.call(that, v, i, value)
		}, value)

		return children
	}
}

/**
 * @param {*} value
 * @param {function} callback
 * @param {*} that
 */
export function each (value, callback, that) {
	if (value != null) {
		Utility.each(function (v, i) {
			callback.call(that, v, i, value)
		}, value)
	}
}

/**
 * @param {*} value
 * @return {Array<*>}
 */
export function array (value) {
	var children = []

	Utility.each(function (v) {
		children.push(v)
	}, value)

	return children
}
