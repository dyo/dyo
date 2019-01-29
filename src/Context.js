import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'

/**
 * @param {any} value
 * @return {object}
 */
export function create (value) {
	return Utility.properties(function context (props, state) {
		if (this.parent === null) {
			connect(this, state, this.context, context.type)
		}
		return state.value = props.value, props.children
	}, {
		type: {value: Utility.symbol()},
		value: {value: value}
	})
}

/**
 * @param {object} element
 * @param {object} state
 * @param {object?} context
 * @param {symbol} type
 */
export function connect (element, state, context, type) {
	context = element.context = Utility.create(context), context[type] = state, state.length = 0
}

/**
 * @param {object} element
 * @param {object} state
 * @param {any?} context
 * @param {number} type
 */
export function dispatch (element, state, context, type) {
	if (typeof state === 'object') {
		if (Utility.is(state.value, state.value = typeof context !== 'function' ? context : context = context(state.value)) === false) {
			enqueue(element, state, context, type)
		}
	}
}

/**
 * @param {object} element
 * @param {object} state
 * @param {object?} context
 * @param {symbol} type
 * @return {any}
 */
export function resolve (element, state, context, type) {
	if (context) {
		if (context = context[type]) {
			context[type = context.length++] = element, Lifecycle.refs(element, function () {
				return element.parent === null ? context[type === context.length - 1 ? context.length = type : type] = null : false
			})
		}
	}

	return state.value
}

/**
 * @param {object} element
 * @param {object} state
 * @param {any?} context
 * @param {number} type
 */
export function enqueue (element, state, context, type) {
	if (typeof element.value !== 'function') {
		Component.enqueue(element, null, element.value = function (element) {
			for (var i = 0, length = state.length; i < length; i++) {
				if (element = state[i]) {
					if (Utility.is(element.children[type][0], state.value) === false) {
						Component.dispatch(element)
					}
				}
			}
		})
	}
}
