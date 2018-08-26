import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'
import * as Reconcile from './Reconcile.js'
import * as Commit from './Commit.js'
import * as Schedule from './Schedule.js'

import Registry from './Registry.js'

/**
 * @type {object}
 */
export var descriptors = {
	/**
	 * @param {function} callback
	 */
	forceUpdate: {
		value: function (callback) {
			resolve(Registry.get(this), this, Constant.force, callback, Constant.force)
		}
	},
	/**
	 * @param {object} state
	 * @param {function} callback
	 */
	setState: {
		value: function (state, callback) {
			resolve(Registry.get(this), this, state, callback, Constant.state)
		}
	}
}

/**
 * @constructor
 */
export var construct = Utility.extend(factory(), descriptors, Utility.define({}, Constant.render, {
	/**
	 * @param {object} props
	 */
	value: function (props) {
		return props.children
	}
}))

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
}, construct.prototype)

/**
 * @return {function}
 */
export function factory () {
	return function (props) {
		this.refs = {}
		this.state = {}
		this.props = props
	}
}

/**
 * @param {*} value
 * @param {object} description
 * @return {object}
 */
export function describe (value, description) {
	for (var key in value) {
		switch (key) {
			case Constant.render:
			case Constant.getInitialState:
			case Constant.shouldComponentUpdate:
			case Constant.componentDidCatch:
			case Constant.componentDidMount:
			case Constant.componentDidUpdate:
			case Constant.componentWillMount:
			case Constant.componentWillUpdate:
			case Constant.componentWillUnmount:
				description[key] = {value: value[key], enumerable: false}
			case Constant.displayName:
			case Constant.defaultProps:
			case Constant.propTypes:
				break
			default:
				description[key] = {value: value[key], enumerable: typeof value === 'function'}
		}
	}

	return description
}

/**
 * @param {function} type
 * @param {object?} proto
 * @return {function}
 */
export function identity (type, proto) {
	if (proto) {
		if (typeof proto[Constant.setState] === 'function') {
			return type
		} else if (proto[Constant.render]) {
			try {
				return type
			} finally {
				for (var key in descriptors) {
					proto[key] = descriptors[key]
				}
			}
		}
	}

	if (!Registry.has(type)) {
		Registry.set(type, Utility.extend(factory(), describe(type, {render: type})))
	}

	return Registry.get(type)
}

/**
 * @param {object} element
 * @param {object} owner
 * @param {(object|function)} payload
 * @param {function?} callback
 */
export function resolve (element, owner, payload, callback) {
	if (payload) {
		if (element) {
			switch (typeof payload) {
				case 'function':
					return resolve(element, owner, Lifecycle.callback(owner, payload), callback)
				default:
					if (Utility.thenable(payload)) {
						return Utility.resolve(payload, function (payload) {
							resolve(element, owner, payload, callback)
						}, function (error) {
							Exception.create(element, error)
						})
					} else if (element.active < Constant.active) {
						Utility.assign(owner.state, payload)
					} else if (element.active > Constant.active) {
						Utility.assign(element.state, payload)
					} else {
						update(Constant.pid, element, element, payload)
					}
			}
		} else {
			owner.state = payload
		}

		if (callback) {
			Lifecycle.callback(owner, callback)
		}
	}
}





/**
 * @param {object} element
 * @return {object}
 */
export function mount (element) {
	var type = element.type
	var props = element.props
	var owner = element.owner = Lifecycle.construct(type = identity(type, type.prototype), props)
	var state = owner.state = owner.state || {}
	var children = element.children

	owner.props = props, element.ref = props.ref, Registry.set(owner, element)

	if (owner[Constant.getInitialState]) {
		state = owner.state = Lifecycle.update(element, Constant.getInitialState, props, state) || state
	}

	if (owner[Constant.componentWillMount]) {
		Lifecycle.update(element, Constant.componentWillMount, props, state)
	}

	if (Utility.thenable(state = owner.state)) {
		children = Element.create(Utility.resolve(state, function (value) {
			return Lifecycle.render(owner, props, owner.state = value || {})
		}, function (error) {
			Exception.create(element, error)
		}))
	} else {
		children = Lifecycle.render(owner, props, state)
	}

	return children
}

/**
 * @param {object} element
 */
export function unmount (element) {
	if (element.owner[Constant.componentWillUnmount]) {
		element.state = Lifecycle.mount(element, Constant.componentWillUnmount)
	}
}

/**
 * @param {number} pid
 * @param {object} element
 * @param {object} snapshot
 * @param {object} payload
 */
export function update (pid, element, snapshot, payload) {
	try {
		var child = element
		var owner = element.owner
		var state = element.state = element === snapshot ? Utility.merge(owner.state, payload) : owner.state
		var props = snapshot.props

		if (element.active = Constant.update, owner[Constant.componentWillUpdate]) {
			Lifecycle.update(element, Constant.componentWillUpdate, props, state)
		}

		if (element.active = Constant.active, payload !== Constant.force) {
			if (owner[Constant.shouldComponentUpdate]) {
				if (!Lifecycle.update(element, Constant.shouldComponentUpdate, props, state)) {
					try { return } finally { owner.state = state }
				}
			}
		}

		try {
			element.props = owner.props, element.state = owner.state, owner.props = props, owner.state = state
		} finally {
			Reconcile.children(pid, element.parent, element.children, [child = Lifecycle.render(owner, props, state)], 0)
		}

		finalize(element, child, Constant.update)
	} catch (error) {
		Exception.recover(element, error)
	}
}

/**
 * @param {object} element
 * @param {object} snapshot
 * @param {number} from
 * @param {object}
 */
export function finalize (element, snapshot, from) {
	try {
		return element
	} finally {
		if (snapshot.id === Constant.thenable) {
			snapshot.type.then(function () {
				finalize(element, element, from)
			})
		} else {
			if (from === Constant.create) {
				if (element.owner[Constant.componentDidMount]) {
					Lifecycle.mount(element, Constant.componentDidMount)
				}
			} else if (element.owner[Constant.componentDidUpdate]) {
				Schedule.commit(Constant.pid, Constant.callback, element, function (state, props) {
					Lifecycle.update(this, Constant.componentDidUpdate, props, state)
				}, from)
			}

			if (element.ref !== snapshot.props.ref) {
				Commit.refs(element, element.ref)
			}
		}
	}
}
