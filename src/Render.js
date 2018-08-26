import * as Constant from './Constant.js'
import * as Element from './Element.js'
import * as Commit from './Commit.js'
import * as Reconcile from './Reconcile.js'
import * as Interface from './Interface.js'

import Registry from './Registry.js'

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
export function render (element, target) {
	commit(element, Interface.target(target), Constant.create)
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
export function hydrate (element, target) {
	commit(element, Interface.target(target), Constant.search)
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {number} from
 */
export function commit (element, target, from) {
	if (Registry.has(target)) {
		update(Registry.get(target), Element.root([Element.from(element, 0)]))
	} else {
		create(Element.target(), Element.from(element, 0), target, from)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} target
 * @param {number} from
 */
export function create (parent, element, target, from) {
	mount(parent, Element.put(parent, Commit.create(parent, parent, element, from)), parent.owner = target)
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} target
 */
export function mount (parent, element, target) {
	Commit.append(parent, element)
	Registry.set(target, parent)
}

/**
 * @param {object} element
 * @param {object} snapshot
 */
export function update (element, snapshot) {
	Reconcile.update(Constant.pid, element, snapshot)
}
