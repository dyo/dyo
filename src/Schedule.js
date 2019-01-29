import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Interface from './Interface.js'
import * as Commit from './Commit.js'
import * as Event from './Event.js'

export var frame = null

/**
 * @constructor
 * @param {object} element
 * @param {object} target
 */
export var struct = Utility.extend(function fiber (element, target) {
	this.element = element
	this.target = target
	this.length = 0
	this.caret = 0
	this.owner = null
	this.async = null
	this.queue = []
}, {
	then: {value: function (value) { return finalize(this, this.target, value), this }}
})

/**
 * @return {object}
 */
export function peek () {
	return frame
}

/**
 * @param {any} fiber
 * @param {object} value
 * @param {function} fulfilled
 * @param {function} rejected
 * @return {object}
 */
export function resolve (fiber, value, fulfilled, rejected) {
	return Utility.resolve(fiber.async, forward.bind(null, fiber, value, fulfilled), forward.bind(null, fiber, value, rejected))
}

/**
 * @param {object} fiber
 * @param {any} value
 * @param {function} fulfilled
 * @param {function} rejected
 * @return {object}
 */
export function promise (fiber, value, fulfilled, rejected) {
	if (fiber.async) {
		return fiber.async = resolve(fiber, [fiber, value, fulfilled, rejected], promise, promise)
	} else {
		return fiber.async = value, fiber.async = resolve(fiber, [], fulfilled, rejected)
	}
}

/**
 * @param {object} fiber
 * @param {object[]} value
 * @param {function} callback
 * @param {any} argument
 * @return {any}
 */
export function forward (fiber, value, callback, argument) {
	try {
		return callback.apply(frame = fiber, value.length ? value : ((fiber.async = null, value).push(argument), value))
	} finally {
		frame = null
	}
}

/**
 * @param {object} fiber
 * @param {object} value
 * @param {function} callback
 */
export function archive (fiber, value, callback) {
	if (typeof callback === 'function') {
		if (callback = callback.call(fiber.element, value)) {
			if (typeof callback.then === 'function') {
				promise(fiber, callback, archive, archive)
			}
		}
	}
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} element
 * @param {any} a
 * @param {any} b
 * @param {any} c
 */
export function enqueue (fiber, type, element, a, b, c) {
	fiber.queue[fiber.length++] = {type: type, element: element, a: a, b: b, c: c}
}

/**
 * @param {object} fiber
 * @param {number} length
 * @param {object[]} queue
 */
export function dequeue (fiber, length, queue) {
	for (var i = fiber.length = 0, value = fiber.queue = []; i < length; i++) {
		dispatch(fiber, (value = queue[i]).type, value.element, value.a, value.b, value.c)
	}
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} element
 * @param {any} a
 * @param {any} b
 * @param {any} c
 */
export function dispatch (fiber, type, element, a, b, c) {
	switch (type) {
		case Enum.component:
			return Component.update(fiber, element, a, b, c)
		case Enum.content:
			return Commit.content(b, c)
		case Enum.props:
			return Commit.props(b, c)
		case Enum.mount:
			return Commit.mount(a, b, c)
		case Enum.unmount:
			return Commit.unmount(a, b, c)
		case Enum.target:
			return Commit.target(a, b)
	}

	checkout(callback, a, b, c, null)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 * @param {(function|function[])} callback
 */
export function callback (fiber, element, value, callback) {
	Event.resolve(fiber, element, value, callback)
}

/**
 * @param {function} executor
 * @param {object} element
 * @param {object} target
 * @param {any} value
 * @param {any} callback
 * @return {object}
 */
export function checkout (executor, element, target, value, callback) {
	var stack = frame
	var fiber = stack ? stack : frame = new struct(element, target)

	try {
		return executor(fiber, element, target, value), fiber
	} finally {
		try {
			finalize(fiber, target, callback)
		} finally {
			frame = stack
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} target
 * @param {function?} callback
 */
export function finalize (fiber, target, callback) {
	if (fiber.async) {
		resolve(fiber, [fiber, target, callback], finalize, finalize)
	} else if (fiber.length) {
		try {
			dequeue(fiber, fiber.length, fiber.queue)
		} finally {
			finalize(fiber, target, callback)
		}
	} else if (callback) {
		archive(fiber, target, callback)
	}
}
