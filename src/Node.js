import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Exception from './Exception.js'
import * as Commit from './Commit.js'
import * as Reconcile from './Reconcile.js'
import * as Schedule from './Schedule.js'
import * as Interface from './Interface.js'

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} children
 * @param {number} index
 * @param {number} from
 * @return {object}
 */
export function resolve (fiber, stack, host, parent, element, children, index, from) {
	try {
		return Component.callback(fiber, stack, host, element, create(fiber, Schedule.accumulate(stack), element, parent, children, index, from))
	} catch (error) {
		try {
			return Component.callback(fiber, stack, host, element, Element.put(element, create(fiber, stack, element, parent, Element.empty(Enum.nan), index, from)))
		} finally {
			Exception.create(element, children, stack, error)
		}
	}
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {number} index
 * @param {number} from
 * @return {object}
 */
export function create (fiber, stack, host, parent, element, index, from) {
	var constructor = element.constructor

	element[Enum.host] = host
	element[Enum.parent] = parent
	element[Enum.active] = Enum.active

	try {
		switch (constructor) {
			case Enum.component:
				return resolve(fiber, stack, host, parent, element, Component.mount(host, element), index, from)
			case Enum.node:
				element[Enum.namespace] = Interface.namespace(element, parent[Enum.namespace])
		}

		element[Enum.owner] = Interface.create(element, index, from)

		if (constructor < Enum.text) {
			var children = element.children
			var length = children.length
			var props = element.props

			if (children.length) {
				if (Interface.offscreen(element, props)) {
					// Schedule.offscreen(fiber, stack, Enum.children, host, element, children, children = Element.children())
				}
				for (var i = 0; i < length; ++i) {
					create(fiber, stack, host, element, children[i], i, from)
				}
			}

			Commit.properties(element, props, Enum.create)

			if (constructor === Enum.thenable) {
				Reconcile.resolve(fiber, stack, host, parent, element, element)
			}
		}

		if (constructor !== Enum.portal) {
			Interface.append(parent, element)
		}
	} finally {
		element[Enum.active] = Enum.create
	}

	return element
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {object} host
 * @param {object} element
 * @return {object}
 */
export function destroy (fiber, stack, host, element) {
	element[Enum.active] = Enum.active

	switch (element.constructor) {
		case Enum.portal:
			Schedule.commit(fiber, stack, Enum.unmount, host, element, element, null)
		case Enum.text:
		case Enum.empty:
		case Enum.comment:
			break
		case Enum.component:
			return destroy(fiber, stack, element, Component.unmount(element))
		case Enum.node:
			if (element.ref) {
				refs(element)
			}
		default:
			for (var i = 0, j = element.children; i < j.length; ++i) {
				destroy(fiber, stack, host, j[i])
			}
	}

	return element
}
