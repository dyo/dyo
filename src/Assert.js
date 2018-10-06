import * as Element from './Element.js'

/**
 * @param {object} element
 * @param {object?} properties
 * @param {string} origin
 */
export function types (element, properties, origin) {
	// TODO
	if ('development' === 'development') {
		validate(element, properties, element.type[origin], origin)
	}
}

/**
 * @param {object} element
 * @param {object} properties
 * @param {object?} validators
 * @param {string} origin
 * @return {object}
 */
export function validate (element, properties, validators, origin) {
	if (validators) {
		if (typeof validators === 'function') {
			validate(element, properties, validators.call(element.type, properties), origin)
		} else {
			for (var key in validators) {
				if (key = validators[key](properties, key, Element.display(element), origin)) {
					throw key
				}
			}
		}
	}
}
