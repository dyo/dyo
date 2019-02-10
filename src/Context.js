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
		if (Element.active(this)) {
			connect(this.state = this.context = Utility.create(this.context), props.value, context.type)
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
 * @param {any?} value
 * @param {symbol} type
 * @return {object}
 */
export function connect (context, value, type) {
	return context[type] = {value: value, length: 0}
}

/**
 * @param {object} element
 * @param {object} state
 * @param {object?} context
 * @param {any?} value
 * @param {symbol} type
 * @return {any}
 */
export function resolve (element, state, context, value, type) {
	var length = 0
	var callback = null

	context = context[type] || connect(context, value, type)
	state = state[type] = {value: value = context.value}

	Lifecycle.refs(context[length = context.length++] = element, function () {
		if (Element.active(element)) {
			Lifecycle.refs(element)
		} else {
			context[length === context.length - 1 ? context.length = length : length] = null
		}
	})

	return [value, function (value) {
		if (!Utility.is(state.value, state.value = context.value = Utility.callable(value) ? value(state.value) : value)) {
			Component.enqueue(element, null, callback ? callback : callback = function (element, current) {
				for (var i = 0, length = context.length; i < length; i++) {
					if ((element = context[i]) && (current = element.state[type])) {
						if (!Utility.is(current.value, current.value = context.value)) {
							Component.dispatch(element)
						}
					}
				}
			})
		}
	}]
}
