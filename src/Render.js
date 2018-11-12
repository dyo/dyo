import * as Enum from './Enum.js'
import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Node from './Node.js'
import * as Interface from './Interface.js'
import * as Schedule from './Schedule.js'

import Registry from './Registry.js'

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
export function hydrate (element, target, callback) {
	dispatch(element, Interface.target(target), callback, Enum.search)
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
export function render (element, target, callback) {
	dispatch(element, Interface.target(target), callback, Enum.create)
}

/**
 * @param {*} element
 * @param {*} target
 * @param {function?} callback
 * @param {*} initial
 */
export function dispatch (element, target, callback, initial) {
	if (Registry.has(target)) {
		Schedule.checkout(update, Registry.get(target), target, [Element.root(element)], callback)
	} else {
		Schedule.checkout(create, Element.target(element, target, Interface.clear(target)), target, initial, callback)
	}
}

/**
 * @param {object} fiber
 * @param {*} element
 * @param {*} target
 * @param {number} initial
 */
export function create (fiber, element, target, initial) {
	Node.create(fiber, element, element, element, initial)
	Registry.set(target, element)
}

/**
 * @param {object} fiber
 * @param {*} element
 * @param {*} target
 * @param {function?} callback
 * @param {object} children
 */
export function update (fiber, element, target, children) {
	Reconcile.children(fiber, element, element, element.children, children)
}
