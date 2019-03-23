import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Exception from './Exception.js'
import * as Reconcile from './Reconcile.js'
import * as Schedule from './Schedule.js'
import * as Event from './Event.js'

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
 * @param {function} value
 * @param {function?} callback
 * @return {function}
 */
export function memo (value, callback) {
	return memoize(value, callback !== undefined ? callback : compare)
}

/**
 * @param {function} value
 * @param {function} callback
 * @return {function}
 */
export function memoize (value, callback) {
	return function (props) { return forward(value, callback, this, props) }
}

/**
 * @param {function} value
 * @param {function} callback
 * @param {object} element
 * @param {object} props
 * @return {function}
 */
export function forward (value, callback, element, props) {
	if (Element.active(element)) {
		if (element.value === null) {
			if (callback(element.props, props)) {
				return Element.children(element)
			}
		}
	}

	return value.call(element, props)
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
		element.value = null, element.props = props
	}
}

/**
 * @param {object} element
 */
export function dispatch (element) {
	Schedule.checkout(resolve, element, element.props, element.children, null)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} props
 * @param {any[]} children
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
		if (Schedule.peek() !== null) {
			if (element.value !== callback) {
				Schedule.callback(element, element, element.value = callback)
			}
		} else {
			element.value = Event.request(element, callback)
		}
	}
}

/**
 * @param {object} element
 * @return {object?}
 */
export function dequeue (element) {
	if (element.value !== null) {
		dispatch(element)
	}
}

/**
 * @param {object} element
 */
export function request (element) {
	enqueue(element, element.value, dequeue)
}
