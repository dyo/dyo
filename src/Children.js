import * as Utility from './Utility.js'

export default {toArray: array, forEach: each, count: count, map: map, filter: filter, find: find}

/**
 * @param {any} value
 * @return {any[]}
 */
export function array (value) {
	Utility.each(function (value, index, array) {
		array[index] = value
	}, value, 0, value = [])

	return value
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {void}
 */
export function each (value, callback) {
	Utility.each(function (value, index, array) {
		callback(value, index, array)
	}, value, 0, [])
}

/**
 * @param {any} value
 * @return {number}
 */
export function count (value) {
	Utility.each(function (value, index, children) {
		children.value = index
	}, value, 1, value = {value: 0})

	return value.value
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {object[]}
 */
export function map (value, callback) {
	Utility.each(function (value, index, array) {
		array[index] = callback(value, index, array)
	}, value, 0, value = [])

	return value
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {object[]}
 */
export function filter (value, callback) {
	Utility.each(function (value, index, array) {
		if (callback(value, index, array)) {
			array.push(value)
		}
	}, value, 0, value = [])

	return value
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {any?}
 */
export function find (value, callback) {
	Utility.each(function (value, index, object) {
		if (callback(value, index, object)) {
			return object.value = value, null
		}
	}, value, 0, value = {value: null})

	return value.value
}
