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
 * @param {object}
 */
export var array = Array

/**
 * @param {any}
 * @return {boolean}
 */
export var isArray = Array.isArray

/**
 * @constructor
 * @param {any}
 * @return {object}
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
 * @param {function}
 * @return {object}
 */
export var promise = typeof Promise === 'function' ? Promise : function (callback) { return new Promise(callback) }

/**
 * @param {any} value
 * @return {object}
 */
export function request (value) {
	return new promise(function (resolve) { animation(function () { resolve(value) }) })
}

/**
 * @param {function} callback
 * @return {object}
 */
export function respond (callback) {
	return request(callback).then(callback)
}

/**
 * @param {function} callback
 * @return {number}
 */
export function animation (callback) {
	return typeof requestAnimationFrame === 'function' ? requestAnimationFrame(callback) : setTimeout(callback, 16)
}

/**
 * @param {function} callback
 * @param {number} duration
 * @return {number}
 */
export function timeout (callback, duration) {
	return setTimeout(callback, duration)
}

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
 * @throws {any}
 * @param {any} value
 */
export function throws (value) {
	throw value
}

/**
 * @param {string} value
 */
export function report (value) {
	console.error(value)
}

/**
 * @param {any} value
 * @return {boolean}
 */
export function keyable (value) {
	return value instanceof object
}

/**
 * @param {any} value
 * @param {boolean}
 */
export function callable (value) {
	return typeof value === 'function'
}

/**
 * @param {any?} value
 * @param {boolean}
 */
export function thenable (value) {
	return value !== undefined && value !== null && typeof value === 'object' && callable(value.then)
}

/**
 * @param {any?} value
 * @param {boolean}
 */
export function fetchable (value) {
	return value !== undefined && value !== null && typeof value === 'object' && callable(value.json)
}

/**
 * @param {object} value
 * @param {boolean}
 */
export function iterable (value) {
	return callable(value[syncIterator])
}

/**
 * @param {object} value
 * @param {boolean}
 */
export function asyncIterable (value) {
	return callable(value[asyncIterator])
}

/**
 * @param {object} value
 * @return {object}
 */
export function iterator (value) {
	return callable(value.next) ? value : value[syncIterator]()
}

/**
 * @param {object} object
 * @param {(string|number|symbol)} key
 * @return {boolean}
 */
export function has (object, key) {
	return hop.call(object, key)
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
export function defaults (a, b) {
	for (var key in b) {
		if (a[key] === undefined) {
			a[key] = b[key]
		}
	}
}

/**
 * @param {function} callback
 * @param {any?} value
 * @param {number} index
 * @param {any[]} array
 * @return {any}
 */
export function each (callback, value, index, array) {
	if (value !== null && typeof value === 'object') {
		if (value.length > -1) {
			for (var i = 0; i < value.length; ++i) {
				if (each(callback, value[i], index + i, array) === null) {
					break
				}
			}
		} else if (iterable(value)) {
			for (var i = 0, iter = iterator(value), next = iter.next(); !next.done; next = iter.next(++i)) {
				if (each(callback, next.value, index + i, array) === null) {
					break
				}
			}
		} else {
			return callback(value, index, array)
		}
	} else {
		return callback(value, index, array)
	}
}

/**
 * @param {(PromiseLike<any>|PromiseLike<any>[])?} value
 * @param {function} resolved
 * @param {function?} rejected
 * @return {PromiseLike<any>}
 */
export function resolve (value, resolved, rejected) {
	return isArray(value) ? settled(value, resolved, rejected, 0) : value.then(resolved, rejected)
}

/**
 * @param {PromiseLike<any>[]?} value
 * @param {function} resolved
 * @param {function?} rejected
 * @param {number} position
 * @return {PromiseLike<any>}
 */
export function settled (value, resolved, rejected, position) {
	return new promise(function (fulfill) {
		for (var i = position, index = position, length = value.length, callback = null; i < length; i++) {
			resolve(value[i], callback !== null ? callback : callback = function () {
				if (length === ++index) {
					fulfill(length === value.length ? resolved() : settled(value, resolved, rejected, index))
				}
			}, callback)
		}
	})
}
