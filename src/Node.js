import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Exception from './Exception.js'
import * as Commit from './Commit.js'
import * as Schedule from './Schedule.js'
import * as Interface from './Interface.js'

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {object} host
 * @param {object} parent
 * @param {object} snapshot
 * @param {number} index
 * @param {number} from
 * @return {object}
 */
export function resolve (fiber, pid, host, parent, element, index, from) {
	try {
		return create(fiber, Schedule.accumulate(pid), host, parent, element, index, from)
	} catch (error) {
		try {
			return Element.put(host, create(fiber, pid, host, parent, Element.empty(Enum.nan), index, from))
		} finally {
			Exception.create(host, element, error, pid)
		}
	}
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {object} host
 * @param {object} parent
 * @param {object} snapshot
 * @param {number} index
 * @param {number} from
 * @return {object}
 */
export function create (fiber, pid, host, parent, element, index, from) {
	element[Enum.host] = host
	element[Enum.parent] = parent

	try {
		switch (element.constructor) {
			case Enum.component:
				return Component.callback(fiber, pid, host, element, resolve(fiber, pid, element, parent, Component.mount(host, element), index, from))
			case Enum.node:
				element[Enum.namespace] = Interface.namespace(element, parent[Enum.namespace])
		}

		element[Enum.owner] = Interface.create(element, index, from)

		if (element.constructor < Enum.text) {
			if (element.props) {
				// if (Interface.offscreen(element.props)) {
					// Schedule.offscreen(fiber, pid, Enum.children, element, element.children, element.children = Element.children())
				// }
			}
			if (element.children) {
				for (var i = 0, j = element.children; i < j.length; ++i) {
					create(fiber, pid, host, element, j[i], i, from)
				}
			}
			if (element.props) {
				Commit.properties(element, element.props, Enum.create)
			}
			if (element.constructor === Enum.thenable) {
				enqueue(fiber, pid, element, element)
			}
		}
		if (element.constructor !== Enum.portal) {
			Interface.append(parent, element)
		}
	} finally {
		element[Enum.active] = Enum.active
	}

	return element
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {object} host
 * @param {object} element
 * @return {object}
 */
export function destroy (fiber, pid, host, element) {
	element[Enum.active] = -Enum.active

	switch (element.constructor) {
		case Enum.portal:
			Schedule.commit(fiber, pid, Enum.unmount, host, element, element, null)
		case Enum.text:
		case Enum.empty:
		case Enum.comment:
			break
		case Enum.component:
			return destroy(fiber, pid, element, Component.unmount(element))
		case Enum.node:
			if (element.ref) {
				refs(element)
			}
		default:
			for (var i = 0, j = element.children; i < j.length; ++i) {
				destroy(fiber, pid, host, j[i])
			}
	}

	return element
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {object} host
 * @param {object} element
 * @param {object} snapshot
 * @return {object}
 */
export function enqueue (fiber, pid, host, element, snapshot) {
	return Utility.resolve(element.type = snapshot.type, function (value) {
		if (element[Enum.active] >= Enum.active) {
			if (element.type === snapshot.type) {
				Schedule.commit(fiber, pid, Enum.children, host, element, element.children, Element.children(value))
			}
		}
	})
}
