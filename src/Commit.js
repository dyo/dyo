import * as Enum from './Enum.js'
import * as Element from './Element.js'
import * as Interface from './Interface.js'
import * as Schedule from './Schedule.js'

/**
 * @param {object} parent
 * @param {object} element
 */
export function unmount (parent, element) {
	if (element !== undefined) {
		remove(Element.parent(parent), element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object?} sibling
 */
export function mount (parent, element, sibling) {
	if (sibling !== undefined) {
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
	var identity = element.identity

	if (identity < Enum.portal) {
		var children = element.children

		if (identity !== Enum.component) {
			for (var i = 0; i < children.length; i++) {
				remove(parent, children[i])
			}
		} else {
			remove(parent, children[0])
		}
	} else {
		Interface.remove(parent.value, element.value)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	var identity = element.identity

	if (identity < Enum.portal) {
		var children = element.children

		if (identity !== Enum.component) {
			for (var i = 0; i < children.length; i++) {
				append(parent, children[i])
			}
		} else {
			append(parent, children[0])
		}
	} else {
		Interface.append(parent.value, element.value)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	var identity = element.identity

	if (identity < Enum.portal) {
		var children = element.children

		if (identity !== Enum.component) {
			for (var i = 0; i < children.length; i++) {
				insert(parent, children[i], sibling)
			}
		} else {
			insert(parent, children[0], sibling)
		}
	} else {
		Interface.insert(parent.value, element.value, sibling.value)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function target (parent, element) {
	element.value = Interface.target(element.type, parent.owner)
}

/**
 * @param {object} element
 * @param {(string|number)} value
 */
export function content (element, value) {
	Interface.content(element.value, value)
}

/**
 * @param {object} element
 * @param {object} value
 */
export function props (element, value) {
	properties(element, value, element.value, true)
}

/**
 * @param {object} element
 * @param {object} value
 * @param {object} instance
 * @param {boolean} active
 */
export function properties (element, value, instance, active)  {
	if (value !== null) {
		for (var key in value) {
			switch (key) {
				case 'ref':
					refs(element, value[key], instance)
				case 'key': case 'target': case 'children':
					break
				default:
					Interface.properties(key, value[key], instance, element, active)
			}
		}
	}
}

/**
 * @param {object} element
 * @param {object?} value
 * @param {object?} instance
 */
export function refs (element, value, instance) {
	if (element.owner !== null) {
		reference(element, element.stack, null)
		reference(element, element.stack = value, instance)
	}
}

/**
 * @param {object} element
 * @param {object?} value
 * @param {object?} instance
 */
export function reference (element, value, instance) {
	if (value !== null) {
		switch (typeof value) {
			case 'string': return instance && Schedule.callback(element, instance, Interface.callback(value))
			case 'function': return Schedule.callback(element, instance, value)
			case 'object': value.current = instance
		}
	}
}
