import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Assert from './Assert.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'
import * as Node from './Node.js'
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
			this.setState(Enum.obj, callback)
		}
	}
}

/**
 * @constructor
 */
export var struct = Utility.extend(factory(), Utility.assign({
	render: {
		value: function (props) {
			return props.children
		}
	}
}, descriptors))

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
		value: function (props, state, context) {
			return Utility.compare(this.props, props) || Utility.compare(this.state, state) || Utility.compare(this.context, context)
		}
	}
}, struct.prototype)

/**
 * @return {function}
 */
export function factory () {
	return function (props, context) {
		this.props = props
		this.state = {}
		this.context = context
	}
}

/**
 * @param {function} constructor
 * @param {object?} prototype
 * @return {function}
 */
export function identity (constructor, prototype) {
	if (prototype) {
		if (typeof prototype.setState === 'function') {
			return constructor
		} else if (typeof prototype.render === 'function') {
			return Utility.define(prototype, descriptors), constructor
		}
	}

	if (!Registry.has(constructor)) {
		Registry.set(constructor, Utility.extend(factory(), descriptors, constructor.render = constructor))
	}

	return Registry.get(constructor)
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {(object|function)?} value
 * @param {function?} callback
 */
export function dispatch (element, owner, value, callback) {
	Schedule.checkout(checkout, element, element, owner, value, callback)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} owner
 * @param {(object|function)?} value
 */
export function checkout (fiber, host, element, owner, value) {
	if (value) {
		if (Utility.thenable(value)) {
			Utility.resolve(Schedule.suspend(fiber, value), function (value) {
				checkout(fiber, host, element, owner, value)
			}, function (error) {
				Exception.resolve(fiber, element, element, value)
			})
		} else {
			resolve(fiber, host, element, element, value)
		}
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} snapshot
 * @param {*} value
 */
export function resolve (fiber, host, element, snapshot, value) {
	try {
		update(fiber, host, element, snapshot, value)
	} catch (error) {
		Exception.resolve(fiber, host, element, error)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} snapshot
 * @param {*} value
 */
export function update (fiber, host, element, snapshot, value) {
	var parent = Element.get(element, Enum.parent)
	var owner = Element.get(element, Enum.owner)
	var context = Element.set(element, Enum.context, Element.get(host, Enum.context))
	var props = snapshot.props
	var state = owner.state
	var force = value === Enum.obj

	var _props = owner.props
	var _state = state
	var _context = owner.context

	Assert.types(element, context, Enum.contextTypes)

	if (typeof value === 'function') {
		return checkout(fiber, host, element, owner, value(props, state, context))
	}

	state = Utility.defaults(!force ? value : {}, state)

	try {
		if (Lifecycle.has(owner, Enum.getDerivedState)) {
			Lifecycle.invoke(element, owner, props, state, context, Enum.getDerivedState)
		}

		if (Lifecycle.has(owner, Enum.shouldComponentUpdate)) {
			if (!force) {
				if (!Lifecycle.invoke(element, owner, props, state, context, Enum.shouldComponentUpdate)) {
					return
				}
			}
		}
	} finally {
		owner.props = element.props = props
		owner.state = state
		owner.context = context
	}

	if (Lifecycle.has(owner, Enum.getChildContext)) {
		Lifecycle.invoke(element, owner, props, state, context, Enum.getChildContext)
	}

	Schedule.commit(fiber, Enum.children, element, parent, element.children, [Lifecycle.render(owner, props, state, context)])

	if (Lifecycle.has(owner, Enum.componentDidUpdate)) {
		Schedule.callback(fiber, Enum.componentDidUpdate, element, element, owner, _props, _state, _context)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} index
 * @return {object}
 */
export function create (fiber, host, parent, element, index) {
	var type = identity(element.type, element.type.prototype)
	var props = element.props
	var context = Element.set(element, Enum.context, Element.get(host, Enum.context) || {})
	var owner = Element.set(element, Enum.owner, new type(props, context))
	var state = owner.state || {}
	var children = element

	Assert.types(element, context, Enum.contextTypes)

	owner.props = props
	owner.state = state
	owner.context = context
	owner.refs = {}

	Registry.set(owner, element)

	if (Lifecycle.has(owner, Enum.getDerivedState)) {
		Lifecycle.invoke(element, owner, props, state, context, Enum.getDerivedState)
	}

	if (Lifecycle.has(owner, Enum.getChildContext)) {
		Lifecycle.invoke(element, owner, props, state, context, Enum.getChildContext)
	}

	children = Node.create(fiber, element, parent, Element.put(element, Lifecycle.render(owner, props, state, context)), index)

	if (Lifecycle.has(owner, Enum.componentDidMount)) {
		Schedule.callback(fiber, Enum.componentDidMount, element, element, owner, props, state, context)
	}

	return children
}

/**
 * @param {object} fiber
 * @param {object} element
 * @return {object}
 */
export function destroy (fiber, element) {
	var owner = Element.get(element, Enum.owner)
	var children = Element.pick(element)

	if (Lifecycle.has(owner, Enum.componentWillUnmount)) {
		Lifecycle.invoke(element, owner, owner.props, owner.state, owner.context, Enum.componentWillUnmount)
	}

	return Node.destroy(fiber, children)
}
