import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Commit from './Commit.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'

import Registry from './Registry.js'

export var priority = -1
export var length = 0
export var timer = 0
export var frame = 60
export var delta = ((1000 / frame) - (300 / frame)) | 0
export var queue = []

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {function} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 */
export function flush (fiber, stack, type, host, parent, primary, secondary) {
	if (fiber.pending) {
		return resolve(fiber, stack, type, host, parent, primary, secondary, flush)
	}

	try {
		reset(fiber.index)
	} finally {
		try {
			fiber.children.forEach(pipe)
		} finally {
			clear(fiber)
		}
	}
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {number} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 * @param {function} callback
 */
export function resolve (fiber, stack, type, host, parent, primary, secondary, callback) {
	Utility.resolve(fiber.pending, function () {
		if (parent[Enum.active] > Enum.active) {
			callback(fiber, Enum.stack, type, host, parent, primary, secondary)
		}
	})
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {number} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 * {function} callback
 */
export function timeout (fiber, stack, type, host, parent, primary, secondary, callback) {
	try {
		suspend(fiber, Utility.timeout())
	} finally {
		resolve(fiber, stack, type, host, parent, primary, secondary, callback)
	}
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {number} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 */
export function commit (fiber, stack, type, host, parent, primary, secondary) {
	if (type > Enum.content) {
		if (fiber.pending) {
			return resolve(fiber, stack, type, host, parent, primary, secondary, commit)
		}

		if (fiber.priority) {
			if (Utility.now() - timer > delta) {
				return timeout(fiber, stack, type, host, parent, primary, secondary, commit)
			}
		}

		switch (type) {
			case Enum.children:
				return Reconcile.children(fiber, stack, host, parent, primary, secondary)
			case Enum.component:
				return Component.update(fiber, stack, host, parent, primary, secondary)
		}
	}

	fiber.children.push({type: type, parent: parent, primary: primary, secondary: secondary})
}

/**
 * TODO
 * @param {object} fiber
 * @param {number} stack
 * @param {number} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 */
export function offscreen (fiber, stack, type, host, parent, primary, secondary) {
	console.log('offscreen', fiber, stack, type, host, parent, primary, secondary)
	// Utility.timeout(function () {
	// 	commit(fiber, Enum.stack, type, host, parent, primary, secondary)
	// })
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
			timer = Utility.now(fiber.pending = false)
		})
	}
}

/**
 * @param {object} fiber
 */
function clear (fiber) {
	if (fiber.children.length) {
		fiber.children = []
	}
}

/**
 * @param {object} fiber
 */
function reset (index) {
	if (queue[index] = index === 0) {
		length = 0, queue = []
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
 */
export function pipe (value) {
	dispatch(value.type, value.parent, value.primary, value.secondary)
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
 * @param {object} instance
 * @param {object} value
 * @param {object} primary
 * @param {object} secondary
 * @param {(function|object)} callback
 */
export function event (instance, value, primary, secondary, callback) {
	priority = 0

	try {
		Lifecycle.event(instance, value, primary, secondary, callback)
	} finally {
		priority = -1
	}
}

/**
 * @param {number} index
 * @return {object}
 */
export function create (index) {
	return {children: [], pending: false, index: index, priority: timer = priority < 0 ? Utility.now() : priority = 0}
}

/**
 * @param {function} type
 * @param {object} host
 * @param {*} parent
 * @param {*} primary
 * @param {*} secondary
 * @param {function} callback
 */
export function checkout (type, host, parent, primary, secondary, callback) {
	var fiber = priority & length ? queue[length - 1] : queue[length] = create(length++)

	try {
		type(fiber, Enum.stack, host, parent, primary, secondary)

		if (callback) {
			commit(fiber, Enum.stack, Enum.callback, host, parent, callback, primary)
		}
	} catch (error) {
		try {
			throw error
		} finally {
			clear(fiber)
		}
	} finally {
		flush(fiber, Enum.stack, Enum.callback, host, parent, primary, secondary)
	}
}
