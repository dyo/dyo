import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
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
			if (Utility.is(prev[i], next[i]) === false) {
				return false
			}
		}
	}

	return !!prev
}

/**
 * @param {object} element
 * @param {any[]} value
 * @param {object} props
 * @param {object} state
 */
export function update (element, value, props, state) {
	Lifecycle.defs(element)

	var callback = value[1](value = value[0], props, state)

	if (typeof callback === 'function') {
		Lifecycle.refs(element, function () { return callback(value, props, state) })
	}
}

/**
 * @param {object} element
 * @param {object} children
 * @param {any} value
 */
export function dispatch (element, children, value) {
	children[0] = typeof value !== 'function' ? value : value(children[0]), Component.enqueue(element, element.value)
}

/**
 * @param {object} element
 * @param {object} children
 * @param {any} value
 * @return {any}
 */
export function resolve (element, value) {
	return typeof value !== 'function' ? value : value(element.props)
}

/**
 * @param {function} callback
 * @param {any[]?} value
 * @param {number} type
 */
export function enqueue (callback, value, type) {
	var fiber = Schedule.peek()
	var caret = ++fiber.caret
	var element = fiber.owner
	var children = element.children
	var length = children.length

	if (caret === length) {
		children = children[caret] = [value, callback, callback = function (value, props, state) { update(element, value, props, state) }]
	} else if (compare((children = children[caret])[0], children[0] = value)) {
		return
	} else {
		children[1] = callback, callback = children[2]
	}

	if (type === Enum.callback) {
		Schedule.enqueue(fiber, type, element, element, children, callback)
	} else {
		Utility.timeout(function () {
			// ***** DO MIND ME *****
			// Doesn't matter what is do here the presence of this effectively turns all the wrong switches somewhere
			// Why?
			// Schedule.dispatch(fiber, Enum.callback, element, element, children, callback)
		})
	}
}

/**
 * @param {function} callback
 * @param {any[]?} value
 */
export function memo (callback, value) {
	var fiber = Schedule.peek()
	var caret = ++fiber.caret
	var element = fiber.owner
	var children = element.children
	var length = children.length

	if (caret === length) {
		children = children[caret] = [value, value]
	} else if (compare((children = children[caret])[0], children[0] = value)) {
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
	var caret = ++fiber.caret
	var element = fiber.owner
	var children = element.children
	var length = children.length

	return caret !== length ? children[caret] : children = children[caret] = [
		resolve(element, value), function (value) { dispatch(element, children, value) }
	]
}

/**
 * @param {function} value
 * @return {any[any, function]}
 */
export function context (value) {
	var fiber = Schedule.peek()
	var caret = ++fiber.caret
	var element = fiber.owner
	var children = element.children
	var length = children.length

	var type = value.type
	var context = element.owner
	var state = context ? context[type] : value

	return caret !== length ? (children = children[caret], children[0] = state.value, children) : children[caret] = [
		Context.resolve(element, state, context, type), function (value) { Context.dispatch(element, state, value, caret) }
	]
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

/**
 * @param {function} value
 */
export function boundary (value) {
	var fiber = Schedule.peek()
	var caret = ++fiber.caret
	var element = fiber.owner
	var children = element.children
	var length = children.length
	var state = element.state

	if (caret === length) {
		state = state[Enum.identifier] ? state[Enum.identifier] : state[Enum.identifier] = []
		state[state.length] = children[caret] = [value]
	} else {
		children[caret][0] = value
	}
}

