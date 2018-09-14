/**
 * @return {number}
 */
export var now = Date.now

/**
 * @type {object}
 */
export var math = Math

/**
 * @return {number}
 */
export var random = math.random

/**
 * @param {number}
 * @return {number}
 */
export var abs = math.abs

/**
 * @constructor
 * @param {number}
 */
export var array = Array

/**
 * @constructor
 * @param {number}
 */
export var object = Object

/**
 * @param {*}
 * @return {obejct}
 */
export var error = Error

/**
 * @param {object}
 * @return {Array<string>}
 */
export var keys = object.keys

/**
 * @param {(object|function)?}
 * @param {object}
 * @return {object}
 */
export var create = object.create

/**
 * @param {string?}
 * @return {(symbol|number)}
 */
export var symbol = typeof Symbol === 'function' ? Symbol : function () { return (random() * 1e8) | 0 }

/**
 * @type {(symbol|string)}
 */
export var iterator = symbol.iterator || '@@iterator'

/**
 * @param {function}
 * @param {...args?}
 * @return {number}
 */
export var request = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout

/**
 * @return {object}
 */
export var timeout = (function (resolve) { return function () { return new promise(resolve) } })(thunk(request))

/**
 * @constructor
 * @param {function} callback
 */
export var promise = typeof Promise === 'function' ? Promise : function (callback) {
	try {
		return this.resolve = define(function resolve (value) {
			for (var i = 0, j = resolve.entries; i < j.length; ++i) {
				j[i](value)
			}
		}, {
			then: {value: function (callback) { this.entries.push(callback) }},
			entries: {value: []}
		})
	} finally {
		callback(this.resolve)
	}
}

/**
 * @constructor
 */
export var registry = typeof WeakMap === 'function' ? WeakMap : function () {
	return {
		key: symbol(),
		has: function (key) { return has(key, this.key) },
		get: function (key) { return key[this.key] },
		set: function (key, value) { define(key, this.key, {value: value, configurable: true}) }
	}
}

/**
 * @param {function} functor
 * @return {function}
 */
function thunk (functor) {
	return function (value) { return functor(value) }
}

/**
 * @param {number} value
 * @return {number}
 */
export function hash (value) {
	return -((-(value + 1)) >>> 0) + 1
}

/**
 * @throws {Error}
 * @param {string} message
 */
export function invariant (message) {
	throw error(message)
}

/*
 * @param {object} value
 * @return {boolean}
 */
export function fetchable (value) {
	return typeof value.blob === 'function' && typeof value.json === 'function'
}

/**
 * @param {object} value
 * @return {boolean}
 */
export function thenable (value) {
	return typeof value.then === 'function'
}

/**
 * @param {object} value
 * @param {boolean}
 */
export function iterable (value) {
	return typeof value[iterator] === 'function'
}

/**
 * @param {*} a
 * @param {*} b
 * @return {boolean}
 */
export function is (a, b) {
	return a === b ? (a !== 0 || 1/a === 1/b) : (a !== a && b !== b)
}

/**
 * @param {object} object
 * @param {*} key
 * @return {boolean}
 */
export function has (object, key) {
	return object.hasOwnProperty.call(object, key)
}

/**
 * @param {(object|function)} value
 * @param {(object|string|number|symbol)} a
 * @param {object?} b
 * @return {(object|function)}
 */
export function define (value, a, b) {
	return typeof b === 'object' ? object.defineProperty(value, a, b) : object.defineProperties(value, a)
}

/**
 * @param {function} constructor
 * @param {object} props
 * @param {object?} prototype
 * @return {function}
 */
export function extend (constructor, properties, prototype) {
	return define(constructor, 'prototype', {value: create(prototype || null, properties || {})})
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object}
 */
export function merge (a, b) {
	var value = {}

	for (var key in a) {
		value[key] = a[key]
	}
	for (var key in b) {
		value[key] = b[key]
	}

	return value
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object}
 */
export function assign (a, b) {
	for (var key in b) {
		a[key] = b[key]
	}

	return a
}

/**
 * @param {object} a
 * @param {object} b
 * @return {boolean}
 */
export function compare (a, b) {
	for (var key in a) {
		if (!has(b, key)) {
			return true
		}
	}
	for (var key in b) {
		if (!is(a[key], b[key])) {
			return true
		}
	}

	return false
}

/**
 * @param {function} callback
 * @param {*?} value
 * @param {number} index
 */
export function each (callback, value, index) {
	if (value != null) {
		if (value.length > -1) {
			for (var i = 0; i < value.length; ++i) {
				if (each(callback, value[i], i + index) != null) {
					break
				}
			}
		} else if (typeof value[iterator] === 'function') {
			for (var i = index, j = value[iterator](), k = j.next(); !k.done; ++i) {
				if (each(callback, k.value, i + index) == null) {
					k = j.next()
				} else {
					break
				}
			}
		} else {
			return callback(value, index)
		}
	}
}

/**
 * @param {Promise<*>} value
 * @param {function} fulfilled
 * @param {function} rejected
 * @return {Promise<*>?}
 */
export function resolve (value, fulfilled, rejected) {
	if (thenable(value)) {
		return value.then(function (value) {
			if (value) {
				if (fetchable(value)) {
					return resolve(value.json(), fulfilled, rejected)
				}
			}

			return fulfilled(value)
		}, rejected)
	} else {
		return fulfilled(value)
	}
}
