import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Children from './Children.js'
import * as Assert from './Assert.js'
import * as Event from './Event.js'

/**
 * @constructor
 * @param {number} uid
 * @param {*} key
 * @param {*} type
 * @param {object} props
 * @param {object} children
 */
export var struct = Utility.extend(function (uid, key, type, props, children) {
	this.uid = uid
	this.key = key
	this.type = type
	this.props = props
	this.children = children
	this.ref = null
	this.host = null
	this.owner = null
	this.parent = null
	this.context = null
	this.instance = null
}, {
	/**
	 * @type {function}
	 */
	handleEvent: {value: Event.handle}
})

/**
 * @param {*} key
 * @return {object}
 */
export function empty (key) {
	return new struct(Enum.empty, key, '#empty', null, '')
}

/**
 * @param {(number|string)} value
 * @param {*} key
 * @return {object}
 */
export function text (value, key) {
	return new struct(Enum.text, key, '#text', null, value)
}

/**
 * @param {(number|string)} value
 * @param {*} key
 * @return {object}
 */
export function comment (value, key) {
	return new struct(Enum.comment, key, '#comment', null, value)
}

/**
 * @param {object} value
 * @param {*} key
 * @return {object}
 */
export function fragment (value, key) {
	return new struct(Enum.fragment, key, '#fragment', null, (value.push(empty(Enum.key)), value))
}

/**
 * @param {*} value
 * @param {*} type
 * @param {*} props
 * @return {object}
 */
export function portal (value, type, props) {
	return new struct(Enum.portal, props && props.key, '#portal', null, [target(value, type, props)])
}

/**
 * @param {*} value
 * @param {*} type
 * @param {*} props
 * @return {object}
 */
export function target (value, type, props) {
	return new struct(Enum.target, null, type, props, [root(value)])
}

/**
 * @param {object} value
 * @return {object}
 */
export function root (value) {
	return from([value], 0)
}

/**
 * @param {object} value
 * @return {object?}
 */
export function children (value) {
	return [from(value !== null && typeof value === 'object' && 'default' in value ? value.default : value, 0), empty(Enum.key)]
}

/**
 * @param {*} value
 * @param {number} index
 * @return {object}
 */
export function from (value, index) {
	if (value != null) {
		switch (typeof value) {
			case 'number': case 'string':
				return text(value, Utility.hash(index))
			case 'boolean':
				return from(null, index)
			case 'function':
				break
			default:
				if (value.constructor === struct) {
					return value
				} else if (value.length > -1) {
					return fragment(value.map(from), Utility.hash(index))
				} else if (Utility.iterable(value)) {
					return fragment(Children.map(value, from), Utility.hash(index))
				}
		}
	} else {
		return empty(Utility.hash(index))
	}

	return create(value)
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
	var uid = identity(a)
	var type = a
	var props = i === 2 && b || {}
	var children = []
	var element = new struct(uid, props.key, type, props, children)

	if (uid === Enum.component) {
		if (size > 0) {
			for (props.children = size === 1 ? arguments[i++] : children = []; i < length; ++i) {
				children.push(arguments[i])
			}
		}
		if (type[Enum.defaultProps]) {
			defaults(element, type[Enum.defaultProps])
		}

		Assert.types(element, props, Enum.propTypes)
	} else {
		if (size > 0) {
			for (; i < length; ++i) {
				children[index] = from(arguments[i], index++)
			}
		}

		children[index] = empty(Enum.key)
	}

	return element
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
 * @param {*} value
 * @return {string}
 */
export function display (value) {
	switch (typeof value) {
		case 'function':
			return display(value[Enum.displayName] || value.name)
		case 'object':
			return display(value.type)
	}

	return value
}

/**
 * @param {object} element
 * @param {object?} value
 * @return {object}
 */
export function defaults (element, value) {
	if (typeof value === 'function') {
		defaults(element, value.call(element.type, element.props))
	} else {
		Utility.defaults(element.props, value)
	}

	return element
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
 * @param {*} element
 * @return {boolean}
 */
export function valid (element) {
	return element instanceof struct
}

/**
 * @param {object} element
 * @return {object}
 */
export function parent (element) {
	return element.uid < Enum.target ? parent(element.parent) : element
}

/**
 * @param {object} element
 * @return {object}
 */
export function sibling (element) {
	return element.uid < Enum.target ? sibling(pick(element)) : element
}

/**
 * @param {object} element
 * @return {boolean}
 */
export function active (element) {
	return element.parent !== null
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
 * @param {object} value
 * @return {object}
 */
export function put (element, value) {
	return element.children[0] = value
}
