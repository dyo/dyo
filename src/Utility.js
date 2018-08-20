/**
 * @type {function}
 * @param {number}
 * @return {number}
 */
export var abs = Math.abs

/**
 * @type {function}
 * @return {number}
 */
export var random = Math.random

/**
 * @type {function}
 * @return {number}
 */
export var now = Date.now

/**
 * @param {*}
 * @return {(object|function)}
 */
export var object = Object

/**
 * @type {function}
 * @param {*}
 * @param {(string|number|symbol)}
 * @return {object}
 */
export var descriptors = Object.getOwnPropertyDescriptors

/**
 * @type {function}
 * @param {object}
 * @return {Array<string>}
 */
export var keys = Object.keys

/**
 * @type {function}
 * @param {*}
 * @param {(string|number|symbol)}
 * @param {object}
 * @return {object}
 */
export var define = Object.defineProperty

/**
 * @param {(object|function)?}
 * @param {object}
 * @return {object}
 */
export var create = Object.create

/**
 * @return {(symbol|number)} where number is not a valid array index
 */
export var symbol = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol : define(function () {
	return -random()
}, 'for', function (value) {
  for (var i = 0, h = 0; i < value.length; ++i) {
    h = ((h << 5) - h) + value.charCodeAt(i)
  }

  return -h
})

/**
 * @param {number} value
 * @return {number}
 */
export function hash (value) {
	return -((-(value + 1)) >>> 0)
}

/**
 * @param {object} object
 * @param {*} key
 * @return {boolean}
 */
export function has (object, key) {
	return Object.hasOwnProperty.call(object, key)
}

/**
 * @param {function} value
 * @param {*} that
 * @return {boolean}
 */
export function bind (value, that) {
	return value.bind(that)
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
 * @return {void}
 */
export function noop () {}

/**
 * @throws {Error}
 * @param {string} message
 */
export function invariant (message) {
	throw new Error(message)
}

/**
 * @param {object} value
 * @return {boolean}
 */
export function fetchable (value) {
	return typeof value.blob === 'function' && typeof value.text === 'function' && typeof value.json === 'function'
}

/**
 * @param {object} value
 * @return {boolean}
 */
export function thenable (value) {
	return typeof value.then === 'function' && typeof value.catch === 'function'
}

/**
 * @param {object} value
 * @param {boolean}
 */
export function iterable (value) {
	return typeof value[symbol.iterator] === 'function' || Array.isArray(value)
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
		if (Array.isArray(value)) {
			for (var i = 0, j = index | 0; i < value.length; ++i) {
				if (each(callback, value[i], i + j) != null) {
					break
				}
			}
		} else if (iterable(value)) {
			if (typeof value.next === 'function') {
				for (var i = 0, j = index | 0, next = value.next(next); !next.done; ++i) {
					if (each(callback, next.value, i + j) != null) {
						break
					} else {
						next = value.next(next.value)
					}
				}
			} else {
				each(callback, value[symbol.iterator](), index | 0)
			}
		} else {
			return callback(value, index | 0)
		}
	}
}
