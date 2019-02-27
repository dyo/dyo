import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Exceptions from './Exception.js'
import * as Lifecycle from './Lifecycle.js'
import * as Schedule from './Schedule.js'
import * as Commit from './Commit.js'
import * as Node from './Node.js'

/**
 * @param {object} element
 * @return {object?
 */
export function find (element) {
	return element.uid !== Enum.component || element.owner === null ? element : find(element.host)
}

/**
 * @param {function} value
 * @return {function}
 */
export function lazy (value) {
	return function (props) {
		if (Utility.has(Utility.callable(value) ? value = value() : value, 'current')) {
			return Element.resolve(value.current, props)
		} else {
			Utility.throws(value)
		}
	}
}

/**
 * @param {object} props
 * @return {object}
 */
export function suspense (props) {
	return this.stack === null ? Element.create(0, null, props.children, this.owner = null) : Element.children(this)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {PromiseLike<any>} message
 */
export function dispatch (fiber, host, element, message) {
	resolve(fiber, host = find(host), host = Element.children(host), element, host.children, Utility.resolve(message, function (value) {
		message.current = value, Component.resolve(fiber, element, element.props, element.children)
	}, Exceptions.throws(fiber, element)))
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 * @param {PromiseLike<any>} message
 */
export function resolve (fiber, host, parent, element, children, message) {
	if (host.uid === Enum.component) {
		enqueue(fiber, host, parent, element, children, message, Lifecycle.stack(host))
	} else {
		Schedule.suspend(fiber, message, Utility.noop, null)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 * @param {PromiseLike<any>} message
 * @param {any[]} fullfilled
 */
export function enqueue (fiber, host, parent, element, children, message, fullfilled) {
	if (fullfilled.push(message) === 1) {
		dequeue(fiber, host, parent, element, children, message, fullfilled, null, null, null)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 * @param {PromiseLike<any>} message
 * @param {any[]} fullfilled
 * @param {object?} sibling
 * @param {object?} fallback
 * @param {object?} offscreen
 */
export function dequeue (fiber, host, parent, element, children, message, fullfilled, sibling, fallback, offscreen) {
	Schedule.suspend(fiber, fullfilled, function () {
		if (fallback !== (fullfilled = host.stack = null)) {
			if (Element.active(parent)) {
				Commit.mount(parent, children[1] = sibling, fallback)
				Commit.mount(parent, Element.reparent(parent, Element.children(offscreen)), sibling)
				Commit.unmount(parent, fallback)
				Commit.unmount(parent, offscreen)
			}
		}
	}, null)

	Utility.timeout(function () {
		if (fullfilled !== null) {
			fallback = Node.create(fiber, host, parent, Element.resolve(host.props.fallback), null)
			offscreen = Node.create(fiber, host, parent, Element.create(Enum.offscreen), null)

			Commit.mount(offscreen, Element.reparent(offscreen, children[0]), undefined)
			Commit.mount(parent, children[0] = offscreen, sibling = children[1])
			Commit.mount(parent, children[1] = fallback, sibling)
			Commit.unmount(parent, sibling)
		}
	}, Enum.network)
}
