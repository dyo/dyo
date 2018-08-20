import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Commit from './Commit.js'
import * as Registry from './Registry.js'
import * as Interface from './Interface.js'

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
export function render (element, target, callback) {
	commit(Element.from(element, Constant.key), Interface.target(target), Constant.create, callback)
}

/**
 * @param {*} element
 * @param {*?} target
 * @param {function?} callback
 */
export function hydrate (element, target, callback) {
	commit(Element.from(element, Constant.key), Interface.target(target), Constant.search, callback)
}

/**
 * @param {object} target
 * @return {boolean}
 */
export function unmount (target) {
	return Registry.has(Interface.target(target)) && !render(null, target)
}

/**
 * @param {*} parent
 * @param {*} element
 * @param {*?} target
 * @param {number} from
 * @param {function?} callback
 */
export function commit (element, target, from, callback) {
	if (Registry.has(target)) {
		update(Registry.get(target), element)
	} else if (Interface.valid(target, Constant.owner)) {
		mount(Element.target(target), element, target, from)
	} else {
		Utility.invariant('Invalid target!')
	}

	if (callback) {
		Lifecycle.callback(element, callback)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} target
 * @param {number} from
 */
export function mount (parent, element, target, from) {
	Interface.prepare(target, Registry.set(target, parent))
	Commit.append(parent, Element.put(parent, Commit.create(parent, parent, element, from)))
}

/**
 * @param {object} element
 * @param {object} snapshot
 */
export function update (element, snapshot) {
	Reconcile.children(element, element, element.children, Element.children(snapshot))
}
