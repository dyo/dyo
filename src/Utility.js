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
 * @param {(object|function)}
 * @param {object?} a
 * @return {(object|function)}
 */
export var define = object.defineProperties

/**
 * @param {string?}
 * @return {(symbol|number)}
 */
export var symbol = typeof Symbol === 'function' ? Symbol : random

/**
 * @type {(symbol|string)}
 */
export var iterator = symbol.iterator || '@@iterator'

/**
 * @constructor
 */
export var registry = typeof WeakMap === 'function' ? WeakMap : function () {
	return {
		key: symbol(),
		has: function (key) { return has(key, this.key) },
		get: function (key) { return key[this.key] },
		set: function (key, value) { return key[this.key] = value, this }
	}
}

/**
 * @constructor
 * @param {function} callback
 */
export var promise = typeof Promise === 'function' ? Promise : function (callback) {
	callback(define(function resolve (value) {
		resolve.entries.forEach(resolve.callback, value)
	}, {
		then: {value: function (callback) { this.entries.push(callback) }},
		entries: {value: []},
		callback: {value: function (callback) { callback(this) }}
	}))
}

/**
 * @param {function} callback
 * @return {number}
 */
export function request (callback) {
	return typeof requestAnimationFrame === 'function' ? requestAnimationFrame(callback) : setTimeout(callback, 16)
}

/**
 * @return {object}
 */
export function timeout () {
	return new promise(request)
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
	throw Error(message)
}

/**
 * @param {string} message
 */
export function report (message) {
	console.error(message)
}

/*
 * @param {*} value
 * @return {boolean}
 */
export function fetchable (value) {
	return value && typeof value.blob === 'function' && typeof value.json === 'function'
}

/**
 * @param {*} value
 * @return {boolean}
 */
export function thenable (value) {
	return value && typeof value.then === 'function'
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
 * @param {object} value
 * @param {*} key
 * @return {boolean}
 */
export function has (value, key) {
	return object.hasOwnProperty.call(value, key)
}

/**
 * @param {function} constructor
 * @param {object} props
 * @param {object?} prototype
 * @return {function}
 */
export function extend (constructor, properties, prototype) {
	return define(constructor, {prototype: {value: create(prototype || null, properties || {})}})
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
 * @param {object} a
 * @param {object} b
 * @return {boolean}
 */
export function compare (a, b) {
	if (a !== b) {
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
		if (typeof value === 'object') {
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
		} else {
			return callback(value, index)
		}
	}
}

/**
 * @param {*} value
 * @param {function} fulfilled
 * @param {function?} rejected
 * @return {Promise?}
 */
export function resolve (value, fulfilled, rejected) {
	if (thenable(value)) {
		return value.then(function (value) {
			return fetchable(value) ? resolve(value.json(), fulfilled, rejected) : fulfilled(value)
		}, rejected)
	} else {
		return fulfilled(value)
	}
}
