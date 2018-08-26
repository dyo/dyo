import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Children from './Children.js'
import * as Assert from './Assert.js'
import * as Event from './Event.js'

/**
 * @type {object}
 */
export var descriptors = {
	/**
	 * @type {sybmol}
	 */
	constructor: {
		value: Constant.node
	},
	/**
	 * @type {function}
	 */
	handleEvent: {
		value: Event.handle
	}
}

/**
 * @constructor
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 */
export var construct = Utility.extend(function (host, parent, element) {
	this.key = element.key
	this.id = element.id
	this.type = element.type
	this.props = element.props
	this.children = element.children
	this.ref = null
	this.host = host
	this.xmlns = ''
	this.state = null
	this.owner = null
	this.parent = parent
	this.active = Constant.idle
}, descriptors)

/**
 * @constructor
 * @param {number} id
 * @param {*} type
 * @param {Array<object>} children
 * @param {object} props
 * @param {*} key
 */
export var struct = Utility.extend(function (id, type, props, children, key) {
	this.key = key
	this.id = id
	this.type = type
	this.props = props
	this.children = children
}, descriptors)

/**
 * @return {object}
 */
export function target () {
	return new construct(null, null, root([]))
}

/**
 * @param {Array<object>} children
 * @return {object}
 */
export function root (children) {
	return new struct(Constant.node, '#root', null, children, Constant.key)
}

/**
 * @param {Array<object>} children
 * @param {*} key
 * @return {object}
 */
export function fragment (children, key) {
	return new struct(Constant.fragment, '#fragment', null, children.push(empty(Constant.key)) && children, key)
}

/**
 * @param {(number|string)} children
 * @param {*} key
 * @return {object}
 */
export function text (children, key) {
	return new struct(Constant.text, '#text', null, children, key)
}

/**
 * @param {*} key
 * @return {object}
 */
export function empty (key) {
	return new struct(Constant.empty, '#empty', null, '', key)
}

/**
 * @param {(number|string)} children
 * @param {*} key
 * @return {object}
 */
export function comment (children, key) {
	return new struct(Constant.comment, '#comment', null, children, key)
}

/**
 * @param {*} children
 * @param {*} target
 * @param {*} key
 * @return {object}
 */
export function portal (children, target, key) {
	return new struct(Constant.portal, target, null, [empty(0), fragment([from(children, 0)], 1)], key)
}

/**
 * @param {*} value
 * @return {object}
 */
export function module (value) {
	return from([value && value.default || value], 0)
}

/**
 * @param {*} value
 * @param {number} index
 * @return {object}
 */
export function from (value, index) {
	if (value != null) {
		switch (typeof value) {
			case 'number':
			case 'string':
				return text(value, Utility.hash(index))
			case 'object':
				switch (value.constructor) {
					case Constant.node:
						return value
					case Utility.array:
						return fragment(value.map(from), Utility.hash(index))
					default:
						if (Utility.iterable(value)) {
							return fragment(Children.map(value, from), Utility.hash(index))
						}
				}
			case 'function':
				return create(value)
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
			return Constant.component
		case 'number':
			return Constant.fragment
		case 'object':
			if (Utility.thenable(value)) {
				return Constant.thenable
			}
	}

	return Constant.node
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
	var id = identity(a)
	var type = a
	var props = i === 2 && b || {}
	var children = []
	var element = new struct(id, type, props, children, props.key)

	if (id === Constant.component) {
		if (size > 0) {
			for (props.children = size === 1 ? arguments[i++] : children = []; i < length; ++i) {
				children.push(arguments[i])
			}
		}
		if (type[Constant.defaultProps]) {
			defaults(element, type[Constant.defaultProps])
		}
		if ('development' === 'development') {
			Assert.types(element, props, Constant.propTypes)
		}
	} else {
		if (size > 0) {
			for (; i < length; ++i) {
				children[index] = from(arguments[i], index++)
			}
		}
		if (id < Constant.node) {
			if (id < Constant.fragment) {
				children.splice(0, index, from(children, 0))
			} else {
				children.push(empty(Constant.key))
			}
		}
	}

	return element
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
			return display(value[Constant.displayName] || value.name)
		case 'object':
			if (valid(value)) {
				return display(value.type)
			}
	}

	return value
}

/**
 * @param {*} element
 * @return {boolean}
 */
export function valid (element) {
	return element != null && element.constructor === Constant.node
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
 * @param {Array<*>} element
 * @param {*} value
 * @return {*}
 */
export function put (element, value) {
	return element.children.push(value), value
}

/**
 * @param {object} element
 * @return {object}
 */
export function only (element) {
	return element.children[0]
}

/**
 * @param {object} element
 * @return {object}
 */
export function resolve (element) {
	return element.id < Constant.node ? resolve(only(element)) : element
}

/**
 * @param {object} element
 * @return {object}
 */
export function parent (element) {
	return element.id < Constant.portal ? parent(element.parent) : element
}
