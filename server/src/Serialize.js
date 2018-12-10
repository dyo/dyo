import * as Dyo from '../../index.js'
import * as Stringify from './Stringify.js'

/**
 * @param {object} value
 */
export function flush (value) {
	if (typeof value.end === 'function') {
		value.end(Stringify.element(this))
	}
}

/**
 * @param {object} element
 * @param {object} target
 * @param {function?} callback
 * @return {object}
 */
export function render (element, target, callback) {
	return Dyo.render(element, target, flush).then(callback)
}
