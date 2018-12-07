import * as Enum from './Enum.js'

/**
 * @param {object} key
 * @return {*}
 */
export function get (key) {
	return key[Enum.uid]
}

/**
 * @param {object} key
 * @param {*} value
 */
export function set (key, value) {
	return key[Enum.uid] = value
}
