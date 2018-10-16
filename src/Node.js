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
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {number} origin
 * @return {object}
 */
export function resolve (fiber, host, parent, element, origin) {
	try {
		return Component.create(fiber, host, parent, element, origin)
	} catch (error) {
		if (Exception.resolve(fiber, host, element, error)) {
			try {
				return Element.put(element, create(fiber, host, parent, Element.empty(Enum.nan), origin))
			} finally {
				if (!Element.has(host, Enum.parent)) {
					Element.put(host, Element.pick(element))
				}
			}
		}
	}
}

/**
 * @param {object} element
 * @param {object} snapshot
 * @return {object}
 */
export function replace (element, snapshot) {
	try {
		Element.set(element, Enum.owner, Interface.create(snapshot, Enum.create))
	} finally {
		element.type = snapshot.type
	}

	return element
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {number} origin
 * @return {object}
 */
export function create (fiber, host, parent, element, origin) {
	var constructor = element.constructor

	Element.set(element, Enum.host, host)

	try {
		switch (constructor) {
			case Enum.component:
				return resolve(fiber, host, parent, element, origin)
			case Enum.node:
				Element.set(element, Enum.context, Interface.context(element, Element.get(parent, Enum.context)))
		}

		if (!Element.set(element, Enum.owner, Interface.create(element, origin))) {
			return create(fiber, host, parent, element, Enum.create)
		}

		if (constructor < Enum.text) {
			for (var i = 0, j = element.children, k = origin > -1 ? 1 : -1; i < j.length; ++i) {
				create(fiber, host, element, j[i], k * (i + 1))
			}

			if (constructor !== Enum.thenable) {
				Commit.props(element, element.props, Enum.create)
			} else {
				Reconcile.update(fiber, host, parent, element, element, j, k * (origin - 1))
			}
		}

		if (parent !== element) {
			Interface.append(parent, element)
		}
	} finally {
		Element.set(element, Enum.parent, parent)
	}

	return element
}

/**
 * @param {object} fiber
 * @param {object} element
 * @return {object}
 */
export function destroy (fiber, element) {
	Element.set(element, Enum.parent, null)

	switch (element.constructor) {
		case Enum.component:
			return Component.destroy(fiber, element)
		case Enum.portal:
			Schedule.commit(fiber, Enum.unmount, element, element, element, element)
		case Enum.text:
		case Enum.empty:
		case Enum.comment:
			break
		case Enum.node:
			if (Element.has(element, Enum.ref)) {
				Commit.refs(element)
			}
		default:
			for (var i = 0, j = element.children; i < j.length; ++i) {
				destroy(fiber, j[i])
			}
	}

	return element
}
