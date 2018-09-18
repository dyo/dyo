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
 * @param {number} from
 */
export function dispatch (element, target, callback, from) {
	Schedule.checkout(commit, element, element, target, from, callback)
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {object} element
 * @param {object} children
 * @param {*?} target
 * @param {number} from
 */
export function commit (fiber, stack, element, children, target, from) {
	if (Registry.has(target)) {
		update(fiber, stack, Registry.get(target), children)
	} else {
		create(fiber, stack, Registry.set(target, Element.portal(element, target)).get(target), from)
	}
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {object} parent
 * @param {number} from
 */
export function create (fiber, stack, parent, from) {
	Node.create(fiber, stack, parent, parent, parent, 0, from)
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {object} parent
 * @param {object} children
 */
export function update (fiber, stack, parent, children) {
	Reconcile.children(fiber, stack, parent, parent, parent.children, [children])
}
