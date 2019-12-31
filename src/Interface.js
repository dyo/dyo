import * as Enum from './Enum.js'
import * as Utility from './Utility.js'

/**
 * @constructor
 */
export var struct = Utility.extend(function document () {
	this.nodeValue = ''
	this.textContent = null
	this.ownerDocument = undefined
	this.documentElement = this
}, {
	querySelector: {value: self},
	createElement: {value: self},
	createElementNS: {value: self},
	createTextNode: {value: self},
	createDocumentFragment: {value: self},
	removeChild: {value: self},
	appendChild: {value: self},
	insertBefore: {value: self},
	addEventListener: {value: self},
	setAttribute: {value: self},
	removeAttribute: {value: self},
	style: {value: {setProperty: self}}
}, null)

/**
 * @type {object}
 */
export var frame = new struct()

/**
 * @return {object}
 */
export function peek () {
	return frame
}

/**
 * @return {object}
 */
export function self () {
	return this
}

/**
 * @param {number} identity
 * @param {(string|number|object)} type
 * @param {object} children
 * @param {string?} context
 * @param {object} owner
 * @return {object}
 */
export function create (identity, type, children, context, owner) {
	switch (identity) {
		case Enum.element:
			return context ? owner.createElementNS(context, type) : owner.createElement(type)
		case Enum.text:
			return owner.createTextNode(children)
		case Enum.portal: case Enum.empty:
			return owner.createTextNode('')
		case Enum.target:
			return target(type, owner)
	}

	return owner.createDocumentFragment()
}

/**
 * @param {object?} value
 * @param {object?} owner
 * @return {object}
 */
export function target (value, owner) {
	if (value !== null) {
		switch (typeof value) {
			case 'object':
				return container(value, owner)
			case 'undefined':
				return target(':root', owner)
			case 'string':
				return selector(value, owner || enviroment())
		}
	}

	Utility.throws(Utility.error('Invalid Target!'))
}

/**
 * @param {object?} value
 * @param {object?} owner
 * @return {object}
 */
export function selector (value, owner) {
	return target(owner.querySelector(value), owner)
}

/**
 * @param {object?} value
 * @param {object?} owner
 * @return {object}
 */
export function container (value, owner) {
	return value.ownerDocument === undefined ? owner === undefined ? value : frame : value.documentElement || value
}

/**
 * @return {object}
 */
export function enviroment () {
	return typeof document === 'object' ? document : frame
}

/**
 * @param {object} value
 * @return {object?}
 */
export function owner (value) {
	return value.ownerDocument || null
}

/**
 * @param {object} parent
 * @param {object} target
 */
export function register (parent, target) {
	return frame === target ? null : target[Enum.identifier] = parent
}

/**
 * @param {object} parent
 */
export function initialize (parent) {
	return parent.textContent = null
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function remove (parent, element) {
	parent.removeChild(element)
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	parent.appendChild(element)
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	parent.insertBefore(element, sibling)
}

/**
 * @param {object} parent
 * @param {any} value
 */
export function content (parent, value) {
	parent.nodeValue = value
}

/**
 * @param {object} name
 * @param {string} value
 * @return {string}
 */
export function context (name, value) {
	switch (name) {
		case 'svg':
			return 'http://www.w3.org/2000/svg'
		case 'math':
			return 'http://www.w3.org/1998/Math/MathML'
		case 'foreignObject':
			return ''
	}

	return value
}

/**
 * @param {string} name
 * @param {any} value
 * @param {object} instance
 * @param {object} current
 * @param {boolean} active
 */
export function properties (name, value, instance, current, active) {
	switch (name) {
		case 'style':
			return typeof value === 'object' ? stylesheet(name, value, instance[name]) : attribute(name, value, instance)
		case 'innerHTML':
			current.key += value
	}

	switch (typeof value) {
		case 'object': case 'function':
			if (valid(name)) {
				return event(name.substr(2).toLowerCase(), value, instance, current, current.state ? current.state : current.state = {})
			}
	}

	property(name, value, instance, instance[name], active)
}

/**
 * @param {string} name
 * @param {any} value
 * @param {object} instance
 * @param {any} current
 * @param {boolean} active
 */
export function property (name, value, instance, current, active) {
	if (current === undefined) {
		attribute(name, value, instance)
	} else {
		switch (value) {
			case false: case null: case undefined:
				switch (typeof current) {
					case 'string':
						return property(name, '', instance, active)
					case 'boolean':
						value = false
				}
		}

		if (active) {
			if (value === current) {
				return
			}
		}

		try {
			instance[name] = value
		} catch (error) {
			attribute(name, value, instance)
		}
	}
}

/**
 * @param {string} name
 * @param {any} value
 * @param {object} instance
 */
export function attribute (name, value, instance) {
	switch (value) {
		case false: case null: case undefined:
			return instance.removeAttribute(name)
		case true:
			value = name
	}

	instance.setAttribute(name, value)
}

/**
 * @param {string} name
 * @param {*} value
 * @param {object} instance
 */
export function stylesheet (name, value, instance) {
	if (value !== null) {
		for (var key in value) {
			declaration(key, value[key], instance)
		}
	}
}

/**
 * @param {string} name
 * @param {any} value
 * @param {object} instance
 */
export function declaration (name, value, instance) {
	switch (value) {
		case false: case null: case undefined:
			value = ''
	}

	if (name in instance) {
		instance[name] = value
	} else {
		instance.setProperty(name, value)
	}
}

/**
 * @param {string} name
 * @param {string} value
 * @param {object} instance
 * @param {object} current
 * @param {object} state
 */
export function event (name, value, instance, current, state) {
	try {
		if (state[name] == null) {
			instance.addEventListener(name, current, false)
		} else if (value == null) {
			instance.removeEventListener(name, current, false)
		}
	} finally {
		state[name] = value
	}
}

/**
 * @param {string} name
 * @return {boolean}
 */
export function valid (name) {
	return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110
}

/**
 * @param {string} name
 * @return {function}
 */
export function callback (name) {
	return function (instance) { instance[name]() }
}
