import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'

/**
 * @param {string} instance
 * @param {*} origin
 * @return {boolean}
 */
export function has (instance, origin) {
	return !!instance[origin]
}

/**
 * @param {object} element
 * @param {*?} value
 * @param {object?} instance
 */
export function ref (element, value, instance) {
	if (value) {
		switch (typeof value) {
			case 'function':
				return value(instance)
			case 'object':
				return Utility.object(value).current = instance
			case 'string':
				return Utility.object(element.host.instance.refs)[value] = instance
		}
	}
}

/**
 * @param {object} element
 * @param {object} value
 * @param {object} callback
 * @param {object} instance
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @return {*}
 */
export function event (element, value, callback, instance, props, state, context) {
	if (typeof callback === 'function') {
		resolve(element, instance, callback.call(instance, value, props, state, context), state, context, Enum.handleEvent)
	} else if (typeof callback[Enum.handleEvent] === 'function') {
		resolve(element, instance, callback.handleEvent(value, props, state, context), state, context, Enum.handleEvent)
	}
}

/**
 * @param {object} instance
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @return {object}
 */
export function render (instance, props, state, context) {
	return Element.from(instance.render(props, state, context), 0)
}

/**
 * @param {object} element
 * @param {object} instance
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @param {string} origin
 * @return {*}
 */
export function dispatch (element, instance, props, state, context, origin) {
	return resolve(element, instance, instance[origin](props, state, context), state, context, origin)
}

/**
 * @param {object} element
 * @param {object} instance
 * @param {object?} value
 * @param {object} state
 * @param {object} context
 * @param {string} origin
 * @return {*}
 */
export function resolve (element, instance, value, state, context, origin) {
	if (value) {
		switch (origin) {
			case Enum.getDerivedState:
				return Utility.assign(state, value)
			case Enum.getChildContext:
				return element.context = Utility.defaults(value, context)
			case Enum.componentWillUnmount:
				return element.context = value
			case Enum.shouldComponentUpdate:
				return value
			case Enum.handleEvent:
				if (element.uid !== Enum.component) {
					return
				}
			default:
				switch (typeof value) {
					case 'object':
					case 'function':
						Component.dispatch(element, instance, value)
				}
		}
	}
}
