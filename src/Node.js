import * as Enum from './Enum.js'
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
 * @return {object}
 */
export function resolve (fiber, host, parent, element) {
	try {
		return Component.create(fiber, host, parent, element)
	} catch (error) {
		try {
			return Element.put(element, create(fiber, host, parent, Element.empty(Exception.resolve(fiber, host, element, error))))
		} finally {
			if (!host.parent) {
				Element.put(host, Element.pick(element))
			}
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @return {object}
 */
export function create (fiber, host, parent, element) {
	var uid = element.uid
	var type = element.type
	var owner = element.owner = parent.owner

	try {
		switch (element.host = host, uid) {
			case Enum.component:
				return resolve(fiber, host, parent, element)
			case Enum.element:
				var context = element.context = Interface.context(parent.context, type)
		}

		var children = element.children
		var instance = element.instance = Interface.create(owner, uid, type, children, context)

		switch (uid) {
			case Enum.text: case Enum.empty: case Enum.comment:
				break
			case Enum.target:
				element.owner = Interface.from(instance)
			default:
				for (var i = 0; i < children.length; ++i) {
					create(fiber, host, element, children[i])
				}
				if (uid !== Enum.thenable) {
					Commit.props(parent, element, element.props)
				} else {
					Reconcile.update(fiber, host, parent, element, element, children, i)
				}
		}

		if (uid !== Enum.target) {
			Interface.append(parent.instance, instance)
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
	try {
		switch (element.uid) {
			case Enum.component:
				return Component.destroy(fiber, element)
			case Enum.text: case Enum.empty: case Enum.comment:
				break
			case Enum.target:
				Schedule.dispatch(fiber, Enum.unmount, element, element, element, element)
			case Enum.element:
				if (element.ref !== null) {
					Commit.ref(element)
				}
			default:
				for (var i = 0, children = element.children; i < children.length; ++i) {
					destroy(fiber, children[i])
				}
		}
	} finally {
		element.parent = null
	}

	return element
}

/**
 * @param {object} element
 * @param {object} props
 * @param {*} type
 * @return {object}
 */
export function reparent (element, props, type) {
	try {
		Commit.props(element, element, props)
	} finally {
		element.owner = Interface.from(element.instance = Interface.target(type, element.owner))
	}

	return element
}
