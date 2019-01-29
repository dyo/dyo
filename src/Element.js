import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Event from './Event.js'

/**
 * @constructor
 * @param {number} uid
 * @param {(string|symbol)?} key
 * @param {any} type
 * @param {object} props
 * @param {object} children
 */
export var struct = Utility.extend(function element (uid, key, type, props, children) {
	this.uid = uid
	this.key = key
	this.type = type
	this.props = props
	this.children = children
	this.ref = null
	this.host = null
	this.owner = null
	this.parent = null
	this.state = null
	this.value = null
	this.context = null
}, {
	handleEvent: {value: Event.handle}
})

/**
 * @param {number} value
 * @return {number}
 */
export function key (value) {
	return -(-(value + 1) >>> 0)
}

/**
 * @return {object}
 */
export function empty () {
	return new struct(Enum.empty, Enum.key, null, null, '')
}

/**
 * @param {(number|string)} value
 * @param {number} index
 * @return {object}
 */
export function text (value, index) {
	return new struct(Enum.text, key(index), Enum.text, null, value)
}

/**
 * @param {object[]} value
 * @param {fragment} index
 * @return {object}
 */
export function fragment (value, index) {
	return new struct(Enum.fragment, key(index), Enum.fragment, null, value)
}

/**
 * @param {any} value
 * @param {object} type
 * @param {{key}?} props
 * @return {object}
 */
export function portal (value, type, props) {
	return new struct(Enum.portal, props && props.key, Enum.portal, null, [target(value, type, props)])
}

/**
 * @param {!any} value
 * @param {object} type
 * @param {object} props
 * @return {object}
 */
export function target (value, type, props) {
	return new struct(Enum.target, null, type, props, [root(value)])
}

/**
 * @param {any} value
 * @return {object}
 */
export function root (value) {
	return from([value], 0, {})
}

/**
 * @param {any} value
 * @return {number}
 */
export function identity (value) {
	switch (typeof value) {
		case 'function':
			return Enum.component
		case 'number':
			return Enum.fragment
		case 'object':
			return Enum.thenable
	}

	return Enum.element
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

	return value
}

/**
 * @param {any} value
 * @return {Promise}
 */
export function generator (value) {
	return Utility.create(value, {
		iter: {value: Utility.iterator(value)},
		then: {value: function (fulfilled, rejected) { return this.iter.next().then(fulfilled, rejected) }},
	})
}

/**
 * @param {object} value
 * @param {number} index
 * @param {object} props
 * @return {object}
 */
export function iterator (value, index, props) {
	var length = 0, children = Utility.each(function (value, index, children) {
		children[index] = from(value, length = index, props)
	}, value, 0, 0, [])

	return children[length + 1] = empty(), children
}

/**
 * @param {any} value
 * @param {number} index
 * @param {object} props
 * @return {object}
 */
export function from (value, index, props) {
	switch (typeof value) {
		case 'object':
			if (value !== null) {
				// using "value instanceof struct" improves perf
				// but also means you can't use {h} from one render
				// in another i.e import {h} from 'dyo'
				// then render onto import {render} from 'server'
				// This is very important for ismorphic apps.
				// Alternetively we can use a hasOwnProperty that doesn't have
				// as much of an effect on megamorphic cache misses.
				if (value.constructor === undefined) {
					return value
				} else if (value.length > -1) {
					for (var i = 0; i < value.length; i++) {
						value[i] = from(value[i], i, props)
					}
					return value[i] = empty(), fragment(value, key(index))
				} else if (Utility.iterable(value)) {
					return fragment(iterator(value, index, props), key(index))
				} else if (Utility.asyncIterable(value)) {
					return create(generator(value), props)
				}
			}
		case 'function':
			return create(value, props)
		case 'number': case 'string':
			return text(value, index)
	}

	return empty()
}

/**
 * @param {(string|number|function|{then}} a
 * @param {({key?,ref?}|object)?} b
 * @param {...any?}
 * @return {object}
 */
export function create (a, b) {
	var index = 0
	var length = arguments.length
	var i = b == null || b instanceof Utility.object ? 2 : 1
	var size = length - i
	var uid = identity(a)
	var type = a
	var props = i === 2 && b || {}
	var children = []
	var element = new struct(uid, props.key, type, props, children)

	if (uid === Enum.component) {
		if (size > 0) {
			for (props.children = size === 1 ? arguments[i++] : children = []; i < length; ++i) {
				children[index++] = arguments[i]
			}
		}
	} else {
		if (size > 0) {
			for (; i < length; ++i) {
				children[index] = from(arguments[i], index++, props)
			}
		}
		if (uid !== Enum.element) {
			children[index] = empty()
		}
	}

	return element
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
 * @param {...any?}
 * @return {object}
 */
export function clone (element) {
	return defaults(create.apply(null, [element.type].concat([].slice.call(arguments, 1))), element.props)
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
	return element.uid < Enum.target ? sibling(element.children[0]) : element
}

/**
 * @param {object?} value
 * @param {object} props
 * @return {object}
 */
export function resolve (value, props) {
	return [from(value && 'default' in value ? value.default : value, 0, props), empty()]
}
