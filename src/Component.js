import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Assert from './Assert.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'
import * as Node from './Node.js'
import * as Reconcile from './Reconcile.js'
import * as Schedule from './Schedule.js'
import * as Registry from './Registry.js'

/**
 * @type {object}
 */
export var descriptors = {
	/**
	 * @param {object} state
	 * @param {function} callback
	 * @return {object}
	 */
	setState: {
		value: function (state, callback) {
			return dispatch(Registry.get(this), this, state, callback)
		}
	},
	/**
	 * @param {function} callback
	 * @return {object}
	 */
	forceUpdate: {
		value: function (callback) {
			return this.setState(Enum.obj, callback)
		}
	}
}

/**
 * @constructor
 */
export var struct = Utility.extend(factory(), Utility.assign({
	/**
	 * @type {function}
	 */
	render: {value: render}
}, descriptors))

/**
 * @constructor
 */
export var pure = Utility.extend(factory(), Utility.assign({
	/**
	 * @type {function}
	 */
	render: {value: render},
	/**
	 * @type {function}
	 */
	shouldComponentUpdate: {value: compare}
}, descriptors))

/**
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @return {object?}
 */
export function render (props, state, context) {
	return typeof props.children === 'function' ? props.children(props, state, context) : props.children
}

/**
 * @param {object} props
 * @param {object} state
 * @param {object} context
 * @return {boolean}
 */
export function compare (props, state, context) {
	return Utility.compare(this.props, props) || Utility.compare(this.state, state) || Utility.compare(this.context, context)
}

/**
 * @return {function}
 */
export function factory () {
	return function constructor (props) {
		this.props = props
		this.state = null
		this.context = null
	}
}

/**
 * @param {function} value
 * @param {object?} proto
 * @return {function}
 */
export function identity (value, proto) {
	if (proto) {
		if (proto.setState) {
			return Registry.set(value, value)
		} else if (proto.render) {
			return Registry.set(value, Utility.extend(value, descriptors))
		}
	}

	return Registry.set(value, Utility.extend(factory(), descriptors, value.render = value))
}

/**
 * @param {object} host
 * @param {object} instance
 * @param {(object|function)?} value
 * @return {object}
 */
export function dispatch (host, instance, value, callback) {
	return Schedule.checkout(enqueue, host, instance, value, callback)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} instance
 * @param {(object|function)?} value
 */
export function enqueue (fiber, host, instance, value) {
	if (value) {
		switch (typeof value) {
			case 'object':
				if (value === instance.state) {
					return
				}
			case 'function':
				if (host.parent !== null) {
					if (!Utility.thenable(value)) {
						Schedule.dispatch(fiber, Enum.component, host, host, host, value)
					} else if (value.constructor !== fiber.constructor) {
						Schedule.suspend(fiber, value, enqueue.bind(null, fiber, host, instance), Exception.throws(fiber, host, host))
					}
				}
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
 * @param {object} parent
 * @param {object} element
 * @return {object}
 */
export function create (fiber, host, parent, element) {
	var type = element.type
	var props = element.props
	var context = element.context = host.context = host.context || {}
	var constructor = Registry.get(type) || identity(type, type.prototype)
	var instance = element.instance = new constructor(props)
	var state = instance.state || {}
	var children = element.children

	Assert.types(element, context, Enum.contextTypes)

	instance.props = props
	instance.state = state
	instance.context = context
	instance.refs = {}

	Registry.set(instance, element)

	if (Lifecycle.has(instance, Enum.getDerivedState)) {
		Lifecycle.dispatch(element, instance, props, state, context, Enum.getDerivedState)
	}

	if (Lifecycle.has(instance, Enum.getChildContext)) {
		Lifecycle.dispatch(element, instance, props, state, context, Enum.getChildContext)
	}

	children = Node.create(fiber, element, parent, Element.put(element, Lifecycle.render(instance, props, state, context, children)))

	if (Lifecycle.has(instance, Enum.componentDidMount)) {
		Schedule.enqueue(fiber, element, instance, props, state, context, Enum.componentDidMount)
	}

	return children
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} snapshot
 * @param {*} value
 */
export function update (fiber, host, element, snapshot, value) {
	var parent = element.parent
	var children = element.children
	var instance = element.instance
	var context = element.context = host.context
	var props = element === snapshot ? instance.props : snapshot.props
	var state = instance.state
	var force = value === Enum.obj

	var _props = instance.props
	var _state = state
	var _context = instance.context

	if (element === snapshot) {
		if (typeof value === 'function') {
			return enqueue(fiber, element, instance, value(state))
		} else if (!force) {
			state = Utility.defaults(value, state)
		}
	}

	Assert.types(element, context, Enum.contextTypes)

	try {
		if (Lifecycle.has(instance, Enum.shouldComponentUpdate)) {
			if (!force) {
				if (!Lifecycle.dispatch(element, instance, props, state, context, Enum.shouldComponentUpdate)) {
					return
				}
			}
		}
	} finally {
		if (element !== snapshot) {
			if (Lifecycle.has(instance, Enum.getDerivedState)) {
				Lifecycle.dispatch(element, instance, props, state, context, Enum.getDerivedState)
			}
		}

		instance.props = props
		instance.state = state
		instance.context = context
	}

	if (Lifecycle.has(instance, Enum.getChildContext)) {
		Lifecycle.dispatch(element, instance, props, state, context, Enum.getChildContext)
	}

	Reconcile.children(fiber, element, parent, children, [Lifecycle.render(instance, props, state, context, children)])

	if (Lifecycle.has(instance, Enum.componentDidUpdate)) {
		Schedule.enqueue(fiber, element, instance, _props, _state, _context, Enum.componentDidUpdate)
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @return {object}
 */
export function destroy (fiber, element) {
	var instance = element.instance

	if (Lifecycle.has(instance, Enum.componentWillUnmount)) {
		Lifecycle.dispatch(element, instance, instance.props, instance.state, instance.context, Enum.componentWillUnmount)
	}

	return Node.destroy(fiber, Element.pick(element))
}
