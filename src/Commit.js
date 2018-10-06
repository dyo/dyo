import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'
import * as Schedule from './Schedule.js'
import * as Interface from './Interface.js'

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 */
export function unmount (parent, element, children) {
	if (Element.has(parent, Enum.parent)) {
		if (element === children) {
			remove(parent, children)
		} else if (Utility.thenable(Element.get(element, Enum.context))) {
			Utility.resolve(Element.get(element, Enum.context), function () {
				unmount(parent, children)
			})
		} else {
			remove(parent, children)
		}
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function mount (parent, element, sibling) {
	if (sibling) {
		insert(parent, element, sibling)
	} else {
		append(parent, element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function remove (parent, element) {
	if (element.constructor < Enum.node) {
		element.children.forEach(function (element) {
			remove(parent, element)
		})
	} else {
		Interface.remove(Element.parent(parent), element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	if (element.constructor < Enum.node) {
		element.children.forEach(function (element) {
			append(parent, element)
		})
	} else {
		Interface.append(Element.parent(parent), element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	if (element.constructor < Enum.node) {
		element.children.forEach(function (element) {
			insert(parent, element, sibling)
		})
	} else {
		Interface.insert(Element.parent(parent), element, Element.resolve(sibling))
	}
}

/**
 * @param {object} element
 * @param {(string|number)} value
 */
export function content (element, value) {
	Interface.content(element, value)
}

/**
 * @param {object} element
 * @param {object} value
 * @param {number} origin
 */
export function props (element, value, origin) {
	if (value) {
		for (var key in value) {
			switch (key) {
				case 'ref':
					refs(element, value[key], origin)
				case 'key':
				case 'children':
					break
				default:
					Interface.commit(element, key, value[key], Element.get(element, Enum.context), origin)
			}
		}
	}
}

/**
 * @param {object} element
 * @param {*?} value
 * @param {number?} origin
 */
export function refs (element, value, origin) {
	switch (origin) {
		default:
			Lifecycle.refs(element, Element.get(element, Enum.ref), null)
		case Enum.create:
			if (origin) {
				Lifecycle.refs(element, Element.set(element, Enum.ref, value), Element.get(element, Enum.owner))
			}
	}
}
