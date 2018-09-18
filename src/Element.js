import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Children from './Children.js'
import * as Assert from './Assert.js'
import * as Event from './Event.js'

/**
 * @param {*} key
 * @param {*} type
 * @param {object} props
 * @param {object} children
 * @param {number} constructor
 */
function construct (key, type, props, children, constructor) {
	return {key: key, type: type, props: props, children: children, constructor: constructor, handleEvent: Event.handle, 0: Enum.active}
}

/**
 * @param {*} children
 * @param {*} target
 * @param {*} key
 * @return {object}
 */
export function portal (children, target, key) {
	return construct(key, target, null, [root([children])], Enum.portal)
}

/**
 * @param {object} children
 * @param {*} key
 * @return {object}
 */
export function fragment (children, key) {
	return construct(key, '#fragment', null, (children.push(empty(Enum.key)), children), Enum.fragment)
}

/**
 * @param {(number|string)} children
 * @param {*} key
 * @return {object}
 */
export function text (children, key) {
	return construct(key, '#text', null, children, Enum.text)
}

/**
 * @param {*} key
 * @return {object}
 */
export function empty (key) {
	return construct(key, '#empty', null, '', Enum.empty)
}

/**
 * @param {(number|string)} children
 * @param {*} key
 * @return {object}
 */
export function comment (children, key) {
	return construct(key, '#comment', null, children, Enum.comment)
}

/**
 * @param {object} element
 * @return {object}
 */
export function root (element) {
	return from(element, 0)
}

/**
 * @param {*} value
 * @return {object}
 */
export function children (value) {
	return [root(value), empty(Enum.key)]
}

/**
 * @param {*} a
 * @param {(object|*)?} b
 * @param {...*?}
 * @return {object}
 * @public
 */
export function create (a, b) {
	var index = 0
	var length = arguments.length
	var i = b == null || b.constructor === Utility.object ? 2 : 1
	var size = length - i
	var constructor = identity(a)
	var type = a
	var props = i === 2 && b || {}
	var children = []
	var element = construct(props.key, type, props, children, constructor)

	if (constructor === Enum.component) {
		if (size > 0) {
			for (props.children = size === 1 ? arguments[i++] : children = []; i < length; ++i) {
				children.push(arguments[i])
			}
		}
		if (type[Enum.defaultProps]) {
			defaults(element, type[Enum.defaultProps])
		}
		if ('development' === 'development') {
			Assert.types(element, props, Enum.propTypes)
		}
	} else {
		if (size > 0) {
			for (; i < length; ++i) {
				children[index] = from(arguments[i], index++)
			}
		}
		if (constructor < Enum.node) {
			children.push(empty(Enum.key))
		}
	}

	return element
}

/**
 * @param {*} value
 * @param {number} index
 * @return {object}
 */
export function from (value, index) {
	if (value != null) {
		switch (typeof value) {
			case 'boolean':
				break
			case 'number':
			case 'string':
				return text(value, Utility.hash(index))
			default:
				switch (value.constructor) {
					case Enum.thenable:
					case Enum.fragment:
					case Enum.component:
					case Enum.node:
					case Enum.comment:
						return value
					case Enum.portal:
						return fragment([empty(Utility.hash(Enum.key)), value], value.key)
				}

				if (value.length > -1) {
					return fragment(value.map(from), Utility.hash(index))
				} else if (Utility.iterable(value)) {
					return fragment(Children.map(value, from), Utility.hash(index))
				} else {
					return create(value.default || value)
				}
		}
	}

	return empty(Utility.hash(index))
}

/**
 * @param {*} value
 * @return {number}
 */
export function identity (value) {
	switch (typeof value) {
		case 'function':
			return Enum.component
		case 'number':
			return Enum.fragment
		case 'object':
			if (Utility.thenable(value)) {
				return Enum.thenable
			}
	}

	return Enum.node
}

/**
 * @param {object} element
 * @param {object?} value
 * @return {object}
 */
export function defaults (element, value) {
	if (value) {
		if (typeof value === 'function') {
			defaults(element, value.call(element.type, element.props))
		} else {
			for (var key in value) {
				if (element.props[key] === undefined) {
					element.props[key] = value[key]
				}
			}
		}
	}

	return element
}

/**
 * @param {*} value
 * @return {string}
 */
export function display (value) {
	switch (typeof value) {
		case 'function':
			return display(value[Enum.displayName] || value.name)
		case 'object':
			return display(value.type)
		case 'number':
			return display('Fragment')
	}

	return value
}

/**
 * @param {*} element
 * @return {boolean}
 */
export function valid (element) {
	return element != null && typeof element.constructor === 'number'
}

/**
 * @param {object} value
 * @param {...*?}
 * @return {object}
 */
export function clone (element) {
	return defaults(create.apply(null, [element.type].concat([].slice.call(arguments, 1))), element.props)
}

/**
 * @param {object} element
 * @param {object} value
 * @return {object}
 */
export function put (element, value) {
	return element.children[0] = value
}

/**
 * @param {object} element
 * @return {object}
 */
export function pick (element) {
	return element.children[0]
}

/**
 * @param {object} element
 * @return {object}
 */
export function resolve (element) {
	return element.constructor < Enum.node ? resolve(pick(element)) : element
}

/**
 * @param {object} element
 * @param {number} from
 * @return {object}
 */
export function parent (element) {
	return element.constructor < Enum.portal && element[Enum.active] > Enum.active ? parent(element[Enum.parent]) : element
}
