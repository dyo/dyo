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
	return fiber.pending = Utility.resolve(fiber.pending, callback.bind.apply(callback, [null].concat(value)), forward.bind(null, fiber))
}

/**
 * @param {object} fiber
 * @param {*} value
 * @return {object}
 */
export function suspend (fiber, value) {
	return fiber.pending ? resolve(fiber, [fiber, value], suspend) : fiber.pending = value, resolve(fiber, [fiber], forward)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} instance
 * @param {*} primary
 * @param {*} secondary
 * @param {*} tertiary
 * @param {string} origin
 */
export function callback (fiber, element, instance, primary, secondary, tertiary, origin) {
	fiber.callback = executor.bind(null, fiber, element, instance, primary, secondary, tertiary, origin, fiber.callback)
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
export function executor (fiber, element, instance, primary, secondary, tertiary, origin, callback) {
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
		case Enum.content:
			return Commit.content(primary, secondary, tertiary)
		case Enum.unmount:
			return Commit.unmount(primary, secondary, tertiary)
		case Enum.mount:
			return Commit.mount(primary, secondary, tertiary)
		case Enum.props:
			return Commit.props(primary, secondary, tertiary)
	}

	try {
		switch (++stack, frame = fiber, type) {
			case Enum.component:
				return Component.resolve(fiber, element, primary, secondary, tertiary)
			case Enum.event:
				return Event.resolve(fiber, element, primary, secondary, tertiary)
			case Enum.callback:
				return Lifecycle.callback(secondary, tertiary)
		}
	} finally {
		if (--stack === 0) {
			frame = null
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} instance
 * @param {*} callback
 */
export function finalize (fiber, element, instance, callback) {
	if (fiber.pending) {
		resolve(fiber, [fiber, element, instance, callback], finalize)
	} else if (fiber.callback) {
		try {
			dispatch(fiber, Enum.callback, element, element, fiber.callback, fiber.callback = null)
		} finally {
			finalize(fiber, element, instance, callback)
		}
	} else if (callback) {
		dispatch(fiber, Enum.callback, element, element, callback, instance)
	}
}

/**
 * @param {function} initialize
 * @param {object} element
 * @param {*} primary
 * @param {*} secondary
 * @param {*} tertiary
 */
export function initialize (fiber, callback, element, primary, secondary, tertiary) {
	try {
		callback(fiber, element, primary, secondary)
	} finally {
		finalize(fiber, element, primary, tertiary)
	}
}

/**
 * @param {function} callback
 * @param {object} element
 * @param {*} primary
 * @param {*} secondary
 * @param {*} tertiary
 */
export function checkout (callback, element, primary, secondary, tertiary) {
	initialize(frame || {pending: null, callback: null, iterator: null}, callback, element, primary, secondary, tertiary)
}
