import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Commit from './Commit.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'

import Registry from './Registry.js'

export var index = 0
export var frame = 60
export var delta = ((1000 / frame) - (300 / frame)) | 0
export var queue = []

/**
 * @param {number} priority
 * @return {object}
 */
export function create (priority) {
	if (index) {
		// TODO if the most previous update has the same priority, merge into that
		// other wise create a new fiber.
		// return queue[index - 1]
	}

	return queue[index] = {index: index++, children: [], pending: false, timer: priority >= 0 ? 0 : Utility.now()}
}

/**
 * @param {object} fiber
 */
export function destroy (fiber) {
	if (fiber.pending) {
		Utility.resolve(fiber.pending, function () {
			destroy(fiber)
		})
	} else {
		try {
			fiber.children.forEach(flush)
		} finally {
			if (queue[fiber.index] = fiber.index === 0) {
				index = 0
				queue = []
			}
		}
	}
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {function} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 * @param {function} callback
 */
export function checkout (fiber, pid, type, host, parent, primary, secondary, callback) {
	try {
		type(fiber, pid, host, parent, primary, secondary)

		if (callback) {
			commit(fiber, pid, Enum.callback, host, parent, callback, primary)
		}
	} catch (error) {
		try {
			throw error
		} finally {
			clear(fiber)
		}
	} finally {
		destroy(fiber)
	}
}

/**
 * @param {number} value
 * @return {number}
 */
export function accumulate (value) {
	return value + 1
}

/**
 * @param {object} value
 * @param {object} fiber
 * @param {number} pid
 * @param {number} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 * @param {function} callback
 */
export function resolve (value, fiber, pid, type, host, parent, primary, secondary, callback) {
	Utility.resolve(value, function () {
		callback(fiber, Enum.pid, type, host, parent, primary, secondary)
	})
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {number} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 * {function} callback
 */
export function timeout (fiber, pid, type, host, parent, primary, secondary, callback) {
	resolve(suspend(fiber, Utility.timeout()), fiber, pid, type, host, parent, primary, secondary, callback)
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {number} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 */
export function commit (fiber, pid, type, host, parent, primary, secondary) {
	if (type > Enum.content) {
		if (fiber.pending) {
			return resolve(fiber.pending, fiber, pid, type, host, parent, primary, secondary, commit)
		}

		if (fiber.timer) {
			if (Utility.now() - fiber.timer > delta) {
				return timeout(fiber, pid, type, host, parent, primary, secondary, commit)
			}
		}

		switch (type) {
			case Enum.children:
				return Reconcile.children(fiber, pid, host, parent, primary, secondary)
			case Enum.component:
				return Component.update(fiber, pid, host, parent, primary, secondary)
		}
	}

	fiber.children.push({type: type, parent: parent, primary: primary, secondary: secondary})
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {number} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 */
export function offscreen (fiber, pid, type, host, parent, primary, secondary) {
	// Utility.timeout(function () {
	// 	commit(fiber, Enum.pid, type, host, parent, primary, secondary)
	// })
}

/**
 * @param {object} fiber
 */
export function clear (fiber) {
	fiber.children = []
}

/**
 * @param {object} fiber
 * @param {number} value
 * @return {object}
 */
export function suspend (fiber, value) {
	try {
		return fiber.pending = value
	} finally {
		Utility.resolve(value, function () {
			fiber.timer = Utility.now(fiber.pending = false)
		})
	}
}

/**
 * @param {number} type
 * @param {object} parent
 * @param {object} primary
 * @param {object} secondary
 */
export function dispatch (type, parent, primary, secondary) {
	switch (type) {
		case Enum.content:
			return Commit.content(parent, primary)
		case Enum.unmount:
			return Commit.unmount(parent, primary)
		case Enum.mount:
			return Commit.mount(parent, primary, secondary)
		case Enum.props:
			return Commit.properties(parent, primary, secondary)
		case Enum.callback:
			return Commit.callback(parent, primary, secondary)
	}
}

/**
 * @param {object} value
 */
export function flush (value) {
	dispatch(value.type, value.parent, value.primary, value.secondary)
}
