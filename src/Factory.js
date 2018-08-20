import * as Element from './Element.js'

/**
 * @param {*} type
 * @return {function}
 */
export function from (type) {
	return Element.create.bind(null, type)
}
