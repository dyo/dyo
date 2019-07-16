import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Context from './Context.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'
import * as Schedule from './Schedule.js'

/**
 * @param {any?} value
 * @return {any}
 */
export function extract (value) {
	return Utility.fetchable(value) ? value.json() : value
}

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
 * @param {object} element
 * @param {object} current
 * @param {any} value
 */
export function dispatch (element, current, value) {
	resolve(element, current, current[1](current[0][0], value))
}

/**
 * @param {object} element
 * @param {object} current
 * @param {any} value
 */
export function resolve (element, current, value) {
	if (!Utility.is(current[0][0], Utility.callable(value) ? value = value(current[0][0]) : value)) {
		current[0] = [value, current[0][1]], Component.request(element)
	}
}

/**
 * @param {any[]} current
 * @param {object} value
 * @return {object?}
 */
export function enqueue (current, value) {
	if (Element.active(current[0])) {
		var callback = current[1]
		var argument = current[2]
		var position = current[3]
		var children = Lifecycle.create(current[0])

		if (position !== -1) {
			children[position]()
		}

		return dequeue(current, value, children, callback(argument, value), argument, position)
	}
}

/**
 * @param {any[]} current
 * @param {object} value
 * @param {any[]} children
 * @param {function?} callback
 * @param {any[]} argument
 * @param {number} position
 * @return {object?}
 */
export function dequeue (current, value, children, callback, argument, position) {
	if (callback !== undefined) {
		if (Utility.callable(callback)) {
			children[position !== -1 ? position : current[3] = children.length] = callback
		} else if (Utility.thenable(callback)) {
			return Utility.resolve(callback, function (callback) {
				return dequeue(current, value, children, callback, argument, position)
			}, null)
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
		children = children[index] = [element, callback, value, -1]
	} else if (compare((children = children[index])[2], children[2] = value)) {
		return
	} else {
		children[1] = callback
	}

	Schedule.enqueue(fiber, type, element, element, children, enqueue)
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

	return index !== children.length ? children[index] : children[index] = {current: Lifecycle.resolve(element, value)}
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
		children = children[index] = [value, callback(value)]
	} else if (!compare((children = children[index])[0], children[0] = value)) {
		children[1] = callback(value)
	}

	return children[1]
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
		children = children[index] = [[Lifecycle.resolve(element, value), function (value) { resolve(element, children, value) }]]
	} else {
		children = children[index]
	}

	return children[0]
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
		children = children[index] = [[Lifecycle.resolve(element, value), function (value) { dispatch(element, children, value) }], callback]
	} else {
		children = children[index], children[1] = callback
	}

	return children[0]
}

/**
 * @param {any?} value
 * @return {any[any, function]}
 */
export function context (value) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (index === children.length) {
		children = children[index] = Context.resolve(element, value)
	} else {
		children = children[index]
	}

	return children[0]
}

/**
 * @param {function?} callback
 * @return {any}
 */
export function resource (callback) {
	var fiber = Schedule.peek()
	var element = fiber.owner
	var index = ++fiber.index
	var children = element.children

	if (index === children.length) {
		Utility.throws(children[index] = Utility.resolve(Lifecycle.resolve(element, callback), extract, null))
	}

	return children[index][0]
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
	request(callback, value, Enum.respond)
}

/**
 * @param {function} callback
 * @param {any[]?} value
 */
export function effect (callback, value) {
	request(callback, value, Enum.request)
}

