import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Event from './Event.js'

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
	return new struct(Enum.text, key(index), '', null, value)
}

/**
 * @param {object[]} value
 * @param {number} index
 * @return {object}
 */
export function iterable (value, index) {
	return new struct(Enum.iterable, key(index), null, null, value)
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
 * @param {number} length
 * @param {object} props
 * @return {object}
 */
export function iterator (value, length, props) {
	Utility.each(function (value, index, children) {
		children[index] = from(value, length = index, props)
	}, value, length, value = [])

	return value[length + 1] = empty(), value
}

/**
 * @param {any} value
 * @param {number} index
 * @param {object} props
 * @return {object}
 */
export function fragment (value, index, props) {
	for (var i = 0; i < value.length; i++) {
		value[i] = from(value[i], i, props)
	}

	return value[i] = empty(), iterable(value, key(index))
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
					if (Utility.isArray(value)) {
						return fragment(value, index, props)
					} else if (Utility.iterable(value)) {
						return iterable(iterator(value, 0, props), key(index))
					} else if (Utility.asyncIterable(value)) {
						return create(generator(value), props)
					} else if (Utility.thenable(value)) {
						return create(value, props)
					}
				} else {
					return value
				}
			}
	}

	return empty()
}

/**
 * @param {(string|number|function|PromiseLike<any>?} a
 * @param {({key?,ref?})?} b
 * @param {...any?}
 * @return {object}
 */
export function create (a, b) {
	var index = 0
	var length = arguments.length
	var of = typeof b === 'object' && b !== null
	var position = of ? 2 : 1
	var size = length - position
	var identity = Enum.element
	var type = a
	var props = of ? b : {}
	var children = []

	switch (typeof type) {
		case 'function':
			identity = Enum.component
			break
		case 'object':
			identity = type === Enum.fragment ? Enum.iterable : Enum.thenable
			break
	}

	var element = new struct(identity, props.key, null, props, children)

	if (identity === Enum.component) {
		if (size > 0) {
			for (props.children = size === 1 ? arguments[position++] : children = []; position < length; ++position) {
				children[index++] = arguments[position]
			}
		}
	} else {
		if (size > 0) {
			for (; position < length; ++position) {
				children[index] = from(arguments[position], index++, props)
			}
		}

		if (identity !== Enum.element) {
			children[index] = empty()
		}
	}

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

/**
 * @param {object?} element
 * @param {object} value
 * @return {object}
 */
export function resolve (element, value) {
	return from(typeof element === 'object' && element !== null && 'default' in element ? element.default : element, 0, value)
}
