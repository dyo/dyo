import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Commit from './Commit.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'

export var priority = -1
export var length = 0
export var timer = 0
export var delta = 16 - 6
export var queue = []

/**
 * @param {number} priority
 * @return {object}
 */
export function struct (priority) {
	return {priority: priority, children: [], pending: 0, process: 1}
}

/**
 * @return {object}
 */
export function create () {
	return length * priority ? queue[length - 1] : queue[length++] = struct(timer = priority ? Utility.now() : priority--)
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
		if (Element.has(element, Enum.parent)) {
			callback(fiber, type, element, element, primary, secondary)
		}
	})
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
export function timeout (fiber, type, host, element, primary, secondary, callback) {
	try {
		suspend(fiber, Utility.timeout())
	} finally {
		resolve(fiber, type, host, element, primary, secondary, callback)
	}
}

/**
 * @param {object} fiber
 * @param {function} type
 * @param {object} host
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 * @param {function?} callback
 */
export function checkout (fiber, type, host, element, primary, secondary, callback) {
	callback(fiber, host, element, primary, secondary)
	dispatch(fiber, Enum.callback, host, element, type, primary)
}

/**
 * @param {object} fiber
 * @param {*} type
 * @param {object} host
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 */
export function dispatch (fiber, type, host, element, primary, secondary) {
	if (fiber.pending) {
		return resolve(fiber, type, host, element, primary, secondary, dispatch)
	}

	if (fiber.process) {
		for (var i = fiber.process = 0, j = fiber.children, k = fiber.children = []; i < j.length; ++i) {
			commit(fiber, (k = j[i]).type, k.element, k.primary, k.secondary)
		}

		if (fiber.process = !!fiber.pending | fiber.children.length) {
			dispatch(fiber, Enum.dispatch, host, element, primary, secondary)
		}

		if (type !== Enum.dispatch) {
			try {
				commit(fiber, Enum.callback, element, primary, secondary)
			} finally {
				if (--length === 0) {
					queue = []
				}
			}
		}
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
export function enqueue (fiber, type, host, element, primary, secondary) {
	if (type > Enum.content) {
		if (fiber.pending) {
			return resolve(fiber, type, host, element, primary, secondary, enqueue)
		}

		if (fiber.priority) {
			if (Utility.now() - timer > delta) {
				// return timeout(fiber, type, host, element, primary, secondary, enqueue)
			}
		}

		switch (type) {
			case Enum.children:
				return Reconcile.children(fiber, host, element, primary, secondary)
			case Enum.component:
				return Component.resolve(fiber, host, element, primary, secondary)
		}
	}

	fiber.children.push({type: type, element: element, primary: primary, secondary: secondary})
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} element
 * @param {*} primary
 * @param {*} secondary
 */
export function commit (fiber, type, element, primary, secondary) {
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
 * @param {*} type
 * @return {object}
 */
export function suspend (fiber, type) {
	function restore () {
		timer = Utility.now(fiber.pending = false)
	}

	try {
		return fiber.pending = type
	} finally {
		Utility.resolve(type, restore, restore)
	}
}

/**
 * @param {function} callback
 * @param {*} value
 * @param {*} element
 * @param {*} primary
 * @param {*} secondary
 */
export function event (callback, value, element, primary, secondary) {
	priority = 0

	try {
		callback(value, element, primary, secondary)
	} finally {
		priority = -1
	}
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} element
 * @param {*} primary
 * @param {*} secondary
 * @param {*} tertiary
 * @param {*} quaternary
 */
export function callback (fiber, type, host, element, primary, secondary, tertiary, quaternary) {
	enqueue(fiber, Enum.callback, host, element, [element, primary, secondary, tertiary, quaternary, type], null)
}
