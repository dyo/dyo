import * as Element from './Element.js'
import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'

/**
 * @param {any} value
 * @return {object}
 */
export function create (value) {
	return Utility.properties(function context (props) {
		if (!Element.active(this)) {
			connect(this.state = this.context = Utility.create(this.context), context.type, props.value)
		} else {
			this.state.value = props.value
		}

		return props.children
	}, {
		type: {value: Utility.symbol()},
		value: {value: value}
	})
}

/**
 * @param {object} context
 * @param {symbol} type
 * @param {any?} value
 * @return {object}
 */
export function connect (context, type, value) {
	return context[type] = {value: value, length: 0}
}

/**
 * @param {object} element
 * @param {object} state
 * @param {object?} context
 * @param {symbol} type
 * @param {any?} value
 */
export function dispatch (element, state, context, type, value) {
	for (var i = 0, length = context.length; i < length; i++) {
		if ((element = context[i]) && (value = element.state[type])) {
			if (!Utility.is(value.value, value.value = context.value) || value === state) {
				Component.dispatch(element.value = element)
			}
		}
	}
}

/**
 * @param {object} element
 * @param {object} state
 * @param {object?} context
 * @param {symbol} type
 * @param {any?} value
 * @return {any}
 */
export function resolve (element, state, context, type, value) {
	var length = 0
	var callback = null
	var provider = context[type] || connect(context, type, value)
	var consumer = state[type] = {value: provider.value}

	Lifecycle.enqueue(provider[length = provider.length++] = element, 0, function () {
		provider[length === provider.length - 1 ? provider.length = length : length] = null
	})

	return [consumer.value, function (value) {
		if (!Utility.is(consumer.value, consumer.value = provider.value = Utility.callable(value) ? value(consumer.value) : value)) {
			Component.enqueue(element, null, callback !== null ? callback : callback = function (element) {
				dispatch(element, consumer, provider, type, value)
			})
		}
	}]
}
