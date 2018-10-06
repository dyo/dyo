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
	}, value, 0)

	return length
}

/**
 * @param {*} value
 * @param {function} callback
 * @return {Array}
 */
export function filter (value, callback) {
	if (value != null) {
		var children = []

		Utility.each(function (v, i) {
			if (callback(v, i)) {
				children.push(v)
			}
		}, value, 0)

		return children
	}
}

/**
 * @param {*} value
 * @param {function} callback
 * @return {*?}
 */
export function find (value, callback) {
	if (value != null) {
		var children = null

		Utility.each(function (v, i) {
			if (callback(v, i)) {
				return children = v
			}
		}, value, 0)

		return children
	}
}

/**
 * @param {*} value
 * @param {function} callback
 * @return {Array}
 */
export function map (value, callback) {
	if (value != null) {
		var children = []

		Utility.each(function (v, i) {
			children.push(callback(v, i))
		}, value, 0)

		return children
	}
}

/**
 * @param {*} value
 * @param {function} callback
 */
export function each (value, callback) {
	if (value != null) {
		Utility.each(function (v, i) {
			callback(v, i)
		}, value, 0)
	}
}

/**
 * @param {*} value
 * @return {Array}
 */
export function array (value) {
	var children = []

	Utility.each(function (v) {
		children.push(v)
	}, value, 0)

	return children
}
