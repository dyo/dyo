import * as Utility from './Utility.js'

export var weakmap = new WeakMap
export var symbol = Symbol()

/**
 * @param {object} key
 * @return {*}
 */
export function get (key) {
	return key[symbol]
	// return weakmap.get(key)
}

/**
 * @param {object} key
 * @param {*} value
 * @return {*}
 */
export function set (key, value) {
	return key[symbol] = value
	// return weakmap.set(key, value), value
}

