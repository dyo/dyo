import * as Element from './Element.js'

/**
 * @param {object} element
 * @param {object?} values
 * @param {string} from
 */
export function types (element, values, from) {
	validate(element, values, element.type[from])
}

/**
 * @param {object} element
 * @param {object} values
 * @param {object?} validators
 * @return {object}
 */
export function validate (element, values, validators) {
	if (validators) {
		if (typeof validators === 'function') {
			validate(element, values, validators.call(element.type, values))
		} else {
			for (var key in validators) {
				if (key = validators[key](element.type, values, key, Element.display(element))) {
					throw key
				}
			}
		}
	}
}
