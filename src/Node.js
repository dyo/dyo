import * as Enum from './Enum.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Exception from './Exception.js'
import * as Lifecycle from './Lifecycle.js'
import * as Interface from './Interface.js'
import * as Schedule from './Schedule.js'
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
	var identity = element.identity
	var owner = element.owner = parent.owner
	var type = element.type

	try {
		switch (element.host = host, identity) {
			case Enum.component:
				return resolve(fiber, host, parent, element, current, element.children = [element])
			case Enum.element:
				var context = element.context = Interface.context(type, parent.context)
		}

		var children = element.children
		var instance = element.value = Interface.create(identity, type, children, context, owner !== null ? owner : Interface.peek())

		if (identity !== Enum.target) {
			if (identity < Enum.text) {
				for (var i = 0; i < children.length; ++i) {
					create(fiber, host, element, children[i] = Element.from(children[i], i, null), instance, element)
				}

				if (identity === Enum.element) {
					Commit.properties(element, element.props, instance, false)
				}
			}

			if (current !== null) {
				Interface.append(current, instance)
			}
		} else {
			dispatch(fiber, host, parent, element, element.owner = Interface.owner(instance), children)
		}
	} finally {
		element.parent = parent
	}

	return element
}

/**
 * @param {object} fiber
 * @param {object} parent
 * @param {object} element
 * @param {object?} current
 * @return {object}
 */
export function destroy (fiber, parent, element, current) {
	var identity = element.identity
	var children = element.children

	try {
		if (identity < Enum.text) {
			if (identity === Enum.component) {
				try {
					return destroy(fiber, parent, children[0], element)
				} finally {
					if (element.stack !== null) {
						if (enqueue(fiber, parent, element, current)) {
							return
						}
					}
				}
			}

			try {
				switch (identity) {
					case Enum.fallback:
						return Schedule.commit(fiber, Enum.unmount, element, current ? current.parent : element, element, element)
					case Enum.target:
						return Schedule.commit(fiber, Enum.unmount, element, element, element, element)
					case Enum.element:
						if (element.stack !== null) {
							Commit.refs(element, null, null)
						}
				}
			} finally {
				for (var i = 0; i < children.length; ++i) {
					destroy(fiber, element, children[i], element)
				}
			}
		}
	} finally {
		element.parent = null
	}

	return element
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} current
 * @param {object[]} children
 */
export function dispatch (fiber, host, parent, element, current, children) {
	return Schedule.commit(fiber, Enum.mount, host, element, create(fiber, host, element, children[0], null), undefined)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} current
 * @param {object[]} children
 * @return {object}
 */
export function resolve (fiber, host, parent, element, current, children) {
	try {
		return create(fiber, element, parent, children[0] = Component.create(fiber, host, element), current)
	} catch (error) {
		try {
			return element === children[0] ? create(fiber, host, parent, children[0] = Element.empty(), current) : children[0]
		} finally {
			Exception.dispatch(fiber, host, element, error)
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} parent
 * @param {object} element
 * @param {object?} current
 * @return {boolean}
 */
export function enqueue (fiber, parent, element, current) {
	if (Lifecycle.destroy(element) !== null) {
		if (current === null) {
			return !dequeue(fiber, parent, element, element.stack)
		}
	}

	return false
}

/**
 * @param {object} fiber
 * @param {object} parent
 * @param {object} element
 * @param {object} current
 */
export function dequeue (fiber, parent, element, current) {
	Schedule.suspend(fiber, current, function () {
		Element.active(parent) && Commit.unmount(parent, element, element)
	}, null)
}
