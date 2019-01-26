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
 * @param {function} callback
 * @return {function}
 */
export function memo (children, callback) {
	return memoize(children, callback || compare)
}

/**
 * @param {function} children
 * @param {function} callback
 * @return {function}
 */
export function memoize (children, callback) {
	return function (props, state) {
		if (this.parent !== null && this.value === null && callback(this.props, props) === true) {
			return this.children[0]
		} else {
			return children.call(this, props, state)
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} props
 * @param {object} state
 * @return {object}
 */
export function render (fiber, element, props, state) {
	return fiber.owner = element, fiber.caret = 0, Element.from(element.type(props, state), 0, props)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @return {object}
 */
export function create (fiber, host, element) {
	return element.owner = host.owner, element.ref = [], render(fiber, element, element.props, element.state = {})
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
		Reconcile.children(fiber, element, element.parent, children.length - 1, children, [render(fiber, element, props, element.state)])
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
	Schedule.checkout(resolve, element, element.props, element.children, null)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} value
 */
export function resolve (fiber, element, props, children) {
	if (element.parent !== null) {
		update(fiber, element, element, props, children)
	}
}

/**
 * @param {object} element
 * @param {any} value
 */
export function enqueue (element, value) {
	if (!(element.value = value !== null)) {
		try {
			dispatch(element)
		} finally {
			element.value = null
		}
	}
}
