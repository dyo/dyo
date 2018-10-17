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
 * @param {*?} target
 * @param {function?} callback
 * @param {number} index
 */
export function resolve (element, target, callback, index) {
	if (Registry.has(target)) {
		dispatch(Registry.get(target), target, callback, [Element.root(element)])
	} else {
		dispatch(Registry.set(target, Element.target(element, target)).get(target), target, callback, index)
	}
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 * @param {number} index
 */
export function dispatch (element, target, callback, index) {
	Schedule.checkout(checkout, element, element, target, index, callback)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {obejct} parent
 * @param {object} element
 * @param {object} primary
 * @param {object} secondary
 */
export function checkout (fiber, host, parent, primary, secondary) {
	if (typeof secondary === 'object') {
		Schedule.commit(fiber, Enum.children, host, parent, parent.children, secondary)
	} else {
		Node.create(fiber, host, parent, Interface.prepare(parent, primary), secondary)
	}
}
