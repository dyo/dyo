import * as Enum from './Enum.js'
import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Interface from './Interface.js'
import * as Schedule from './Schedule.js'
import * as Node from './Node.js'

/**
 * @param {any} element
 * @param {object} target
 * @param {function?} callback
 * @return {object}
 */
export function render (element, target, callback) {
	return dispatch(element, Interface.target(target, undefined), callback)
}

/**
 * @param {any} element
 * @param {object} target
 * @param {function?} callback
 * @return {object}
 */
export function dispatch (element, target, callback) {
	var parent = target[Enum.identifier]

	if (parent) {
		return Schedule.checkout(resolve, parent, target, [Element.root(element)], callback)
	} else {
		return Schedule.checkout(resolve, Element.target(element, target, Interface.clear(target)), target, target, callback)
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} target
 * @param {object} value
 */
export function resolve (fiber, element, target, value) {
	if (value === target) {
		target[Enum.identifier] = Node.create(fiber, element, element, element, null)
	} else {
		Reconcile.children(fiber, element, element, 0, element.children, value)
	}
}
