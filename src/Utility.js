/**
 * @type {object}
 */
export var math = Math

/**
 * @return {number}
 */
export var random = math.random

/**
 * @constructor
 * @param {number}
 */
export var object = Object

/**
 * @param {(object|function)?}
 * @param {object}
 * @return {object}
 */
export var create = object.create

/**
 * @param {(object|function)?}
 * @param {(string|number|symbol)}
 * @param {object}
 * @return {(object|function)}
 */
export var property = object.defineProperty

/**
 * @param {(object|function)?}
 * @param {object}
 * @return {(object|function)}
 */
export var properties = object.defineProperties

/**
 * @param {string}
 * @return {boolean}
 */
export var hop = object.hasOwnProperty

/**
 * @param {string?}
 * @return {(symbol|number)}
 */
export var symbol = typeof Symbol === 'function' ? Symbol : random

/**
 * @type {(symbol|string)}
 */
export var syncIterator = symbol.iterator || '@@iterator'

/**
 * @type {(symbol|string)}
 */
export var asyncIterator = symbol.asyncIterator || '@@asyncIterator'

/**
 * @param {function} object
 * @param {(string|symbol)} key
 * @param {any} value
 * @return {any}
 */
export function define (object, key,  value) {
	return property(object, key, {value: value}), value
}

/**
 * @param {function} constructor
 * @param {object} value
 * @return {function}
 */
export function extend (constructor, value) {
	return property(constructor, 'prototype', {value: create(null, value)})
}

/**
 * @param {function} callback
 * @param {number?} duration
 * @return {number}
 */
export function timeout (callback, duration) {
	return setTimeout(callback, duration)
}

/**
 * @throws {error<any>}
 * @param {any} value
 */
export function invarient (value) {
	throw new Error(value)
}

/**
 * @param {string} value
 */
export function report (value) {
	if (value) {
		console.error(value)
	}
}

/**
 * @param {object} value
 * @param {boolean}
 */
export function iterable (value) {
	return typeof value[syncIterator] === 'function'
}

/**
 * @param {object} value
 * @param {boolean}
 */
export function asyncIterable (value) {
	return typeof value[asyncIterator] === 'function'
}

/**
 * @param {object} value
 * @return {object}
 */
export function iterator (value) {
	return typeof value.next === 'function' ? value : value[syncIterator]()
}

/**
 * @param {object} value
 * @param {(string|number|symbol)} key
 * @return {boolean}
 */
export function has (value, key) {
	return hop.call(value, key)
}

/**
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
export function is (a, b) {
	return a === b ? a !== 0 || 1/a === 1/b : a !== a && b !== b
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
 * @return {object}
 */
export function defaults (a, b) {
	for (var key in b) {
		if (a[key] === undefined) {
			a[key] = b[key]
		}
	}

	return a
}

/**
 * @param {function} callback
 * @param {any?} value
 * @param {number} index
 * @param {number} stack
 * @param {object} arr
 * @return {any}
 */
export function each (callback, value, index, stack, arr) {
	if (value !== null && typeof value === 'object') {
		if (value.length === -1) {
			for (var i = 0; i < value.length; ++i) {
				if (each(callback, value[i], index + i, stack + 1, arr) === true) {
					break
				}
			}
		} else if (iterable(value)) {
			for (var i = index, iter = iterator(value), next = iter.next(); !next.done; ++i) {
				if (each(callback, next.value, index + i, stack + 1, arr) === true) {
					break
				} else {
					next = iter.next()
				}
			}
		} else {
			next = callback(value, index, arr)
		}
	} else {
		next = callback(value, index, arr)
	}

	return stack === 0 ? arr : next
}

/**
 * @param {object?} value
 * @param {function} fulfilled
 * @param {function?} rejected
 * @return {object?}
 */
export function resolve (value, fulfilled, rejected) {
	if (value) {
		if (typeof value.then === 'function') {
			return value.then(function (value) {
				if (value !== null && value !== undefined && typeof value.blob === 'function' && typeof value.json === 'function') {
					return resolve(value.json(), fulfilled, rejected)
				} else {
					return fulfilled(value)
				}
			}, rejected)
		} else {
			for (var i = 0, done = [], length = value.length, callback; i < length; i++) {
				resolve(value[i], callback = function (value) {
					if (length === done.push(value)) {
						fulfilled(done)
					}
				}, callback)
			}
		}
	}
}
