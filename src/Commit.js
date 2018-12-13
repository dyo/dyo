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
		if (element.context) {
			if (Utility.thenable(element.context)) {
				return Utility.resolve(element.context, unmount.bind(null, parent, children, children))
			}
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
	if (element !== sibling) {
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
	if (element.uid < Enum.portal) {
		element.children.forEach(function (element) {
			remove(parent, element)
		})
	} else {
		Interface.remove(parent.instance, element.instance)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	if (element.uid < Enum.portal) {
		element.children.forEach(function (element) {
			append(parent, element)
		})
	} else {
		Interface.append(parent.instance, element.instance)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	if (element.uid < Enum.portal) {
		element.children.forEach(function (element) {
			insert(parent, element, sibling)
		})
	} else {
		Interface.insert(parent.instance, element.instance, sibling.instance)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {(string|number)} value
 */
export function content (parent, element, value) {
	Interface.content(element.instance, value)
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} value
 */
export function props (parent, element, value) {
	if (value) {
		set(element, value, element.instance)
	}
}

/**
 * @param {object} element
 * @param {object} value
 * @param {object} instance
 */
export function set (element, value, instance)  {
	for (var key in value) {
		switch (key) {
			case 'ref':
				ref(element, value[key], instance)
			case 'key':
				break
			default:
				Interface.props(key, value[key], instance, element)
		}
	}
}

/**
 * @param {object} element
 * @param {*?} value
 * @param {object} instance
 */
export function ref (element, value, instance) {
	Lifecycle.ref(element, element.ref, null)

	if (value) {
		Lifecycle.ref(element, element.ref = value, instance)
	}
}
