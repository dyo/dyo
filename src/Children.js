import * as Utility from './Utility.js'

export default {toArray: array, forEach: each, count: count, map: map, filter: filter, find: find}

/**
 * @param {any} value
 * @return {any[]}
 */
export function array (value) {
	return Utility.each(value, null, value = [], pusher), value
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {void}
 */
export function each (value, callback) {
	return Utility.each(value, callback, {length: 0}, caller)
}

/**
 * @param {any} value
 * @return {number}
 */
export function count (value) {
	return Utility.each(value, null, value = {length: 0}, counter), value.length
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {any[]}
 */
export function map (value, callback) {
	return Utility.each(value, callback, value = [], mapper), value
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {any[]}
 */
export function filter (value, callback) {
	return Utility.each(value, callback, value = [], filterer), value
}

/**
 * @param {any} value
 * @param {function} callback
 * @return {any?}
 */
export function find (value, callback) {
	return Utility.each(value, callback, value = {value: null}, finder), value.value
}

/**
 * @param {any} value
 * @param {function} callback
 * @param {any[]} children
 */
export function pusher (value, callback, children) {
	children.push(value)
}

/**
 * @param {any} value
 * @param {function} callback
 * @param {any[]} children
 */
export function caller (value, callback, children) {
	callback(value, counter(value, callback, children), children)
}

/**
 * @param {any} value
 * @param {any?} callback
 * @param {any[]} children
 * @return {number}
 */
export function counter (value, callback, children) {
	return children.length++
}

/**
 * @param {any} value
 * @param {function} callback
 * @param {any[]} children
 */
export function mapper (value, callback, children) {
	pusher(execute(value, callback, children), callback, children)
}

/**
 * @param {any} value
 * @param {function} callback
 * @param {any[]} children
 */
export function filterer (value, callback, children) {
	if (execute(value, callback, children)) {
		pusher(value, callback, children)
	}
}

/**
 * @param {any} value
 * @param {function} callback
 * @param {any[]} children
 * @return {void?}
 */
export function finder (value, callback, children) {
	if (execute(value, callback, children)) {
		return children.value = value, null
	}
}

/**
 * @param {any} value
 * @param {function} callback
 * @param {any[]} children
 * @return {any}
 */
export function execute (value, callback, children) {
	return callback(value, children.length, children)
}
