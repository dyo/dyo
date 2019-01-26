import * as Utility from './Utility.js'
import * as Element from './Element.js'

export default {each: each, count: count, map: map, find: find, filter: filter}

/**
 * @param {any} value
 * @param {function} callback
 * @return {void}
 */
export function each (value, callback) {
	Utility.each(callback, value, 0, 0, [])
}

/**
 * @param {any} value
 * @return {number}
 */
export function count (value) {
	return Utility.each(function (value, index, children) {
		children.value = index
	}, value, 1, 0, {value: 0}).value
}


/**
 * @param {any} value
 * @param {function} callback
 * @return {object[]}
 */
export function map (value, callback) {
	return Utility.each(function (value, index, children) {
		children[index] = callback(value, index, children)
	}, value, 0, 0, [])
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {any?}
 */
export function find (value, callback) {
	return Utility.each(function (value, index, children) {
		if (callback(value, index, children)) {
			return children.value = value, true
		}
	}, value, 0, 0, {value: null}).value
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {object[]}
 */
export function filter (value, callback) {
	return Utility.each(function (value, index, children) {
		if (callback(value, index, children)) {
			children.push(value)
		}
	}, value, 0, 0, [])
}
