import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'

/**
 * @param {object} element
 * @param {*?} value
 * @param {object?} owner
 */
export function refs (element, value, owner) {
	switch (typeof value) {
		case 'function':
			return value(owner)
		case 'object':
			return Utility.object(value).current = owner
		case 'string':
			return Utility.object(element.host.owner.refs)[value] = owner
	}
}

/**
 * @param {object} element
 * @param {*} owner
 * @param {*} value
 */
export function callback (element, owner, value) {
	if (value) {
		switch (typeof value) {
			case 'function':
				return value.call(owner, owner)
			case 'object':
				return invoke.apply(owner, value)
		}
	}
}

/**
 * @param {object} element
 * @param {object} value
 * @param {object} callback
 * @param {object} owner
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @return {*}
 */
export function event (element, value, callback, owner, props, state, context) {
	if (typeof callback === 'function') {
		resolve(element, owner, callback.call(owner, value, props, state, context), state, context, Enum.handleEvent)
	} else if (typeof callback[Enum.handleEvent] === 'function') {
		resolve(element, owner, callback.handleEvent(value, props, state, context), state, context, Enum.handleEvent)
	}
}

/**
 * @param {object} owner
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @return {object}
 */
export function render (owner, props, state, context) {
	return Element.from(owner.render(props, state, context), 0)
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @param {string} origin
 * @return {*}
 */
export function invoke (element, owner, props, state, context, origin) {
	return resolve(element, owner, owner[origin](props, state, context), state, context, origin)
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {object?} value
 * @param {object} state
 * @param {object} context
 * @param {string} origin
 * @return {*}
 */
export function resolve (element, owner, value, state, context, origin) {
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
						Component.dispatch(element, owner, value)
				}
		}
	}
}

/**
 * @param {string} owner
 * @param {*} origin
 * @return {boolean}
 */
export function has (owner, origin) {
	return !!owner[origin]
}
