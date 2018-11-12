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
 * @return {object}
 */
export function render (props) {
	return props.children
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
		if (prototype.setState) {
			return constructor
		} else if (prototype.render) {
			return Utility.extend(constructor, descriptors)
		}
	}

	if (!Registry.has(constructor)) {
		Registry.set(constructor, Utility.extend(factory(), descriptors, constructor.render = constructor))
	}

	return Registry.get(constructor)
}

/**
 * @param {object} element
 * @param {object} instance
 * @param {(object|function)?} value
 */
export function dispatch (element, instance, value, callback) {
	Schedule.checkout(enqueue, element, instance, value, callback)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} instance
 * @param {(object|function)?} value
 */
export function enqueue (fiber, element, instance, value) {
	if (value) {
		if (Utility.thenable(value)) {
			Utility.resolve(Schedule.suspend(fiber, value), enqueue.bind(null, fiber, element, instance))
		} else {
			Schedule.dispatch(fiber, Enum.component, element, element, element, value)
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
 * @param {object} index
 * @return {object}
 */
export function create (fiber, host, parent, element, index) {
	var type = identity(element.type, element.type.prototype)
	var props = element.props
	var context = element.context = host.context = host.context || {}
	var instance = element.instance = new type(props, context)
	var state = instance.state || {}
	var children = element

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

	children = Node.create(fiber, element, parent, Element.put(element, Lifecycle.render(instance, props, state, context)), index)

	if (Lifecycle.has(instance, Enum.componentDidMount)) {
		Schedule.callback(fiber, element, instance, props, state, context, Enum.componentDidMount)
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
	var instance = element.instance
	var context = element.context = host.context
	var props = element === snapshot ? instance.props : snapshot.props
	var state = instance.state
	var force = value === Enum.obj

	var _props = instance.props
	var _state = state
	var _context = instance.context

	Assert.types(element, context, Enum.contextTypes)

	if (element === snapshot) {
		if (typeof value === 'function') {
			return enqueue(fiber, element, instance, value(props, state, context))
		}
	}

	state = Utility.defaults(!force ? value : {}, state)

	try {
		if (Lifecycle.has(instance, Enum.getDerivedState)) {
			Lifecycle.dispatch(element, instance, props, state, context, Enum.getDerivedState)
		}

		if (Lifecycle.has(instance, Enum.shouldComponentUpdate)) {
			if (!force) {
				if (!Lifecycle.dispatch(element, instance, props, state, context, Enum.shouldComponentUpdate)) {
					return
				}
			}
		}
	} finally {
		instance.props = element.props = props
		instance.state = state
		instance.context = context
	}

	if (Lifecycle.has(instance, Enum.getChildContext)) {
		Lifecycle.dispatch(element, instance, props, state, context, Enum.getChildContext)
	}

	Reconcile.children(fiber, element, parent, element.children, [Lifecycle.render(instance, props, state, context)])

	if (Lifecycle.has(instance, Enum.componentDidUpdate)) {
		Schedule.callback(fiber, element, instance, _props, _state, _context, Enum.componentDidUpdate)
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @return {object}
 */
export function destroy (fiber, element) {
	var instance = element.instance
	var children = Element.pick(element)

	if (Lifecycle.has(instance, Enum.componentWillUnmount)) {
		Lifecycle.dispatch(element, instance, instance.props, instance.state, instance.context, Enum.componentWillUnmount)
	}

	return Node.destroy(fiber, children)
}
