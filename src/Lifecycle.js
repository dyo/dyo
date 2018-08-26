import * as Constant from './Constant.js'
import * as Element from './Element.js'
import * as Component from './Component.js'

/**
 * @param {object} owner
 * @param {function} value
 * @return {*}
 */
export function callback (owner, value) {
	if (typeof value === 'function') {
		return value.call(owner, owner.state, owner.props)
	}
}

/**
 * @param {object} element
 * @param {*?} value
 * @param {object?} owner
 */
export function refs (element, value, owner) {
	switch (typeof value) {
		case 'function':
			return value.call(element.host, owner, element)
		case 'object':
			return value.current = owner
		default:
			if (element.host.id === Constant.component) {
				element.host.owner.refs[value] = owner
			}
	}
}

/**
 * @param {object} element
 * @param {object} from
 * @param {object} value
 * @param {object} callback
 * @param {object} owner
 * @param {object} props
 * @param {object} state
 * @return {*}
 */
export function event (element, from, value, callback, owner, props, state) {
	if (typeof callback === 'function') {
		return resolve(element, callback.call(owner, value, props, state), from)
	} else if (typeof callback.handleEvent === 'function') {
		return resolve(element, callback.handleEvent(value, props, state), from)
	}
}

/**
 * @param {object} element
 * @param {string} from
 * @param {*} error
 * @param {object} exception
 */
export function exception (element, from, error, exception) {
	resolve(element, element.owner[from](error, exception), from)
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
 * @param {object} owner
 * @param {object} props
 * @param {object} state
 * @return {object}
 */
export function render (owner, props, state) {
	return Element.from(owner.render(props, state), 0)
}

/**
 * @param {object} element
 * @param {string} from
 */
export function mount (element, from) {
	return resolve(element, element.owner[from](), from)
}

/**
 * @param {object} element
 * @param {string} from
 * @param {object} props
 * @param {object} state
 * @return {any}
 */
export function update (element, from, props, state) {
	return resolve(element, element.owner[from](props, state), from)
}

/**
 * @param {Element} element
 * @param {object?} value
 * @param {string} from
 */
export function resolve (element, value, from) {
	if (value) {
		switch (typeof value) {
			case 'object':
			case 'function':
				switch (from) {
					case Constant.getInitialState:
					case Constant.shouldComponentUpdate:
					case Constant.componentWillUnmount:
						break
					default:
						Component.resolve(element, element.owner, value, Constant.state)
				}
		}
	}

	return value
}
