import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Commit from './Commit.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'

export var frame = null

/**
 * @constructor
 * @param {object} element
 * @param {object} primary
 */
export var struct = Utility.extend(function fiber (element, primary) {
	this.element = element
	this.primary = primary
	this.current = null
	this.pending = null
	this.routine = null
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
	frame = null
}

/**
 * @param {object} fiber
 * @return {object}
 */
export function push (fiber) {
	return frame = fiber
}

/**
 * @param {function} value
 * @return {object}
 */
export function then (value) {
	return finalize(this, this.primary, value), this
}

/**
 * @param {object} fiber
 * @param {function} value
 * @return {*}
 */
export function routine (fiber, value) {
	return fiber.routine = null, value()
}

/**
 * @param {object} fiber
 * @param {*} value
 * @return {*}
 */
export function pending (fiber, value) {
	return fiber.pending = null, value
}

/**
 * @param {object} fiber
 * @param {*} value
 * @return {object}
 */
export function suspend (fiber, value) {
	return fiber.pending ? resolve(fiber, [value], suspend) : fiber.pending = value, resolve(fiber, [], pending), value
}

/**
 * @param {*} fiber
 * @param {object} value
 * @param {function} callback
 * @return {object}
 */
export function resolve (fiber, value, callback) {
	return fiber.pending = Utility.resolve(fiber.pending, forward.bind(null, fiber, value, callback), pending.bind(null, fiber))
}

/**
 * @param {object} fiber
 * @param {object} value
 * @param {function} callback
 * @return {*}
 */
export function archive (fiber, value, callback) {
	if (typeof callback === 'function') {
		if (fiber.current = callback.call(fiber.element, value)) {
			if (Utility.thenable(fiber.current)) {
				return suspend(fiber, fiber.current)
			}
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} value
 * @param {function} callback
 * @param {*} argument
 * @return {*}
 */
export function forward (fiber, value, callback, argument) {
	try {
		return callback.apply(fiber, [push(fiber)].concat(value, argument))
	} finally {
		pop()
	}
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
	return fiber.routine = dequeue.bind(null, fiber, element, instance, primary, secondary, tertiary, origin, fiber.routine)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} instance
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 * @param {string} origin
 * @param {function?} callback
 */
export function dequeue (fiber, element, instance, primary, secondary, tertiary, origin, callback) {
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
 * @param {object} element
 * @param {object} primary
 * @param {*} secondary
 */
export function finalize (fiber, primary, secondary) {
	if (fiber.pending) {
		resolve(fiber, [primary, secondary], finalize)
	} else if (fiber.routine) {
		try {
			routine(fiber, fiber.routine)
		} finally {
			finalize(fiber, primary, secondary)
		}
	} else if (secondary) {
		archive(fiber, primary, secondary)
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
		return callback(fiber, element, primary, secondary), fiber
	} finally {
		try {
			finalize(push(fiber), primary, tertiary)
		} finally {
			pop()
		}
	}
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
	return upstream(frame || new struct(element, primary), callback, element, primary, secondary, tertiary)
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
