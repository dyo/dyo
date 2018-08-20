import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Event from './Event.js'
import * as Check from './Check.js'

/**
 * @type {object}
 */
export var descriptors = Utility.define({
	/**
	 * @type {sybmol}
	 */
	constructor: {
		value: Constant.element
	},
	/**
	 * @type {function}
	 */
	handleEvent: {
		value: Event.handle
	}
}, Constant.iterator, {value: Constant.iterator})

/**
 * @constructor
 * @param {object} element
 */
export var constructor = Utility.extend(function element (host, parent, element, owner) {
	this.key = element.key
 	this.uuid = element.uuid
 	this.type = element.type
 	this.props = element.props
 	this.children = element.children
 	this.ref = null
 	this.host = host
 	this.xmlns = ''
 	this.state = null
 	this.owner = owner
 	this.parent = parent
 	this.active = Constant.active
}, descriptors)

/**
 * @type {object}
 */
export var prototype = constructor[Constant.prototype]

/**
 * @constructor
 * @param {number} uuid
 * @param {*} type
 * @param {Array<object>} children
 * @param {object} props
 * @param {*} key
 */
export var struct = Utility.extend(function node (uuid, type, props, children, key) {
	this.key = key
 	this.uuid = uuid
 	this.type = type
 	this.props = props
 	this.children = children
}, descriptors)

/**
 * @param {object} owner
 * @return {object}
 */
export function target (owner) {
	return new constructor(null, null, create('#root'), owner)
}

/**
 * @param {*} element
 * @return {object}
 */
export function module (element) {
	return from(element && typeof element === 'object' && element.default || element, Constant.key)
}

/**
 * @param {*} children
 * @param {*} target
 * @param {*} key
 * @return {object}
 */
export function portal (children, target, key) {
	return create(target, {key: key}, children)
}

/**
 * @param {number} type
 * @param {Array<object>} children
 * @param {number} key
 * @return {object}
 */
export function iterable (type, children, key) {
	return new struct(type, '#iterable', Constant.object, children, key)
}


/**
 * @param {(number|string)} children
 * @param {*} key
 * @return {object}
 */
export function comment (children, key) {
	return new struct(Constant.comment, '#comment', Constant.object, children, key)
}

/**
 * @param {(number|string)} children
 * @param {number} index
 * @return {object}
 */
export function text (children, index) {
	return new struct(Constant.text, '#text', Constant.object, children, Utility.hash(index))
}

/**
 * @param {number} index
 * @return {object}
 */
export function empty (index) {
	return new struct(Constant.empty, '#empty', Constant.object, '', Utility.hash(index))
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
	var i = properties(b) ? 2 : 1
	var size = length - i
	var uuid = identity(a)
	var type = a
	var props = i === 2 ? b : {}
	var children = []
	var key = props.key || Constant.key
	var element = new struct(uuid, type, props, children, key)

	if (uuid === Constant.component) {
		if (size) {
			for (props.children = size === 1 ? arguments[i++] : children = []; i < length; ++i) {
				children.push(arguments[i])
			}
		}
		if (type[Constant.defaultProps]) {
			defaults(element, type[Constant.defaultProps])
		}
		if ("production" === 'development') {
			Check.types(element, props, Constant.propTypes)
		}
	} else {
		if (size) {
			for (; i < length; ++i) {
				children[index] = from(arguments[i], index++)
			}
		} else if (Utility.has(props, 'children')) {
			children[index] = from(arguments[i], index)
		}
		if (uuid < Constant.node) {
			return iterable(Constant.fragment, [empty(Constant.key), element, empty(Constant.key)], key)
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
		if (value.constructor === Constant.element) {
			return value
		} else {
			switch (typeof value) {
				case 'number':
				case 'string':
					return text(value, index)
				case 'function':
				case 'object':
					if (Utility.iterable(value)) {
						if (index === Constant.key) {
							return iterable(Constant.fragment, value.map(from), Utility.hash(index))
						} else {
							return iterable(Constant.iterable, value.map(from), Utility.hash(index))
						}
					} else {
						return create(value, Constant.object)
					}
			}
		}
	}

	return empty(index)
}

/**
 * @param {*} value
 * @return {number}
 */
export function identity (value) {
	switch (typeof value) {
		case "string":
			return Constant.node
		case 'function':
			return Constant.component
		case 'number':
			return Constant.fragment
		case 'object':
			return Utility.thenable(value) ? Constant.thenable : Constant.portal
	}
}

/**
 * @param {*} value
 * @return {boolean}
 */
export function properties (value) {
	if (value) {
		if (typeof value === 'object') {
			switch (value.constructor) {
				case Object:
					return true
				case Constant.element:
					break
				default:
					return !Utility.iterable(value)
			}
		}
	}

	return false
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
		default:
			return value.toString()
	}
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
 * @param {*} element
 * @return {boolean}
 */
export function valid (element) {
	return element != null && element.constructor === Constant.element
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
 * @param {number} from
 * @return {object}
 */
export function parent (element, from) {
	if (element.uuid < Constant.portal) {
		if (element.uuid !== -from) {
			return parent(element.parent, from, element, to)
		}
	}

	return element
}

/**
 * @param {object} element
 * @return {object}
 */
export function node (element) {
	if (element.uuid < Constant.node) {
		return node(element.children[Constant.node])
	}

	return element
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
 * @return {Array<object>}
 */
export function children (element) {
	return [element]
}
