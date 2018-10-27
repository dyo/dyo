import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Commit from './Commit.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'

export var priority = -1
export var current = null
export var length = 0
export var timer = 0
export var delta = 32 - 8

/**
 * @return {object}
 */
export function create () {
	return {history: [], pending: false, priority: timer = priority ? Utility.now() : priority--}
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} host
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 * @param {function} callback
 */
export function resolve (fiber, type, host, element, primary, secondary, callback) {
	Utility.resolve(fiber.pending, function () {
		callback(fiber, type, host, element, primary, secondary)
	})
}

/**
 * @param {object} fiber
 * @param {*} value
 * @return {object}
 */
export function suspend (fiber, value) {
	function forward (value) {
		return fiber.pending = false, value
	}

	if (fiber.pending) {
		return fiber.pending = Utility.resolve(fiber.pending, function () {
			return suspend(fiber, value)
		})
	} else {
		return fiber.pending = Utility.resolve(value, forward)
	}
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} host
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 * {function} callback
 */
export function deadline (fiber, type, host, element, primary, secondary, callback) {
	Utility.resolve(suspend(fiber, Utility.deadline()), function () {
		timer = Utility.now(), callback(fiber, type, host, element, primary, secondary)
	})
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} element
 * @param {*} primary
 * @param {*} secondary
 */
export function dispatch (fiber, type, element, primary, secondary) {
	switch (type) {
		case Enum.content:
			return Commit.content(element, primary)
		case Enum.unmount:
			return Commit.unmount(element, primary, secondary)
		case Enum.mount:
			return Commit.mount(element, primary, secondary)
		case Enum.props:
			return Commit.props(element, primary, secondary)
	}

	try {
		Lifecycle.callback(element, primary, secondary, type)
	} catch (error) {
		Exception.resolve(fiber, element, element, error)
	}
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} host
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 */
export function commit (fiber, type, host, element, primary, secondary) {
	if (type > Enum.content) {
		if (fiber.pending) {
			return resolve(fiber, type, host, element, primary, secondary, commit)
		}

		if (fiber.priority) {
			// if (Utility.now() - timer > delta) {
			// 	return deadline(fiber, type, host, element, primary, secondary, commit)
			// }
		}

		switch (type) {
			case Enum.children:
				return Reconcile.children(fiber, host, element, primary, secondary)
			case Enum.component:
				return Component.resolve(fiber, host, element, primary, secondary)
		}
	}

	fiber.history.push({type: type, element: element, primary: primary, secondary: secondary})
}

/**
 * @param {object} fiber
 * @param {*} type
 * @param {object} host
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 */
export function finalize (fiber, type, host, element, primary, secondary) {
	if (fiber.pending) {
		return resolve(fiber, type, host, element, primary, secondary, finalize)
	}

	var history = fiber.history
	var current = fiber.history = []

	for (var i = 0; i < history.length; ++i) {
		dispatch(fiber, (current = history[i]).type, current.element, current.primary, current.secondary)
	}

	if (fiber.pending || fiber.history.length) {
		finalize(fiber, type, host, element, primary, secondary)
	} else {
		dispatch(fiber, --length, element, primary, secondary)
	}
}

/**
 * @param {object} fiber
 * @param {number} callback
 * @param {object} host
 * @param {object} element
 * @param {*} primary
 * @param {*} secondary
 * @param {*} tertiary
 * @param {*} quaternary
 */
export function callback (fiber, callback, host, element, primary, secondary, tertiary, quaternary) {
	commit(fiber, Enum.callback, host, element, callback, [element, primary, secondary, tertiary, quaternary, callback])
}

/**
 * @param {object} fiber
 * @param {function} callback
 * @param {*} host
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 * @param {function?} tertiary
 */
export function enqueue (fiber, callback, host, element, primary, secondary, tertiary) {
	callback(fiber, host, element, primary, secondary)
	finalize(fiber, length, element, element, primary, tertiary)
}

/**
 * @param {function} callback
 * @param {*} host
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 * @param {function?} tertiary
 */
export function checkout (callback, host, element, primary, secondary, tertiary) {
	enqueue(priority * length++ ? current : current = create(), callback, host, element, primary, secondary, tertiary)
}

/**
 * @param {function} callback
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 * @param {function?} tertiary
 */
export function forward (callback, element, primary, secondary, tertiary) {
	priority = 0

	try {
		callback(element, primary, secondary, tertiary)
	} finally {
		priority = -1
	}
}
