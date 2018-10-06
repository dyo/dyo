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
	dispatch(Element.root(element), Interface.target(target), callback, Enum.search)
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
export function render (element, target, callback) {
	dispatch(Element.root(element), Interface.target(target), callback, Enum.create)
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 * @param {number} origin
 */
export function dispatch (element, target, callback, origin) {
	Schedule.checkout(Schedule.create(), callback, element, element, target, origin, commit)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} children
 * @param {*?} target
 * @param {number} origin
 */
export function commit (fiber, element, children, target, origin) {
	if (Registry.has(target)) {
		update(fiber, Registry.get(target), children)
	} else {
		create(fiber, Registry.set(target, Interface.prepare(Element.portal(element, target), target)).get(target), origin)
	}
}

/**
 * @param {object} fiber
 * @param {object} parent
 * @param {number} origin
 */
export function create (fiber, parent, origin) {
	Node.create(fiber, parent, parent, parent, origin)
}

/**
 * @param {object} fiber
 * @param {object} parent
 * @param {object} children
 */
export function update (fiber, parent, children) {
	Reconcile.children(fiber, parent, parent, parent.children, [children])
}
