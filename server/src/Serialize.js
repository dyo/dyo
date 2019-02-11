import * as Dyo from '../../index.js'
import * as Stringify from './Stringify.js'

/**
 * @param {object} element
 * @param {object} target
 * @param {function?} callback
 * @return {object}
 */
export function render (element, target, callback) {
	return Dyo.render(element, target, flush).then(callback)
}

/**
 * @param {object} value
 */
export function flush (target) {
	write(target, Stringify.element(this))
}

/**
 * @param {object} target
 * @param {string} payload
 */
export function write (target, payload) {
	if (typeof target.end === 'function') {
		target.end(payload)
	} else if (typeof target.send === 'function') {
		target.send(payload)
	} else {
		target.body = payload
	}
}
