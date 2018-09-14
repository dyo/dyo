import * as Enum from './Enum.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'
import * as Node from './Node.js'
import * as Interface from './Interface.js'

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
export function unmount (parent, element) {
	if (element[Enum.state]) {
		if (Utility.thenable(element[Enum.state])) {
			return element[Enum.state].then(function () {
				remove(parent, element)
			})
		}
	}

	remove(parent, element)
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
 * @param {object} props
 * @param {number} from
 */
export function properties (element, props, from) {
	if (props) {
		for (var key in props) {
			switch (key) {
				case 'ref':
					refs(element, props[key], from)
				case 'key':
				case 'children':
					break
				default:
					Interface.commit(element, key, props[key], element[Enum.namespace], from)
			}
		}
	}
}

/**
 * @param {object} element
 * @param {*?} value
 * @param {number?} from
 */
export function refs (element, value, from) {
	switch (from) {
		default:
			Lifecycle.refs(element, element[Enum.ref], null)
		case Enum.create:
			if (next) {
				Lifecycle.refs(element, element[Enum.ref] = value, element.owner)
			}
	}
}

/**
 * @param {object} element
 * @param {function} value
 * @param {*} instance
 */
export function callback (element, value, instance) {
	switch (typeof value) {
		case 'function':
			return value.call(instance, instance.props, instance.state)
		case 'string':
			return Lifecycle.resolve(instance, Interface.callback(instance[value], instance, element.props, element.state), value)
	}
}
