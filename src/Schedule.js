import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Event from './Event.js'
import * as Commit from './Commit.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'

export var frame = null
export var stack = 0

/**
 * @constructor
 */
export var struct = Utility.extend(function () {
	this.pending = null
	this.archive = null
}, {
	/**
	 * @type {function}
	 */
	then: {value: then}
})

/**
 * @return {void}
 */
export function pop () {
	if (--stack === 0) {
		frame = null
	}
}

/**
 * @param {object} fiber
 * @return {object}
 */
export function push (fiber) {
	return ++stack, frame = fiber
}

/**
 * @param {function} value
 * @return {object}
 */
export function then (value, v, b) {
	return this.archive = call.bind(null, this, value, this.archive), this
}

/**
 * @param {object} value
 * @param {function} value
 * @return {object}
 */
export function call (fiber, value, callback) {
	return finalize(fiber, callback ? callback() : null, value)
}

/**
 * @param {object} fiber
 * @param {function} value
 * @return {*}
 */
export function archive (fiber, value) {
	return fiber.archive = null, value()
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} instance
 * @param {*} primary
 * @param {*} secondary
 * @param {*} tertiary
 * @param {string} origin
 * @param {function}
 */
export function enqueue (fiber, element, instance, primary, secondary, tertiary, origin) {
	return fiber.archive = callback.bind(null, fiber, fiber.archive, element, instance, primary, secondary, tertiary, origin)
}

/**
 * @param {object} fiber
 * @param {*} value
 * @return {*}
 */
export function forward (fiber, value) {
	return fiber.pending = null, value
}

/**
 * @param {*} fiber
 * @param {object} value
 * @param {function} callback
 * @return {object}
 */
export function resolve (fiber, value, callback) {
	return fiber.pending = Utility.resolve(fiber.pending, receiver.bind(null, fiber, value, callback), forward.bind(null, fiber))
}

/**
 * @param {object} fiber
 * @param {*} value
 * @return {object}
 */
export function suspend (fiber, value) {
	return fiber.pending ? resolve(fiber, [value], suspend) : fiber.pending = value, resolve(fiber, [], forward)
}

/**
 * @param {object} fiber
 * @param {object} value
 * @param {function} callback
 * @param {*} argument
 * @return {*}
 */
export function receiver (fiber, value, callback, argument) {
	try {
		return callback.apply(null, [push(fiber)].concat(value)), argument
	} finally {
		pop()
	}
}

/**
 * @param {object} fiber
 * @param {function?} callback
 * @param {object} element
 * @param {object} instance
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 * @param {string} origin
 */
export function callback (fiber, callback, element, instance, primary, secondary, tertiary, origin) {
	if (callback) {
		callback()
	}

	try {
		Lifecycle.dispatch(element, instance, primary, secondary, tertiary, origin)
	} catch (error) {
		Exception.resolve(fiber, element, element, error)
	}
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} element
 * @param {*} current
 * @param {*} primary
 * @param {*} secondary
 */
export function dispatch (fiber, type, element, primary, secondary, tertiary) {
	switch (type) {
		case Enum.component:
			return Component.resolve(fiber, element, primary, secondary, tertiary)
		case Enum.content:
			return Commit.content(primary, secondary, tertiary)
		case Enum.unmount:
			return Commit.unmount(primary, secondary, tertiary)
		case Enum.mount:
			return Commit.mount(primary, secondary, tertiary)
		case Enum.props:
			return Commit.props(primary, secondary, tertiary)
	}
}

/**
 * @param {object} fiber
 * @param {object} primary
 * @param {*} secondary
 */
export function finalize (fiber, primary, secondary) {
	if (fiber.pending) {
		resolve(fiber, [primary, secondary], finalize)
	} else if (fiber.archive) {
		try {
			archive(fiber, fiber.archive)
		} finally {
			finalize(fiber, primary, secondary)
		}
	} else if (typeof secondary === 'function') {
		secondary(primary)
	}
}

/**
 * @param {function} initialize
 * @param {object} element
 * @param {*} primary
 * @param {*} secondary
 * @param {*} tertiary
 * @return {object}
 */
export function upstream (fiber, callback, element, primary, secondary, tertiary) {
	try {
		callback(fiber, element, primary, secondary)
	} finally {
		try {
			finalize(push(fiber), primary, tertiary)
		} finally {
			pop()
		}
	}

	return fiber
}

/**
 * @param {function} callback
 * @param {object} element
 * @param {*} primary
 * @param {*} secondary
 * @param {*} tertiary
 * @return {object}
 */
export function checkout (callback, element, primary, secondary, tertiary) {
	return upstream(frame || new struct(), callback, element, primary, secondary, tertiary)
}
