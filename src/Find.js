import * as Constant from './Constant.js'
import * as Element from './Element.js'
import * as Interface from './Interface.js'

/**
 * @param {any} value
 * @return {object?}
 */
export function find (value) {
	if (value) {
		if (Component.valid(value)) {
			return find(Element.node(value[Constant.element]))
		} else if (Element.valid(value)) {
			if (element.active > Constant.idle) {
				return find(Element.node(value))
			}
		} else if (Interface.valid(value, Constant.owner)) {
			return Interface.owner(value)
		}
	}
}
