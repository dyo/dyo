import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Event from './Event.js'
import * as Children from './Children.js'
import * as Suspense from './Suspense.js'

/**
 * @constructor
 * @param {number} identity
 * @param {any} key
 * @param {any} type
 * @param {object} props
 * @param {object} children
 */
export var struct = Utility.extend(function element (identity, key, type, props, children) {
	this.identity = identity
	this.key = key
	this.type = type
	this.props = props
	this.children = children
	this.host = null
	this.parent = null
	this.context = null
	this.owner = null
	this.value = null
	this.state = null
	this.stack = null
}, {
	handleEvent: {value: Event.handle}
}, null)

/**
 * @param {number} value
 * @return {number}
 */
export function hash (value) {
	return -(-(value + 1) >>> 0)
}

/**
 * @return {object}
 */
export function empty () {
	return new struct(Enum.empty, Enum.hash, null, null, '')
}

/**
 * @param {(number|string)} value
 * @param {number} index
 * @return {object}
 */
export function text (value, index) {
	return new struct(Enum.text, hash(index), '', null, value)
}

/**
 * @param {object[]} value
 * @param {number} index
 * @return {object}
 */
export function iterable (value, index) {
	return new struct(Enum.iterable, hash(index), null, null, value)
}

/**
 * @param {any} value
 * @return {object}
 */
export function container (value) {
	return new struct(Enum.iterable, null, null, null, [from(value, 0, null)])
}

/**
 * @param {!any} value
 * @param {object} type
 * @return {object}
 */
export function target (value, type, key) {
	return new struct(Enum.target, key, type, null, [container(value)])
}

/**
 * @param {object} value
 * @return {object}
 */
export function portal (value) {
	return new struct(Enum.portal, null, null, null, [target(value.children, value.target, null)])
}

/**
 * @return {object}
 */
export function offscreen () {
	return new struct(Enum.element, null, Enum.offscreen, null, [])
}

/**
 * @param {object} value
 * @param {object} element
 * @return {object?}
 */
export function fallback (value, element) {
	return new struct(Enum.fallback, null, null, null, [from(element.props.fallback, 0, value)])
}

/**
 * @param {any} value
 * @return {string}
 */
export function display (value) {
	switch (typeof value) {
		case 'function':
			return display(value.displayName || value.name)
		case 'object':
			return display(value.type)
	}

	return value || 'anonymous'
}

/**
 * @param {any} value
 * @param {number} index
 * @return {object}
 */
export function fragment (value, index) {
	return value[value.length] = empty(), iterable(value, hash(index))
}

/**
 * @param {any} value
 * @param {number} index
 * @param {object} props
 * @return {object}
 */
export function from (value, index, props) {
	switch (typeof value) {
		case 'number': case 'string':
			return text(value, index)
		case 'function':
			return create(value, props)
		case 'object':
			if (value !== null) {
				if (Utility.keyable(value)) {
					if (Utility.indexable(value)) {
						return fragment(value, index)
					} else if (Utility.iterable(value)) {
						return fragment(Children.array(value), index)
					} else if (Utility.thenable(value)) {
						return create(Suspense.lazy(value), props)
					}
				} else {
					return value
				}
			}
	}

	return empty()
}

/**
 * @param {(string|number|function|PromiseLike<any>?} type
 * @param {({key?,ref?})?} props
 * @param {...any?}
 * @return {object}
 */
export function create (type, props) {
	var index = 0
	var length = arguments.length
	var of = typeof props === 'object'
	var position = of ? 2 : 1
	var size = length - position
	var identity = Enum.element
	var properties = of ? props || {} : {}
	var children = []

	if (size > 0) {
		for (; position < length; ++position) {
			children[index++] = arguments[position]
		}
	}

	switch (typeof type) {
		case 'object':
			identity = Enum.iterable, children[index] = empty()
			break
		case 'function':
			identity = Enum.component

			if (size > 0) {
				properties.children = size > 1 ? children : children[0]
			}
	}

	var element = new struct(identity, properties.key, null, properties, children)

	return element.type = type, element
}

/**
 * @param {object} element
 * @param {...any?}
 * @return {object}
 */
export function clone (element) {
	return defaults(create.apply(null, [element.type].concat([].slice.call(arguments, 1))), element.props)
}

/**
 * @param {any} element
 * @return {boolean}
 */
export function valid (element) {
	return element !== null && element !== undefined && element.constructor === undefined
}

/**
 * @param {object} element
 * @param {object?} value
 * @return {object}
 */
export function defaults (element, value) {
	return Utility.defaults(element.props, value), element
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
export function parent (element) {
	return element.identity < Enum.target ? parent(element.parent) : element
}

/**
 * @param {object} element
 * @return {object}
 */
export function sibling (element) {
	return element.identity < Enum.target ? sibling(children(element)) : element
}

/**
 * @param {object?} element
 * @return {object[]}
 */
export function children (element) {
	return element.children[0]
}
