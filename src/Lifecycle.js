import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Exception from './Exception.js'

/**
 * @param {object} element
 * @param {function} type
 * @param {object} props
 * @param {object} context
 * @return {object}
 */
export function constructor (element, type, props, context) {
	try {
		return element.owner = new type(props, context)
	} catch (err) {
		throw err
		// Exception.raise(element, err, Constant.constructor)
	}
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {function} value
 */
export function callback (element, owner, value) {
	try {
		if (typeof value === 'function') {
			return value.call(owner, owner.state, owner.props, owner.context)
		}
	} catch (err) {
		throw err
		// Exception.raise(element, err, Constant.callback)
	}
}

/**
 * @param {object} element
 * @param {*?} value
 * @param {number?} from
 */
export function refs (element, value, owner) {
	try {
		switch (typeof value) {
			case 'function':
				return value.call(element, owner)
			case 'object':
				return Utility.object(value).current = owner
			default:
				if (Component.valid(element.host.owner)) {
					Utility.object(element.host.owner[Constant.refs])[value] = owner
				}
		}
	} catch (err) {
		throw err
		// Exception.raise(element.host, err, Constant.refs)
	}
}

/**
 * @param {object} element
 * @param {object} owner
 * @return {object}
 */
export function render (element, owner) {
	try {
		return Element.from(owner.render(owner.props, owner.state, owner.context), Constant.key)
	} catch (err) {
		throw err
		// Exception.raise(element, err, Constant.render)
	}
}

/**
 * @param {object} element
 * @param {string} from
 */
export function mount (element, from) {
	try {
		return Component.resolve(element, element.owner[from](), from)
	} catch (err) {
		throw err
		// Exception.raise(element, err, from)
	}
}

/**
 * @param {object} element
 * @param {string} from
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @return {any}
 */
export function update (element, from, props, state, context) {
	if (from != Constant.componentDidUpdate) {
		element.active = Constant.update
	}

	try {
		return Component.resolve(element, element.owner[from](props, state, context), from)
	} catch (err) {
		throw err
		// Exception.raise(element, err, from)
	} finally {
		element.active = Constant.active
	}
}

/**
 * @param {object} element
 * @param {object} from
 * @param {object} value
 * @param {object} callback
 * @param {object} props
 * @param {object} state
 * @param {object} context
 */
export function event (element, from, value, callback, props, state, context) {
	try {
		if (typeof callback === 'function') {
			Component.resolve(element, callback.call(owner, value, props, state, context), from)
		} else if (typeof callback.handleEvent === 'function') {
			Component.resolve(element, callback.handleEvent(value, props, state, context), from)
		}
	} catch (err) {
		throw err
		// Exception.report(element, err, from + '(' + value.type + ')' + ':' + Element.display(callback.handleEvent || callback))
	}
}

/**
 * @param {object} element
 * @param {string} from
 * @param {object} value
 */
export function exception (element, from, value) {
	try {
		Component.resolve(element, element.owner[from](value.error, value), from)
	} catch (err) {
		throw err
		// Exception.raise(element, err, from)
	} finally {
		value.bubbles = false
	}
}

/**
 * @param {object} owner
 * @param {string} from
 * @return {boolean}
 */
export function has (owner, from) {
	return typeof owner[from] === 'function'
}
