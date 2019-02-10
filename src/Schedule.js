import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Commit from './Commit.js'
import * as Event from './Event.js'

/**
 * @type {object?}
 */
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
	this.queued = 0
	this.index = 0
	this.queue = []
	this.stack = []
	this.owner = null
	this.async = null
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
 * @param {object} fiber
 * @param {object} target
 * @param {any?} callback
 */
export function archive (fiber, target, callback) {
	if (Utility.callable(callback)) {
		finalize(fiber, target, callback.call(fiber.element, target))
	} else if (Utility.thenable(callback)) {
		suspend(fiber, callback, function (value) { finalize(fiber, target, value) }, undefined)
	}
}

/**
 * @param {object} fiber
 * @param {object} target
 * @param {function?} callback
 */
export function request (fiber, target, callback) {
	suspend(fiber, Utility.request(), function () {
		try {
			fiber.length = fiber.queued, fiber.queued = 0
			fiber.stack = fiber.queue, fiber.queue = []
		} finally {
			finalize(fiber, target, callback)
		}
	}, undefined)
}

/**
 * @param {object} fiber
 * @param {object} value
 * @param {function} resolved
 * @param {function} rejected
 * @return {object}
 */
export function suspend (fiber, value, resolved, rejected) {
	if (fiber.async !== null) {
		return resolve(fiber, fiber.async, suspend, suspend, [fiber, value, resolved, rejected])
	} else {
		return resolve(fiber, value, resolved, rejected, [])
	}
}

/**
 * @param {any} fiber
 * @param {object} value
 * @param {function} resolved
 * @param {function} rejected
 * @param {any[]} payload
 * @return {object}
 */
export function resolve (fiber, value, resolved, rejected, payload) {
	return fiber.async = Utility.resolve(value, function (value) {
		forward(fiber, value, resolved, payload)
	}, function (value) {
		forward(fiber, value, rejected, payload)
	})
}

/**
 * @param {object} fiber
 * @param {any?} value
 * @param {function} callback
 * @param {any[]} payload
 * @return {any?}
 */
export function forward (fiber, value, callback, payload) {
	if (payload.length === 0) {
		fiber.async = null, payload[payload.length] = value
	}

	try {
		return Utility.callable(callback) ? callback.apply(frame = fiber, payload) : Utility.throws(payload)
	} finally {
		frame = null
	}
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} element
 * @param {any} a
 * @param {any} b
 * @param {any} c
 * @return {void}
 */
export function requeue (fiber, type, element, a, b, c) {
	fiber.queue[fiber.queued++] = {type: type, element: element, a: a, b: b, c: c}
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} element
 * @param {any} a
 * @param {any} b
 * @param {any} c
 * @return {void}
 */
export function enqueue (fiber, type, element, a, b, c) {
	fiber.stack[fiber.length++] = {type: type, element: element, a: a, b: b, c: c}
}

/**
 * @param {object} fiber
 * @param {number} length
 * @param {object[]} stack
 */
export function dequeue (fiber, length, stack) {
	for (var i = fiber.length = 0, value = fiber.stack = []; i < length; i++) {
		dispatch(fiber, (value = stack[i]).type, value.element, value.a, value.b, value.c)
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

	checkout(callback, a, b, c, undefined)
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
	var fiber = stack === null ? frame = new struct(element, target) : stack

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
	if (fiber.length !== 0) {
		try {
			dequeue(fiber, fiber.length, fiber.stack)
		} finally {
			finalize(fiber, target, callback)
		}
	} else if (fiber.queued !== 0) {
		request(fiber, target, callback)
	} else if (fiber.async !== null) {
		resolve(fiber, fiber.async, finalize, finalize, [fiber, target, callback])
	} else if (callback !== undefined) {
		archive(fiber, target, callback)
	}
}
