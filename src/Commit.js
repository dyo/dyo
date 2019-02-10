import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Interface from './Interface.js'

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 */
export function enqueue (parent, element, children) {
	Utility.resolve(element.ref, function () {
		if (Element.active(parent)) {
			unmount(parent, children, children)
		}
	})
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 */
export function unmount (parent, element, children) {
	if (element !== children) {
		if (element.ref !== null) {
			return enqueue(parent, element, children)
		}
	}

	remove(Element.parent(parent), children)
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
	var uid = element.uid

	if (uid < Enum.portal) {
		var children = element.children

		if (uid !== Enum.component) {
			for (var i = 0; i < children.length; i++) {
				remove(parent, children[i])
			}
		} else {
			remove(parent, children[0])
		}
	} else {
		Interface.remove(parent.ref, element.ref)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	var uid = element.uid

	if (uid < Enum.portal) {
		var children = element.children

		if (uid !== Enum.component) {
			for (var i = 0; i < children.length; i++) {
				append(parent, children[i])
			}
		} else {
			append(parent, children[0])
		}
	} else {
		Interface.append(parent.ref, element.ref)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	var uid = element.uid

	if (uid < Enum.portal) {
		var children = element.children

		if (uid !== Enum.component) {
			for (var i = 0; i < children.length; i++) {
				insert(parent, children[i], sibling)
			}
		} else {
			insert(parent, children[0], sibling)
		}
	} else {
		Interface.insert(parent.ref, element.ref, sibling.ref)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function target (parent, element) {
	element.ref = Interface.target(element.type, parent.owner), append(element, element)
}

/**
 * @param {object} element
 * @param {(string|number)} value
 */
export function content (element, value) {
	Interface.content(element.ref, value)
}

/**
 * @param {object} element
 * @param {object} value
 */
export function props (element, value) {
	properties(element, value, element.ref)
}

/**
 * @param {object} element
 * @param {object} value
 * @param {object} instance
 */
export function properties (element, value, instance)  {
	if (value !== null) {
		for (var key in value) {
			switch (key) {
				case 'ref':
					value[key].current = instance
				case 'key':
					break
				default:
					Interface.props(key, value[key], instance, element)
			}
		}
	}
}
