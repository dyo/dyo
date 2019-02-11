import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Context from './Context.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'
import * as Interface from './Interface.js'
import * as Schedule from './Schedule.js'

/**
 * @param {any[]} prev
 * @param {any[]} next
 * @return {boolean}
 */
export function compare (prev, next) {
	if (prev !== next) {
		for (var i = 0; i < prev.length; i++) {
			if (Utility.is(prev[i], next[i]) === false) {
				return false
			}
		}
	}

	return !!prev
}

/**
 * @param {object} element
 * @param {object} children
 * @param {any} value
 */
export function update (element, children, value) {
	if (Utility.callable(value)) {
		update(element, children, value(children[0]))
	} else if (!Utility.is(children[0], children[0] = value)) {
		Component.enqueue(element, element.value, dispatch)
	}
}

/**
 * @param {object} element
 */
export function dispatch (element) {
	Component.dispatch(element)
}

/**
 * @param {object} element
 * @param {any?} value
 * @return {any?}
 */
export function resolve (element, value) {
	return Utility.callable(value) ? value(element.props) : value
}

/**
 * @param {function} callback
 * @param {any[]?} value
 * @param {number} type
 */
export function enqueue (callback, value, type) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (element.owner !== Interface.peek()) {
		if (index === children.length) {
			children = children[index] = [value, callback, 0, callback = function (value) { dequeue(element, value) }]
		} else if (compare((children = children[index])[0], children[0] = value)) {
			return
		} else {
			children[1] = callback, callback = children[3]
		}

		if (type === Enum.callback) {
			Schedule.enqueue(fiber, type, element, element, children, callback)
		} else {
			Schedule.requeue(fiber, type, element, element, children, callback)
		}
	}
}

/**
 * @param {object} element
 * @param {any[]} value
 */
export function dequeue (element, value) {
	var argument = value[0]
	var callback = value[1]
	var position = value[2]

	Lifecycle.dequeue(element, position)

	if (Utility.callable(callback = callback(argument))) {
		if (position = Lifecycle.enqueue(element, position, function () { return callback(argument) })) {
			value[2] = position
		}
	}
}

/**
 * @param {any?} value
 * @return {any}
 */
export function ref (value) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	return index !== children.length ? children[index] : children[index] = {current: resolve(element, value)}
}

/**
 * @param {function} callback
 * @param {any} value
 */
export function memo (callback, value) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (index === children.length) {
		children = children[index] = [value, value]
	} else if (compare((children = children[index])[0], children[0] = value)) {
		return children[1]
	}

	return children[1] = callback(value)
}

/**
 * @param {any?} value
 * @return {any[any, function]}
 */
export function state (value) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	return index !== children.length ? children[index] : children = children[index] = [
		resolve(element, value), function (value) { update(element, children, value) }
	]
}

/**
 * @param {function} value
 * @return {any[any, function]}
 */
export function context (provider) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children
	var context = element.context
	var type = provider.type
	var state = Lifecycle.state(element)

	if (index === children.length) {
		children = children[index] = Context.resolve(element, state, context, provider.value, type)
	} else {
		children = children[index], children[0] = state[type].value = context[type].value
	}

	return children
}

/**
 * @param {function} callback
 */
export function boundary (callback) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (index === children.length) {
		var state = Lifecycle.state(element)
		var stack = state.stack ? state.stack : state.stack = []

		children[index] = stack[stack.length] = [callback]
	} else {
		children[index][0] = callback
	}
}

/**
 * @param {function} callback
 * @return {function}
 */
export function callback (callback) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (index === children.length) {
		children = children[index] = [callback, function () { return children[0].apply(this, arguments) }]
	} else {
		children = children[index], children[0] = callback
	}

	return children[1]
}

/**
 * @param {function} callback
 * @param {any[]?} value
 */
export function layout (callback, value) {
	enqueue(callback, value, Enum.callback)
}

/**
 * @param {function} callback
 * @param {any[]?} value
 */
export function effect (callback, value) {
	enqueue(callback, value, -Enum.callback)
}
