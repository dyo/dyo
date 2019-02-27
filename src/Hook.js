import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
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
 * @param {any} state
 * @param {any?} value
 * @return {}
 */
export function reduce (state, value) {
	return value
}

/**
 * @param {function} callback
 * @param {any?} value
 * @param {any?} props
 * @param {any[]?} state
 * @return {any}
 */
export function forward (callback, value, props, state) {
	return callback(value, props, state)
}

/**
 * @param {object} element
 * @param {object} children
 * @param {any} value
 */
export function update (element, children, value) {
	if (!Utility.is(children[0], children[0] = Utility.callable(value) ? value(children[0]) : value)) {
		Component.request(element)
	}
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
 * @param {object} element
 * @param {any[]} value
 * @return {object?}
 */
export function enqueue (element, value) {
	if (Element.active(element)) {
		var argument = value[0]
		var callback = value[1]
		var position = value[2]

		return dequeue(element, value, Lifecycle.dequeue(element, position), callback(argument), argument)
	}
}

/**
 * @param {object} element
 * @param {any[]} value
 * @param {number} index
 * @param {(function|PromiseLike<any>)?} callback
 * @param {any[]} argument
 * @return {object?}
 */
export function dequeue (element, value, index, callback, argument) {
	if (callback !== undefined) {
		if (Utility.callable(callback)) {
			if (index = Lifecycle.enqueue(element, index, function () { return callback(argument) })) {
				value[2] = index
			}
		} else if (Utility.thenable(callback)) {
			return Utility.resolve(callback, function (callback) { return dequeue(element, value, index, callback, argument) }, null)
		}
	}
}

/**
 * @param {function} callback
 * @param {any[]?} value
 * @param {number} type
 */
export function request (callback, value, type) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (element.owner !== Interface.peek()) {
		if (index === children.length) {
			children = children[index] = [value, callback, 0, callback = function (value) { return enqueue(element, value) }]
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
 * @param {any?} value
 * @return {any}
 */
export function reference (value) {
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
export function memoize (callback, value) {
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
	return reducer(reduce, value)
}

/**
 * @param {function} callback
 * @return {any[any, function]}
 */
export function reducer (callback, value) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	return index !== children.length ? children[index] : children = children[index] = [
		resolve(element, value), function (value) { update(element, children, callback(children[0], value)) }
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
		children = children[index] = Context.resolve(element, state, context, type, provider.value)
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
		children[index] = [callback]
	} else {
		children[index][0] = callback
	}
}

/**
 * @param {function} callback
 * @param {any} value
 * @return {function}
 */
export function callback (callback, value) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (index === children.length) {
		children = children[index] = [callback, value, function (value, props) { return forward(children[0], value, props, children[1]) }]
	} else {
		children = children[index], children[0] = callback, children[1] = value
	}

	return children[2]
}

/**
 * @param {function} callback
 * @param {any[]?} value
 */
export function layout (callback, value) {
	request(callback, value, Enum.callback)
}

/**
 * @param {function} callback
 * @param {any[]?} value
 */
export function effect (callback, value) {
	request(callback, value, -Enum.callback)
}
