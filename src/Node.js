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
				if (!host.parent) {
					Element.put(host, Element.pick(element))
				}
			}
		}
	}
}

/**
 * @param {object} element
 * @param {object} props
 * @param {number} index
 * @return {object}
 */
export function replace (element, props, index) {
	try {
		Commit.props(element, props, Enum.create)
	} finally {
		element.owner = Interface.create(element, index)
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
	var uid = element.uid

	element.host = host

	try {
		switch (uid) {
			case Enum.component:
				return resolve(fiber, host, parent, element, index)
			case Enum.node:
				element.context = Interface.context(element, parent.context)
		}

		element.owner = Interface.create(element, index)

		if (uid < Enum.text) {
			var sign = index > -1 ? 1 : -1
			var props = element.props
			var children = element.children

			for (var i = 0; i < children.length; ++i) {
				create(fiber, host, element, children[i], sign * (i + 1))
			}
			if (uid !== Enum.thenable) {
				Commit.props(element, props, Enum.create)
			} else {
				Reconcile.update(fiber, host, parent, element, element, children, index)
			}
		}

		if (uid !== Enum.target) {
			Interface.append(parent, element)
		}
	} finally {
		element.parent = parent
	}

	return element
}

/**
 * @param {object} fiber
 * @param {object} element
 * @return {object}
 */
export function destroy (fiber, element) {
	switch (element.uid) {
		case Enum.component:
			return Component.destroy(fiber, element)
		case Enum.text:
		case Enum.empty:
		case Enum.comment:
			break
		case Enum.target:
			Schedule.commit(fiber, Enum.unmount, element, element, element, element)
		case Enum.node:
			if (element.ref !== null) {
				Commit.refs(element)
			}
		default:
			for (var i = 0, children = element.children; i < children.length; ++i) {
				destroy(fiber, children[i])
			}
	}

	return element
}
