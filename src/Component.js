import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'
import * as Commit from './Commit.js'
import * as Registry from './Registry.js'
import * as Interface from './Interface.js'

/**
 * @type {object}
 */
export var descriptors = {
	/**
	 * @type {function}
	 * @param {object} state
	 * @param {function} callback
	 */
	setState: {
		value: function (state, callback) {
			this.enqueue(this[Constant.element], this, state, callback, Constant.state)
		}
	},
	/**
	 * @type {function}
	 * @param {function} callback
	 */
	forceUpdate: {
		value: function (callback) {
			this.enqueue(this[Constant.element], this, Constant.object, callback, Constant.force)
		}
	}
}

/**
 * @constructor
 * @param {object} props
 * @param {object} context
 */
export var constructor = Utility.extend(function component (props, context) {
	this.refs = {}
	this.state = {}
	this.props = props
	this.context = context
}, descriptors)

/**
 * @type {object}
 */
export var prototype = constructor[Constant.prototype]

/**
 * @constructor
 * @param {object} props
 * @param {object} context
 */
export var pure = Utility.extend(function pure (props, context) {
	constructor.call(this, props, context)
}, Utility.assign({
	/**
	 * @type {function}
	 * @param {object} props
	 * @param {object} state
	 * @return {boolean}
	 */
	shouldComponentUpdate: {
		value: function (props, state) {
			return Utility.compare(this.props, props) || Utility.compare(this.state, state)
		}
	}
}, descriptors))

/**
 * @param {object} value
 * @return {function}
 */
export function create (value) {
	return extend(Utility.object(value), function constructor () {
		for (var i = 0, keys = Utility.keys(constructor[Constant.prototype]); i < keys.length; ++i) {
			this[keys[i]] = Utility.bind(this[keys[i]], this)
		}
	})
}

/**
 * @param {object} owner
 * @return {boolean}
 */
export function valid (owner) {
	return typeof owner[Constant.setState] === 'function' && typeof owner[Constant.forceUpdate] === 'function'
}

/**
 * @param {(function|object)} value
 * @param {object} descriptors
 * @return {object}
 */
export function describe (value, descriptors) {
	for (var key in value) {
		switch (key) {
			case Constant.render:
			case Constant.getInitialState:
			case Constant.getChildContext:
			case Constant.getDerivedStateFromProps:
			case Constant.componentDidCatch:
			case Constant.componentDidMount:
			case Constant.componentDidUpdate:
			case Constant.componentWillMount:
			case Constant.componentWillUpdate:
			case Constant.componentWillUnmount:
			case Constant.componentWillReceiveProps:
			case Constant.shouldComponentUpdate:
				descriptors[key] = {value: value[key], writable: true, enumerable: false, configurable: true}
			case Constant.displayName:
			case Constant.defaultProps:
			case Constant.propTypes:
			case Constant.contextTypes:
				break
			default:
				descriptors[key] = {value: value[key], writable: true, enumerable: typeof value === 'function', configurable: true}
		}
	}

	return descriptors
}

/**
 * @param {(function|object)} value
 * @param {function} constructor
 * @return {function}
 */
export function extend (value, constructor) {
	if (value[Constant.memoize]) {
		return value[Constant.memoize]
	} else if (typeof value === 'function') {
		if (typeof value[Constant.render] !== 'function') {
			return extend(value[Constant.render] = value, function () {})
		}
	}

	Utility.define(value, Constant.memoize, {value: Utility.extend(constructor, describe(value, {}), prototype)})

	return constructor
}

/**
 * @param {function} type
 * @param {object?} proto
 * @return {function}
 */
export function identity (type, proto) {
	if (type[Constant.memoize]) {
		return type[Constant.memoize]
	} else if (proto) {
		if (proto[Constant.render]) {
			if (valid(proto)) {
				return type
			} else {
				return Utility.extend(type, Utility.descriptors(type, Constant.prototype), prototype)
			}
		}
	}

	return extend(type)
}

/**
 * @param {object} host
 * @param {object} element
 * @return {object}
 */
export function mount (host, element) {
	var type = element.type
	var props = element.props
	var children = element.children
	var context = host.state = host.state || {}
	var constructor = identity(type, type[Constant.prototype])
	var owner = element.owner = Lifecycle.constructor(element, constructor, props, context)
	var state = owner.state = owner.state || {}

	element.ref = props.ref
	owner.props = props
	owner.context = context
	owner[Constant.element] = element

	if (Lifecycle.has(owner, Constant.getInitialState)) {
		state = owner.state = Lifecycle.update(element, Constant.getInitialState, props, state, context) || state
	}

	if (Lifecycle.has(owner, Constant.componentWillMount)) {
		Lifecycle.update(element, Constant.componentWillMount, props, state, context)
	}

	if (Utility.thenable(state = owner.state)) {
		children = Element.create({then: promise(element, owner, state), catch: Utility.noop})
	} else {
		children = Lifecycle.render(element, owner)
	}

	if (Lifecycle.has(owner, Constant.getChildContext)) {
		element.context = Utility.merge(context, Lifecycle.update(element, Constnat.getChildContext, props, state, context))
	}

	return children
}

/**
 * @param {object} element
 * @param {object} children
 * @param {object}
 */
export function finalize (element, children) {
	try {
		return element
	} finally {
		if (Lifecycle.has(element.owner, Constant.componentDidMount)) {
			Lifecycle.mount(element, Constant.componentDidMount)
		}

		if (element.ref) {
			Commit.refs(element, element.ref)
			console.log(element.ref)
		}
	}
}

/**
 * @param {object} element
 */
export function unmount (element) {
	if (element.state = Lifecycle.has(element.owner, Constant.componentWillUnmount)) {
		if (element.state = Lifecycle.mount(element, Constant.componentWillUnmount)) {
			if (Utility.thenable(element.state)) {
				return element.state.catch(function (err) {
					Exception.raise(element, err, Constant.componentWillUnmount)
				})
			}
		}
	}
}

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {number} from
 */
export function update (host, parent, element, snapshot, payload, from) {
	try {
		var props = snapshot.props
		var owner = element.owner
		var value = owner.props
		var state = owner.state
		var context = owner.context
		var current = element.state = payload !== Constant.object ? Utility.merge(state, payload) : state

		switch (from) {
			case Constant.force:
				break
			case Constant.props:
				if (Lifecycle.has(owner, Constant.componentWillReceiveProps)) {
					Lifecycle.update(element, Constant.componentWillReceiveProps, props, context, current)
				}
			default:
				if (Lifecycle.has(owner, Constant.shouldComponentUpdate)) {
					if (!Lifecycle.update(element, Constant.shouldComponentUpdate, props, current, context)) {
						return void (owner.state = current)
					}
				}
		}

		if (Lifecycle.has(owner, Constant.componentWillUpdate)) {
			Lifecycle.update(element, Constant.componentWillUpdate, props, current, context)
		}

		switch (from) {
			default:
				owner.state = current
			case Constant.force:
				owner.props = props
		}

		if (Lifecycle.has(owner, Constant.getChildContext)) {
			Utility.assign(element.context, Lifecycle.update(element, Constant.getChildContext, props, current, context))
		}

		Reconcile.children(element, parent, element.children, Element.children(Lifecycle.render(element, owner)))

		if (Lifecycle.has(owner, Constant.componentDidUpdate)) {
			Lifecycle.update(element, Constant.componentDidUpdate, value, state, context)
		}
	} catch (err) {
		Exception.raise(element, host, err)
	}
}

/**
 * @param {Element} element
 * @param {object?} value
 * @param {string} from
 */
export function resolve (element, value, from) {
	if (value) {
		switch (typeof value) {
			case 'object':
			case 'function':
				switch (from) {
					case Constant.getInitialState:
					case Constant.getChildContext:
					case Constant.getDerivedStateFromProps:
					case Constant.shouldComponentUpdate:
					case Constant.componentWillUnmount:
						break
					default:
						enqueue(element, element.owner, value, Constant.state)
				}
		}
	}

	return value
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {(object|function)} value
 * @param {function?} callback
 * @param {number} from
 */
export function enqueue (element, owner, value, callback, from) {
	if (value) {
		if (element) {
			switch (typeof value) {
				case 'function':
					return enqueue(element, owner, Lifecycle.callback(element, owner, value), callback, from)
				case 'object':
					if (Utility.thenable(value)) {
						return dequeue(element, owner, value, callback, from)
					} else if (element.active < Constant.active) {
						Utility.assign(owner.state, value)
					} else if (element.active > Constant.active) {
						Utility.assign(element.state, value)
					} else {
						update(element, element, element.parent, element, value, from)
					}
			}
		} else {
			owner.state = value
		}

		if (callback) {
			Lifecycle.callback(element, owner, callback)
		}
	}
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {Promise<object>} value
 * @param {function?} callback
 * @param {number} from
 */
export function dequeue (element, owner, value, callback, from) {
	value.then(function (value) {
		if (Utility.fetchable(Utility.object(value))) {
			enqueue(element, owner, value.json(), callback, from)
		} else {
			enqueue(element, owner, value, callback, from)
		}
	}, function (err) {
		// TODO
		// if (Utility.thenable(element.children.type)) {
		// 	try {
		// 		owner[Constant.exception] = new Exception.constructor(element, err, Constant.setState)
		// 	} finally {
		// 		Lifecycle.callback(element, owner, callback)
		// 	}
		// } else {
		// 	Exception.raise(element, err, Constant.setState)
		// }
	})
}








/**
 * @param {object} element
 * @param {object} owner
 * @param {object} value
 * @return {function}
 */
export function promise (element, owner, value) {
// TODO
// 	return function (resolve, reject) {
// 		queue(element, owner, value, Constant.state, function () {
// 			if (owner[Constant.exception]) {
// 				reject(owner[Constant.exception])
// 			} else {
// 				resolve(element.children.type.then === then && Lifecycle.render(element, owner))
// 			}
// 		})
// 	}
}

/**
 * @param {object} element
 * @param {object} value
 * @return {function}
 */
export function generator (element, value) {
	// TODO
	// return function then (resolve, reject) {
	// 	return value.next(element.state).then(function (next) {
	// 		if (next.done !== true || next.value !== undefined) {
	// 			resolve(element.state = next.value, next.done, then(resolve, reject))
	// 		} else if (element.active < Constant.active) {
	// 			resolve(element.state, next.done)
	// 		}
	// 	}, reject)
	// }
}
