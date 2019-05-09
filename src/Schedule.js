import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Commit from './Commit.js'
import * as Event from './Event.js'

/**
 * @constructor
 * @param {object} element
 * @param {object} target
 */
export var struct = Utility.extend(function fiber (element, target) {
	this.element = element
	this.target = target
	this.length = 0
	this.index = 0
	this.stack = []
	this.queue = null
	this.owner = null
	this.async = null
}, {
	/**
	 * @param {function?} value
	 * @return {PromiseLike<object>}
	 */
	then: {value: function (value) {
		return finalize(this, this.target, value), this
	}}
})

/**
 * @type {object?}
 */
export var frame = null

/**
 * @return {object}
 */
export function peek () {
	return frame
}

/**
 * @return {void}
 */
export function root () {
	return frame.target = null
}

/**
 * @return {boolean}
 */
export function memo () {
	return frame.target !== null
}

/**
 * @param {number} type
 * @param {object} element
 * @param {any} a
 * @param {any} b
 * @param {any} c
 * @return {object}
 */
export function create (type, element, a, b, c) {
	return {type: type, element: element, a: a, b: b, c: c}
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
		dequeue(fiber, target, callback, fiber.stack, fiber.length)
	} else if (fiber.async !== null) {
		resolve(fiber, fiber.async, finalize, null, [fiber, target, callback])
	} else if (fiber.queue !== null) {
		respond(fiber, target, callback)
	} else if (callback !== null) {
		archive(fiber, target, callback)
	}
}

/**
 * @param {object} fiber
 * @param {object} target
 * @param {any?} callback
 */
export function archive (fiber, target, callback) {
	if (fiber.element !== null) {
		if (Utility.callable(callback)) {
			finalize(fiber, target, callback.call(fiber.element, target))
		} else if (Utility.thenable(callback)) {
			suspend(fiber, callback, function (value) { finalize(fiber, target, value) }, null)
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} value
 * @param {function} resolved
 * @return {object}
 */
export function pending (fiber, value, resolved) {
	return suspend(fiber, Utility.resolve(value, resolved, null), undefined, null)
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
		return resolve(fiber, fiber.async, suspend, rejected, [fiber, value, resolved, rejected])
	} else {
		return resolve(fiber, value, resolved, rejected, null)
	}
}

/**
 * @param {object} fiber
 * @param {any?} value
 * @param {function} callback
 * @param {any[]} payload
 * @return {any?}
 */
export function forward (fiber, value, callback, payload) {
	var argument = payload === null ? [value, fiber.async = null] : payload

	if (callback !== undefined) {
		try {
			return Utility.callable(callback) ? callback.apply(frame = fiber, argument) : Utility.throws(value)
		} finally {
			frame = null
		}
	}
}

/**
 * @param {object} element
 * @param {any?} target
 * @param {function} callback
 */
export function callback (element, target, callback) {
	frame.stack[frame.length++] = create(Enum.callback, element, element, target, callback)
}

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} element
 * @param {any} a
 * @param {any} b
 * @param {any} c
 */
export function commit (fiber, type, element, a, b, c) {
	dispatch(fiber, type, element, a, b, c)
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
			return Commit.unmount(a, c)
		case Enum.target:
			return Commit.target(a, b)
	}

	Event.resolve(fiber, a, b, c)
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
		return forward(fiber, value, resolved, payload)
	}, function (value) {
		return forward(fiber, value, rejected, payload)
	})
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
	(fiber.queue !== null ? fiber.queue : fiber.queue = [[], []])[type].push(create(type, element, a, b, c))
}

/**
 * @param {object} fiber
 * @param {object} target
 * @param {function?} callback
 * @param {object[]} stack
 * @param {number} length
 */
export function dequeue (fiber, target, callback, stack, length) {
	var value = null

	try {
		for (var i = fiber.length = 0; i < length; i++) {
			dispatch(fiber, (value = stack[i]).type, value.element, value.a, value.b, value.c)
		}
	} finally {
		finalize(fiber, target, callback)
	}
}

/**
 * @param {object} fiber
 * @param {object} target
 * @param {function?} callback
 * @param {object[]} value
 */
export function request (fiber, target, callback, value) {
	suspend(fiber, value, function (value) { dequeue(fiber, target, callback, value, value.length) })
}

/**
 * @param {object} fiber
 * @param {object} target
 * @param {function?} callback
 */
export function respond (fiber, target, callback) {
	var queue = fiber.queue
	var stack = fiber.queue = null
	var value = (stack = queue[Enum.request]).length !== 0 ? Utility.request(stack) : null
	var index = (stack = queue[Enum.respond]).length

	if (index !== 0) {
		dequeue(fiber, target, value === null ? callback : null, stack, index)
	}
	if (value !== null) {
		request(fiber, target, callback, value)
	}
}
