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
 * @param {string}
 */
export var error = Error

/**
 * @constructor
 * @param {object}
 */
export var array = Array

/**
 * @param {any}
 * @return {boolean}
 */
export var indexable = Array.isArray

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
 * @param {string} value
 * @return {(symbol|number)}
 */
export var identifier = symbol.for || symbol

/**
 * @type {(symbol|string)}
 */
export var iterator = symbol.iterator || '@@iterator'

/**
 * @param {function}
 * @return {object}
 */
export var promise = typeof Promise === 'function' ? Promise : function (callback) { return new Promise(callback) }

/**
 * @param {any} value
 * @return {PromiseLike<any>}
 */
export function immediate (value) {
	return new promise(function (resolve) { resolve(value) })
}

/**
 * @param {function} callback
 * @return {object}
 */
export function respond (value) {
	return new promise(function (resolve) { request(function () { resolve(value) }, 16) })
}

/**
 * @param {function} callback
 * @return {number}
 */
export function request (callback) {
	return requestAnimationFrame(callback)
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
 * @param {object} properties
 * @param {object?} prototype
 * @return {function}
 */
export function extend (constructor, properties, prototype) {
	return property(constructor, 'prototype', {value: create(prototype, properties)})
}

/**
 * @param {any} value
 * @throws {any}
 */
export function throws (value) {
	throw value
}

/**
 * @param {any} value
 * @return {any}
 */
export function report (value) {
	try {
		console.error(value)
	} finally {
		return value
	}
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
 * @param {any} value
 * @param {boolean}
 */
export function thenable (value) {
	return value !== undefined && value !== null && typeof value === 'object' && callable(value.then)
}

/**
 * @param {any} value
 * @param {boolean}
 */
export function fetchable (value) {
	return value !== undefined && value !== null && typeof value === 'object' && callable(value.json)
}

/**
 * @param {any} value
 * @param {boolean}
 */
export function serializable (value) {
	return value.textContent === null
}

/**
 * @param {object} value
 * @param {boolean}
 */
export function iterable (value) {
	return callable(value[iterator])
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
 * @param {object?} value
 * @return {object}
 */
export function extract (value) {
	return typeof value === 'object' && value !== null && 'default' in value ? value.default : value
}

/**
 * @param {any?} value
 * @param {any} a
 * @param {any} b
 * @param {function} callback
 * @return {any}
 */
export function each (value, a, b, callback) {
	if (keyable(value)) {
		if (indexable(value)) {
			for (var i = 0; i < value.length; ++i) {
				if (each(value[i], a, b, callback) === null) {
					break
				}
			}
		} else {
			return iterable(value) ? iterate(value, a, b, callback) : callback(value, a, b)
		}
	} else {
		return callback(value, a, b)
	}
}

/**
 * @param {any?} value
 * @param {any} a
 * @param {any} b
 * @param {function} callback
 */
export function iterate (value, a, b, callback) {
	var iter = callable(value.next) ? value : value[iterator]()
	var next = iter.next()

	for (var i = 0; !next.done; next = iter.next(++i)) {
		if (each(next.value, a, b, callback) === null) {
			break
		}
	}
}

/**
 * @param {(PromiseLike<any>|PromiseLike<any>[])?} value
 * @param {function} resolved
 * @param {function?} rejected
 * @return {PromiseLike<any>}
 */
export function resolve (value, resolved, rejected) {
	return indexable(value) ? resolve(settled(value, 0), resolved, rejected) : value.then(resolved, rejected)
}

/**
 * @param {PromiseLike<any>[]?} value
 * @param {number} position
 * @return {PromiseLike<any>}
 */
export function settled (value, position) {
	return new promise(function (resolved, rejected) {
		for (var i = position, index = position, length = value.length, callback = null; i < length; i++) {
			resolve(value[i], callback !== null ? callback : callback = function () {
				if (length === ++index) {
					resolved(length === value.length ? value : settled(value, index))
				}
			}, rejected)
		}
	})
}
