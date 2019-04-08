import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'

/**
 * @param {any} value
 * @return {object}
 */
export function create (value) {
	var context = function (props) { return forward(this, this.state, this.context, type, props) }
	var type = context[0] = Utility.symbol()

	return context[1] = value, context
}

/**
 * @param {object} context
 * @param {symbol} type
 * @param {number} value
 * @return {object?}
 */
export function destroy (context, type, value) {
	context[value === context.length - 1 ? context.length = value : value] = null
}

/**
 * @param {object} element
 * @param {object?} current
 * @param {object} context
 * @param {symbol} type
 * @param {object} value
 * @return {object?}
 */
export function forward (element, current, context, type, value) {
	if (current === null) {
		element.state = (element.context = Utility.create(context))[type] = [value.value]
	} else {
		current[0] = value.value
	}

	return value.children
}

/**
 * @param {object} element
 * @param {any[]} current
 * @param {any[]} context
 * @param {symbol} type
 * @param {any?} value
 */
export function dispatch (element, current, context, type, value) {
	for (var i = 1; i < context.length; i++) {
		if (element = context[i]) {
			if (current === (value = Lifecycle.state(element)[type])) {
				Component.dequeue(element)
			} else if (!Utility.is(value[0], value[0] = context[0])) {
				Component.dequeue(element.value = element)
			}
		}
	}
}

/**
 * @param {object} element
 * @param {object} current
 * @param {object} context
 * @param {symbol} type
 * @param {any?} value
 * @return {any[]}
 */
export function resolve (element, current, context, type, value) {
	var stack = context[type] || (context[type] = [value])
	var state = current[type] || (current[type] = [stack[0], null, null])

	return state[1] === null ? enqueue(element, state, stack, type, stack.length) : state
}

/**
 * @param {object} element
 * @param {any[]} current
 * @param {any[]} context
 * @param {symbol} type
 * @param {any?} value
 * @return {function}
 */
export function enqueue (element, current, context, type, value) {
	Lifecycle.enqueue(context[value] = element, 0, function () { destroy(context, type, value) })

	return current[1] = function (value) { dequeue(element, current, context, type, value) }, current
}

/**
 * @param {object} element
 * @param {any[]} current
 * @param {any[]} context
 * @param {symbol} type
 * @param {any?} value
 */
export function dequeue (element, current, context, type, value) {
	if (!Utility.is(current[0], current[0] = context[0] = Utility.callable(value) ? value(current[0]) : value)) {
		request(element, current, context, type, value)
	}
}

/**
 * @param {object} element
 * @param {any[]} current
 * @param {any[]} context
 * @param {symbol} type
 * @param {any?} value
 * @return {function}
 */
export function request (element, current, context, type, value) {
	Component.enqueue(element, null, current[2] !== null ? current[2] : current[2] = function () {
		dispatch(element, current, context, type, value)
	})
}
