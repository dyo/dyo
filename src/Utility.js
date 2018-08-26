/**
 * @type {function}
 * @return {number}
 */
export var now = Date.now

/**
 * @type {object}
 */
export var math = Math

/**
 * @type {function}
 * @param {number}
 * @return {number}
 */
export var abs = math.abs

/**
 * @type {function}
 * @return {number}
 */
export var random = math.random

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
 * @type {function}
 * @param {number} length
 */
export var array = Array

/**
 * @type {function}
 * @param {number} length
 */
export var object = Object

/**
 * @type {function}
 * @param {*}
 * @param {(string|number|symbol)}
 * @return {object}
 */
export var descriptors = object.getOwnPropertyDescriptors

/**
 * @type {function}
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
 * @type {function}
 * @param {(object|function)}
 * @param {(string|number|symbol)}
 * @param {object}
 * @return {object}
 */
export var define = object.defineProperty

/**
 * @param {number} value
 * @return {number}
 */
export function hash (value) {
	return -((-(value + 1)) >>> 0) + 1
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
	throw Error(message)
}

/**
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
	return typeof value[symbol.iterator] === 'function'
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
		if (value.length > -1) {
			for (var i = 0; i < value.length; ++i) {
				if (each(callback, value[i], i + index) != null) {
					break
				}
			}
		} else if (typeof value[symbol.iterator] === 'function') {
			for (var i = index, j = value[symbol.iterator](), k = j.next(); !k.done; ++i) {
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
 * @param {(Promise<*>|Array<Promise<*>>)} value
 * @param {function} fulfilled
 * @param {function} rejected
 */
export function resolve (value, fulfilled, rejected) {
	if (value.length > -1) {
		var length = value.length
		var result = []

		each(function (value) {
			resolve(value, function () {
				if (result.push(value) === length) {
					fulfilled(result)
				}
			}, rejected)
		}, value, 0)
	} else if (thenable(value)) {
		value.then(function (value) {
			if (value) {
				if (fetchable(value)) {
					return resolve(value.json(), fulfilled, rejected)
				}
			}

			return fulfilled(value)
		}, rejected)
	} else {
		fulfilled(value)
	}
}
