import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Context from './Context.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'
import * as Schedule from './Schedule.js'

/**
 * @param {any[]} prev
 * @param {any[]} next
 * @return {boolean}
 */
export function compare (prev, next) {
	if (prev !== next) {
		for (var i = 0; i < prev.length; i++) {
			if (!Utility.is(prev[i], next[i])) {
				return false
			}
		}
	}

	return !!prev
}

/**
 * @param {any[]?} current
 * @param {any?} value
 * @param {any?} props
 * @return {any}
 */
export function forward (current, value, props) {
	return current[1] === undefined ? current[0](value, props) : current[0](current[1], value, props)
}

/**
 * @param {object} element
 * @param {object} current
 * @param {any} value
 */
export function update (element, current, value) {
	if (!Utility.is(current[0], current[0] = Utility.callable(value) ? value(current[0]) : value)) {
		Component.request(element)
	}
}

/**
 * @param {object} element
 * @param {object} current
 * @param {any} value
 */
export function dispatch (element, current, value) {
	update(element, current, current[2](current[0], value))
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

	if (element.owner === null) {
		return
	}

	var index = ++fiber.index
	var children = element.children

	if (index === children.length) {
		children = children[index] = [value, callback, 0, callback = function (value) { return enqueue(element, value) }]
	} else if (compare((children = children[index])[0], children[0] = value)) {
		return
	} else {
		children[1] = callback, callback = children[3]
	}

	Schedule.enqueue(fiber, type, element, element, children, callback)
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
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (index === children.length) {
		children = children[index] = [resolve(element, value), function (value) { update(element, children, value) }]
	} else {
		children = children[index]
	}

	return children
}

/**
 * @param {function} callback
 * @param {any?} value
 * @return {any[any, function]}
 */
export function reducer (callback, value) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (index === children.length) {
		children = children[index] = [resolve(element, value), function (value) { dispatch(element, children, value) }, callback]
	} else {
		children = children[index], children[2] = callback
	}

	return children
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
	var current = Lifecycle.state(element)
	var type = provider[0]

	if (index === children.length) {
		children = children[index] = Context.resolve(element, current, context, type, provider[1])
	} else {
		children = children[index], children[0] = current[type][0] = context[type][0]
	}

	return children
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
		children = children[index] = [callback, value, function (value, props) { return forward(children, value, props) }]
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
	request(callback, value, Enum.respond)
}

/**
 * @param {function} callback
 * @param {any[]?} value
 */
export function effect (callback, value) {
	request(callback, value, Enum.request)
}
