import * as Dyo from '../../index.js'
import * as Stringify from './Stringify.js'

/**
 * @param {object} element
 * @param {object} target
 * @param {function?} callback
 * @return {object}
 */
export function render (element, target, callback) {
	return Dyo.render(element, target, dispatch).then(callback)
}

/**
 * @param {object} target
 */
export function dispatch (target) {
	resolve(target, doctype(Stringify.element(this)))
}

/**
 * @param {object} target
 * @param {string} payload
 */
export function resolve (target, payload) {
	if (typeof target.send === 'function') {
		target.send(payload)
	} else if (typeof target.end === 'function') {
		target.end(payload)
	} else {
		target.body = payload
	}
}

/**
 * @param {string} payload
 * @return {string}
 */
export function doctype (payload) {
	return payload.substring(0, 5) === '<html' ? '<!doctype html>' + payload : payload
}
