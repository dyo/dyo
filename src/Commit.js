import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'
import * as Interface from './Interface.js'

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 */
export function unmount (parent, element, children) {
	if (element !== children) {
		if (Utility.thenable(Element.get(element, Enum.context))) {
			return Utility.resolve(Element.get(element, Enum.context), function () {
				unmount(parent, children, children)
			})
		}
	}

	remove(Element.parent(parent), children)
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function mount (parent, element, sibling) {
	if (sibling) {
		insert(Element.parent(parent), element, Element.sibling(sibling))
	} else {
		append(Element.parent(parent), element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function remove (parent, element) {
	if (element.constructor < Enum.portal) {
		element.children.forEach(function (element) {
			remove(parent, element)
		})
	} else {
		Interface.remove(parent, element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	if (element.constructor < Enum.portal) {
		element.children.forEach(function (element) {
			append(parent, element)
		})
	} else {
		Interface.append(parent, element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	if (element.constructor < Enum.portal) {
		element.children.forEach(function (element) {
			insert(parent, element, sibling)
		})
	} else {
		Interface.insert(parent, element, sibling)
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
		update(element, Interface.props(element, value, origin), Element.get(element, Enum.context), origin)
	}
}

/**
 * @param {object} element
 * @param {object} value
 * @param {*} namespace
 * @param {number} origin
 */
export function update (element, value, namespace, origin)  {
	for (var key in value) {
		switch (key) {
			case 'ref':
				refs(element, value[key], origin)
			case 'key':
			case 'children':
				break
			default:
				Interface.update(element, key, value[key], namespace, origin)
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
			if (value) {
				Lifecycle.refs(element, Element.set(element, Enum.ref, value), Element.get(element, Enum.owner))
			}
	}
}
