import * as Enum from './Enum.js'
import * as Element from './Element.js'
import * as Node from './Node.js'
import * as Reconcile from './Reconcile.js'
import * as Interface from './Interface.js'
import * as Schedule from './Schedule.js'

import Registry from './Registry.js'

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
export function hydrate (element, target, callback) {
	resolve(element, Interface.target(target), callback, Enum.search)
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
export function render (element, target, callback) {
	resolve(element, Interface.target(target), callback, Enum.create)
}

/**
 * @param {*} element
 * @param {*} target
 * @param {function?} callback
 * @param {*} value
 */
export function resolve (element, target, callback, value) {
	if (Registry.has(target)) {
		dispatch(Registry.get(target), target, callback, [Element.root(element)])
	} else {
		dispatch(Element.target(element, target), target, callback, value)
	}
}

/**
 * @param {*} element
 * @param {*} target
 * @param {function?} callback
 * @param {*} value
 */
export function dispatch (element, target, callback, value) {
	Schedule.checkout(checkout, element, element, target, value, callback)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {obejct} parent
 * @param {object} element
 * @param {object} target
 * @param {*} value
 */
export function checkout (fiber, host, parent, target, value) {
	if (typeof value === 'object') {
		Schedule.commit(fiber, Enum.children, host, parent, parent.children, value)
	} else {
		Node.create(fiber, host, parent, Interface.prepare(parent, target), value)

		if (value === Enum.create) {
			Registry.set(target, parent)
		}
	}
}
