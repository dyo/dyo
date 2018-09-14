import * as Enum from './Enum.js'
import * as Element from './Element.js'

/**
 * @param {object} element
 * @param {*?} value
 * @param {object?} instance
 */
export function refs (element, value, instance) {
	switch (typeof value) {
		case 'function':
			return value(instance)
		case 'object':
			return value.current = instance
		default:
			return element[Enum.host][Enum.owner].refs[value] = instance
	}
}

/**
 * @param {function} type
 * @param {object} props
 * @return {object}
 */
export function construct (type, props) {
	return new type(props)
}

/**
 * @param {object} instance
 * @param {object} props
 * @param {object} state
 * @return {object}
 */
export function render (instance, props, state) {
	return Element.root(instance.render(props, state))
}

/**
 * @param {object} instance
 * @param {object} event
 * @param {object} props
 * @param {object} state
 * @param {object} callback
 * @return {*}
 */
export function event (instance, event, props, state, callback) {
	if (typeof callback === 'function') {
		resolve(instance, callback.call(instance, event, props, state), callback)
	} else if (typeof callback.handleEvent === 'function') {
		resolve(instance, callback.handleEvent(event, props, state), callback)
	}
}

/**
 * @param {object} instance
 * @param {string} from
 */
export function mount (instance, from) {
	return resolve(instance[from](instance.props, instance.state), from)
}

/**
 * @param {object} instance
 * @param {object} props
 * @param {object} state
 * @param {string} from
 * @return {*}
 */
export function update (instance, props, state, from) {
	return resolve(instance, instance[from](props, state), from)
}

/**
 * @param {object} instance
 * @param {object?} value
 * @param {string} from
 */
export function resolve (instance, value, from) {
	if (value) {
		switch (from) {
			case Enum.shouldComponentUpdate:
			case Enum.componentWillUnmount:
				break
			default:
				switch (typeof value) {
					case 'object':
					case 'function':
						instance.setState(value)
				}
		}
	}

	return value
}
