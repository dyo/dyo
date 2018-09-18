import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'
import * as Reconcile from './Reconcile.js'
import * as Schedule from './Schedule.js'

import Registry from './Registry.js'

/**
 * @type {object}
 */
export var descriptors = {
	/**
	 * @param {object} state
	 * @param {function} callback
	 */
	setState: {
		value: function (state, callback) {
			dispatch(Registry.get(this), this, state, callback)
		}
	},
	/**
	 * @param {function} callback
	 */
	forceUpdate: {
		value: function (callback) {
			dispatch(Registry.get(this), this, Enum.force, callback)
		}
	}
}

/**
 * @constructor
 */
export var construct = Utility.extend(factory(), descriptors)

/**
 * @type {object}
 */
export var prototype = construct.prototype

/**
 * @constructor
 */
export var pure = Utility.extend(factory(), {
	/**
	 * @param {object} props
	 * @param {object} state
	 * @return {boolean}
	 */
	shouldComponentUpdate: {
		value: function (props, state) {
			return Utility.compare(this.props, props) || Utility.compare(this.state, state)
		}
	}
}, prototype)

/**
 * @return {function}
 */
export function factory () {
	return function (props) {
		this.state = {}
		this.props = props
	}
}

/**
 * @param {function} type
 * @param {object?} proto
 * @return {function}
 */
export function identity (type, proto) {
	if (proto) {
		if (typeof proto.setState === 'function') {
			return type
		} else if (proto.render) {
			return Utility.define(proto, descriptors), type
		}
	}

	if (!Registry.has(type)) {
		Registry.set(type, Utility.extend(factory(), descriptors, type.render = type))
	}

	return Registry.get(type)
}

/**
 * @param {object} host
 * @param {object} element
 * @return {object}
 */
export function mount (host, element) {
	var type = element.type
	var props = element.props
	var owner = element[Enum.owner] = new (identity(type, type.prototype))(props)
	var state = element[Enum.state] = owner.state || {}

	owner.props = props
	owner.state = state
	owner.refs = {}

	Registry.set(owner, element)

	if (owner[Enum.getDerivedState]) {
		Lifecycle.update(owner, props, state, Enum.getDerivedState)
	}

	return Element.put(element, Lifecycle.render(owner, props, state))
}

/**
 * @param {object} element
 * @parent {object} children
 */
export function unmount (element, children) {
	if (element[Enum.owner][Enum.componentWillUnmount]) {
		element[Enum.state] = Lifecycle.mount(element[Enum.owner], Enum.componentWillUnmount)
	}

	return Element.pick(element)
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {(object|function)?} value
 * @param {function?} callback
 */
export function dispatch (element, owner, value, callback) {
	Schedule.checkout(commit, element[Enum.host], element, owner, value, callback)
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {object} host
 * @param {object} element
 * @param {object} owner
 * @param {(object|function)} value
 */
export function commit (fiber, stack, host, element, owner, value) {
	if (value) {
		if (element.children.length) {
			if (Utility.thenable(value)) {
				return Utility.resolve(Schedule.suspend(fiber, value), function (value) {
					commit(fiber, stack, host, element, owner, value)
				})
			} else if (element[Enum.active] !== Enum.update) {
				return Schedule.commit(fiber, stack, Enum.component, host, element, element, value)
			}
		}

		Utility.assign(element[Enum.state], value)
	}
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {object} host
 * @param {object} element
 * @param {object} snapshot
 * @param {object} value
 */
export function update (fiber, stack, host, element, snapshot, value) {
	var owner = element[Enum.owner]
	var parent = element[Enum.parent]
	var children = element.children
	var state = owner.state
	var props = snapshot.props

	try {
		if (element === snapshot) {
			if (typeof value === 'function') {
				return commit(fiber, stack, host, element, owner, value(state, props))
			}
		}

		state = element[Enum.state] = Utility.merge(state, value)

		if (element[Enum.active] = Enum.update, owner[Enum.getDerivedState]) {
			Lifecycle.update(owner, props, state, Enum.getDerivedState)
		}

		if (element[Enum.active] = Enum.create, owner[Enum.shouldComponentUpdate]) {
			if (value !== Enum.force) {
				if (!Lifecycle.update(owner, props, state, Enum.shouldComponentUpdate)) {
					return owner.state = state
				}
			}
		}

		element[Enum.state] = owner.state
		element.props = owner.props
		owner.state = state
		owner.props = props

		callback(fiber, stack, host, element, Schedule.commit(fiber, stack, Enum.children, element, parent, children, [Lifecycle.render(owner, props, state)]))
	} catch (error) {
		Exception.create(host, element, stack, error)
	}
}

/**
 * @param {object} fiber
 * @param {number} stack
 * @param {object} host
 * @param {object} element
 * @param {number} children
 */
export function callback (fiber, stack, host, element, children) {
	try {
		return children
	} finally {
		if (children) {
			if (element[Enum.owner][Enum.componentDidMount]) {
				Schedule.commit(fiber, stack, Enum.callback, host, element, Enum.componentDidMount, element[Enum.owner])
			}
		} else {
			if (element[Enum.owner][Enum.componentDidUpdate]) {
				Schedule.commit(fiber, stack, Enum.callback, host, element, Enum.componentDidUpdate, element[Enum.owner])
			}
		}
	}
}
