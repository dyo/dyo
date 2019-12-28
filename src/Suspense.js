import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Exceptions from './Exception.js'
import * as Lifecycle from './Lifecycle.js'
import * as Schedule from './Schedule.js'
import * as Node from './Node.js'

/**
 * @param {function} value
 * @return {function}
 */
export function lazy (value) {
	return function (props) {
		return Utility.has(Utility.callable(value) ? value = value(props) : value, 0) ? value[0] : Utility.throws(value)
	}
}

/**
 * @param {object} element
 * @return {object}
 */
export function find (element) {
	return element.identity !== Enum.component || element.owner === undefined ? element : find(element.host)
}

/**
 * @param {object} props
 * @return {object}
 */
export function suspense (props) {
	return forward(this, props, this.stack)
}

/**
 * @param {object} element
 * @param {object} props
 * @param {any[]?} stack
 * @return {object}
 */
export function forward (element, props, stack) {
	return stack === null ? [props.children, element.owner = undefined] : request(element, stack)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {PromiseLike<any>} message
 */
export function dispatch (fiber, host, element, message) {
	resolve(fiber, host = find(host), host = Element.children(host), element, host.children, message)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 * @param {PromiseLike<any>} message
 */
function resolve (fiber, host, parent, element, children, message) {
	enqueue(fiber, host, parent, element, children, Utility.resolve(message, function (value) {
		try {
			return message[0] = Utility.extract(value)
		} finally {
			Schedule.execute(fiber, element, function (fiber, element) {
				Component.resolve(fiber, element.value = element, element.props, element.children)
			})
		}
	}, Exceptions.throws(fiber, element)), Lifecycle.create(host))
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 * @param {PromiseLike<any>} message
 * @param {PromiseLike<any>[]} stack
 */
export function enqueue (fiber, host, parent, element, children, message, stack) {
	if (stack.push(message) === 1) {
		dequeue(fiber, host, parent, parent, children, null, stack, null, null, Element.offscreen())
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 * @param {PromiseLike<any>} callback
 * @param {PromiseLike<any>[]} stack
 * @param {object?} sibling
 * @param {object?} fallback
 * @param {object?} offscreen
 */
export function dequeue (fiber, host, parent, element, children, callback, stack, sibling, fallback, offscreen) {
	Schedule.suspend(fiber, stack, parent.stack = function () {
		if (sibling !== (stack = host.stack = parent.stack = null)) {
			try {
				children[1] = sibling
				parent.value = sibling = null
				parent.identity = Enum.iterable
			} finally {
				Schedule.commit(fiber, Enum.mount, host, parent, parent, fallback)
				Schedule.commit(fiber, Enum.unmount, host, parent, fallback, fallback)
				Schedule.commit(fiber, Enum.unmount, host, parent, offscreen, offscreen)
			}
		}
	}, callback)

	if (host.identity === Enum.component) {
		Schedule.callback(fallback = Element.fallback(host.props, host), Element.active(parent), callback = function (value) {
			if (stack !== null) {
				if (value) {
					Utility.timeout(callback, Enum.network)
				} else if (Element.active(parent)) {
					try {
						Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, offscreen, null), sibling = children[1])
						Schedule.commit(fiber, Enum.mount, Node.create(fiber, host, parent, fallback, null), parent, fallback, sibling)
						Schedule.commit(fiber, Enum.mount, host, offscreen, parent, undefined)
					} finally {
						children[1] = fallback
						parent.value = offscreen.value
						parent.identity = Enum.element
					}
				}
			}
		})
	}
}

/**
 * @param {object} element
 * @param {PromiseLike<any>[]} stack
 */
export function request (element, stack) {
	return Schedule.suspend(Schedule.peek(), stack, function () { Component.request(element) }), Element.children(element)
}
