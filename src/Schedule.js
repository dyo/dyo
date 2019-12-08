import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Commit from './Commit.js'
import * as Event from './Event.js'
import * as Serialize from './Serialize.js'

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
	this.error = null
}, {
	/**
	 * @param {function?} resolve
	 * @param {function?} reject
	 * @return {PromiseLike<object>}
	 */
	then: {value: function (resolved, rejected) {
		return then(this, resolved, rejected), this
	}}
}, null)

/**
 * @type {object?}
 */
export var frame = null

/**
 * @param {object} fiber
 * @param {function?} resolve
 * @param {function?} reject
 */
export function then (fiber, resolved, rejected) {
	if (fiber.async !== null) {
		resolve(fiber, null, then, Utility.callable(rejected) ? fiber.error = rejected : null, [fiber, resolved, rejected], true)
	} else {
		finalize(fiber, fiber.target, resolved)
	}
}

/**
 * @return {object?}
 */
export function peek () {
	return frame
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
 * @param {any} callback
 */
export function finalize (fiber, target, callback) {
	if (fiber.length !== 0) {
		dequeue(fiber, target, callback, fiber.stack, fiber.length)
	} else if (fiber.async !== null) {
		resolve(fiber, null, finalize, null, [fiber, target, callback], true)
	} else if (fiber.queue !== null) {
		respond(fiber, target, callback)
	} else if (callback !== null) {
		archive(fiber, target, callback)
	}
}

/**
 * @param {object} fiber
 * @param {object} target
 * @param {any} callback
 */
export function archive (fiber, target, callback) {
	if (fiber.element !== null) {
		if (Utility.serializable(target)) {
			Serialize.serialize(target, fiber.target = Serialize.stringify(fiber.element))
		}

		if (Utility.callable(callback)) {
			finalize(fiber, target, callback(fiber.target))
		} else if (Utility.thenable(callback)) {
			resolve(fiber, callback, finalize, null, [fiber, target, null], null)
		}
	}
}

/**
 * @param {object} fiber
 * @param {any} value
 * @param {any} resolved
 */
export function execute (fiber, value, resolved) {
	var stack = frame

	try {
		resolved(frame = fiber, value)
	} finally {
		frame = stack
	}
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
		return resolve(fiber, null, suspend, null, [fiber, value, resolved, rejected], true)
	} else {
		return resolve(fiber, value, resolved, rejected, null, false)
	}
}

/**
 * @param {object} fiber
 * @param {any?} value
 * @param {function} callback
 * @param {any[]} payload
 * @return {any?}
 */
export function forward (fiber, value, callback, payload, active) {
	switch (active) {
		case null:
			payload[2] = value
		case false:
			fiber.async = null
	}

	if (Utility.callable(callback)) {
		try {
			return callback.apply(frame = fiber, payload === null ? [value] : payload)
		} finally {
			frame = null
		}
	} else {
		Utility.throws(value)
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
export function resolve (fiber, value, resolved, rejected, payload, active) {
	return fiber.async = Utility.resolve(value ? value : fiber.async, function (value) {
		return forward(fiber, value, resolved, payload, active)
	}, function (value) {
		return forward(fiber, value, rejected, null, false)
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
	suspend(fiber, value, function (value) { dequeue(fiber, target, callback, value, value.length) }, null)
}

/**
 * @param {object} fiber
 * @param {object} target
 * @param {function?} callback
 */
export function respond (fiber, target, callback) {
	var queue = fiber.queue
	var stack = fiber.queue = null
	var value = (stack = queue[Enum.request]).length !== 0 ? Utility.respond(stack) : null
	var index = (stack = queue[Enum.respond]).length

	if (index !== 0) {
		dequeue(fiber, target, value === null ? callback : null, stack, index)
	}

	if (value !== null) {
		request(fiber, target, callback, value)
	}
}
