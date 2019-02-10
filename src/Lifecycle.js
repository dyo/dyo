import * as Utility from './Utility.js'
import * as Element from './Element.js'

/**
 * @param {object} element
 * @return {object}
 */
export function state (element) {
	return element.state !== null ? element.state : element.state = {stack: null}
}

/**
 * @param {object} element
 * @param {object} value
 */
export function refs (element, value) {
	element.ref !== null ? element.ref.push(value) : element.ref = [value]
}

/**
 * @param {object} element
 */
export function defs (element) {
	if (element.ref !== null) {
		for (var i = 0, ref = element.ref, value = element.ref = null; i < ref.length; i++) {
			if (value = ref[i]()) {
				if (Element.active(element) && Utility.thenable(value)) {
					refs(element, value)
				}
			}
		}
	}
}
