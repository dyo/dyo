import * as Enum from './Enum.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Exception from './Exception.js'
import * as Lifecycle from './Lifecycle.js'
import * as Reconcile from './Reconcile.js'
import * as Interface from './Interface.js'
import * as Commit from './Commit.js'

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} current
 * @return {object}
 */
export function create (fiber, host, parent, element, current) {
	var uid = element.uid
	var type = element.type
	var children = element.children
	var owner = element.owner = parent.owner

	try {
		switch (element.host = host, uid) {
			case Enum.component:
				try {
					return create(fiber, element, parent, children[0] = Component.create(fiber, host, children[0] = element), current)
				} catch (error) {
					return create(fiber, host, parent, children[0] = Element.empty(Exception.dispatch(fiber, host, element, error)), current)
				}
			case Enum.element:
				var context = element.context = Interface.context(parent.context, type)
		}

		var instance = element.ref = Interface.create(uid, type, children, context, owner)

		switch (uid) {
			case Enum.text: case Enum.empty:
				break
			case Enum.target:
				element.owner = Interface.owner(instance)
			default:
				for (var i = 0; i < children.length; ++i) {
					create(fiber, host, element, children[i], instance)
				}
				if (uid > Enum.component) {
					Commit.properties(element, element.props, instance)
				} else if (uid === Enum.thenable) {
					Reconcile.resolve(fiber, host, parent, element, element, type, children, children)
				}
		}

		if (current !== null && uid !== Enum.target) {
			Interface.append(current, instance)
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
	var uid = element.uid
	var children = element.children

	switch (element.parent = null, uid) {
		case Enum.text: case Enum.empty:
			break
		case Enum.component:
			try {
				return destroy(fiber, children[0])
			} finally {
				Lifecycle.defs(element)
			}
		case Enum.target:
			Commit.remove(element, element)
		default:
			for (var i = 0; i < children.length; ++i) {
				destroy(fiber, children[i])
			}
	}

	return element
}
