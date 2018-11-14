import * as Utility from './Utility.js'
import * as Element from './Element.js'

export var development = Utility.environment() === 'development'

/**
 * @param {object} element
 * @param {object?} properties
 * @param {string} origin
 */
export function types (element, properties, origin) {
	if (development) {
		dispatch(element, properties, element.type[origin], origin)
	}
}

/**
 * @param {object} element
 * @param {object} properties
 * @param {object?} validators
 * @param {string} origin
 */
export function dispatch (element, properties, validators, origin) {
	if (validators) {
		if (typeof validators === 'function') {
			dispatch(element, properties, validators.call(element.type, properties), origin)
		} else {
			validate(Element.display(element), properties, validators, origin)
		}
	}
}

/**
 * @param {string} element
 * @param {object} properties
 * @param {object?} validators
 * @param {string} origin
 */
export function validate (element, properties, validators, origin) {
	for (var key in validators) {
		if (key = validators[key](properties, key, element, origin)) {
			throw key
		}
	}
}
