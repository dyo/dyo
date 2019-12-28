import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Interface from './Interface.js'
import * as Schedule from './Schedule.js'
import * as Node from './Node.js'

/**
 * @param {any} element
 * @param {object} target
 * @param {function?} callback
 * @return {PromiseLike<object>}
 */
export function render (element, target, callback) {
	return dispatch(element, Interface.target(target, undefined), callback || undefined)
}

/**
 * @param {any} element
 * @param {object} target
 * @param {function?} callback
 * @return {PromiseLike<object>}
 */
export function dispatch (element, target, callback) {
	if (Utility.has(target, Enum.identifier)) {
		return Schedule.checkout(resolve, target[Enum.identifier], target, [Element.container(element)], callback)
	} else {
		return Schedule.checkout(resolve, Element.target(element, target, Interface.initialize(target)), target, target, callback)
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} target
 * @param {object} value
 */
export function resolve (fiber, element, target, value) {
	if (target === value) {
		Interface.register(Node.create(fiber, element, element, element, null), target)
	} else {
		Reconcile.children(fiber, element, element, element.children, value, 0)
	}
}
