import * as Dyo from '../../index.js'
import * as Stringify from './Stringify.js'

/**
 * @param {object} value
 */
export function header (value) {
	if (typeof value === 'object') {
		value['content-type'] = value['content-type'] || 'text/html'
	}
}

/**
 * @param {object} value
 */
export function flush (value) {
	if (typeof value.end === 'function') {
		if (!value.finished) {
			value.end()
		}
	}
}

/**
 * @param {object} value
 */
export function write (value) {
	if (typeof value.write === 'function') {
		value.write(Stringify.element(this))
	}
}

/**
 * @param {object} element
 * @param {object} target
 * @param {function?} callback
 * @return {object}
 */
export function render (element, target, callback) {
	try {
		header(target.headers)
	} finally {
		return Dyo.render(element, target, write).then(callback).then(flush)
	}
}
