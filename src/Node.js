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
 * @param {number} index
 * @return {object}
 */
export function resolve (fiber, host, parent, element, index) {
	try {
		return Component.create(fiber, host, parent, element, index)
	} catch (error) {
		if (Exception.resolve(fiber, host, element, error)) {
			try {
				return Element.put(element, create(fiber, host, parent, Element.empty(Enum.nan), index))
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
 * @param {object} props
 * @return {object}
 */
export function replace (element, props) {
	try {
		Commit.props(element, props, Enum.create)
	} finally {
		Element.set(element, Enum.owner, Interface.create(element, Enum.create))
	}

	return element
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {number} index
 * @return {object}
 */
export function create (fiber, host, parent, element, index) {
	var constructor = element.constructor

	Element.set(element, Enum.host, host)

	try {
		switch (constructor) {
			case Enum.component:
				return resolve(fiber, host, parent, element, index)
			case Enum.node:
				Element.set(element, Enum.context, Interface.context(element, Element.get(parent, Enum.context)))
		}

		Element.set(element, Enum.owner, Interface.create(element, index))

		if (constructor < Enum.text) {
			for (var i = 0, j = index > -1 ? 1 : -1, k = element.children; i < k.length; ++i) {
				create(fiber, host, element, k[i], j * (i + 1))
			}

			if (constructor !== Enum.thenable) {
				Commit.props(element, element.props, Enum.create)
			} else {
				Reconcile.update(fiber, host, parent, element, element, j, k * (index - 1))
			}
		}

		if (constructor !== Enum.target) {
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
	switch (element.constructor) {
		case Enum.component:
			return Component.destroy(fiber, element)
		case Enum.target:
			Schedule.commit(fiber, Enum.unmount, element, element, element, element)
		case Enum.text:
		case Enum.empty:
		case Enum.comment:
			break
		case Enum.node:
		case Enum.portal:
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
