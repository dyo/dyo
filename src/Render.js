import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Node from './Node.js'
import * as Interface from './Interface.js'
import * as Schedule from './Schedule.js'
import * as Registry from './Registry.js'

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 * @return {object}
 */
export function render (element, target, callback) {
	return dispatch(element, Interface.target(target, undefined), callback)
}

/**
 * @param {*} element
 * @param {*} target
 * @param {function?} callback
 * @return {object}
 */
export function dispatch (element, target, callback) {
	var parent = Registry.get(target)

	if (parent) {
		return Schedule.checkout(enqueue, parent, target, [Element.root(element)], callback)
	} else {
		return Schedule.checkout(enqueue, Element.target(element, target, Interface.clear(target)), target, target, callback)
	}
}

/**
 * @param {object} fiber
 * @param {*} element
 * @param {*} target
 * @param {*} current
 */
export function enqueue (fiber, element, target, current) {
	if (current === target) {
		create(fiber, element, current)
	} else {
		update(fiber, element, current)
	}
}

/**
 * @param {object} fiber
 * @param {*} element
 * @param {*} target
 */
export function create (fiber, element, target) {
	Registry.set(target, Node.create(fiber, element, element, element))
}

/**
 * @param {object} fiber
 * @param {*} element
 * @param {object} children
 */
export function update (fiber, element, children) {
	Reconcile.children(fiber, element, element, element.children, children)
}
