import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Exception from './Exception.js'
import * as Reconcile from './Reconcile.js'
import * as Schedule from './Schedule.js'

/**
 * @param {object} prev
 * @param {object} next
 * @return {boolean}
 */
export function compare (prev, next) {
	if (prev !== next) {
		for (var key in prev) {
			if (!Utility.has(next, key)) {
				return false
			}
		}

		for (var key in next) {
			if (!Utility.is(prev[key], next[key])) {
				return false
			}
		}
	}

	return true
}

/**
 * @param {function} children
 * @param {function?} callback
 * @return {function}
 */
export function memo (children, callback) {
	return memoize(children, callback !== undefined ? callback : compare)
}

/**
 * @param {function} children
 * @param {function} callback
 * @return {function}
 */
export function memoize (children, callback) {
	return function (props) {
		if (Element.active(this)) {
			if (!this.value && callback(this.props, props)) {
				return this.children[0]
			}
		}

		return children.call(this, props)
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} props
 * @return {object}
 */
export function render (fiber, element, props) {
	return fiber.owner = element, fiber.index = 0, Element.from(element.type(props), 0, props)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @return {object}
 */
export function create (fiber, host, element) {
	return element.context = host.context, render(fiber, element, element.props)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} props
 * @param {object} children
 */
export function update (fiber, host, element, props, children) {
	try {
		Reconcile.children(fiber, element, element.parent, children.length - 1, children, [render(fiber, element, props)])
	} catch (error) {
		Exception.dispatch(fiber, host, element, error)
	} finally {
		element.props = props
	}
}

/**
 * @param {object} element
 * @return {object}
 */
export function dispatch (element) {
	Schedule.checkout(resolve, element, element.props, element.children, undefined)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 */
export function resolve (fiber, element, props, children) {
	if (Element.active(element)) {
		update(fiber, element, element, props, children)
	}
}

/**
 * @param {object} element
 * @param {any} value
 * @param {function} callback
 */
export function enqueue (element, value, callback) {
	if (value === null) {
		if (value = Schedule.peek()) {
			if (element.value !== callback) {
				Schedule.enqueue(value, Enum.callback, element, element, element, element.value = callback)
			}
		} else {
			callback(element)
		}
	} else if (value === undefined) {
		element.value = true
	}
}
