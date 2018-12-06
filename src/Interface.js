import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Registry from './Registry.js'

/**
 * @type {object}
 */
export var defaults = {
	createElement: owner,
	createElementNS: owner,
	createTextNode: owner,
	createDocumentFragment: owner,
	removeChild: owner,
	appendChild: owner,
	insertBefore: owner,
	addEventListener: owner,
	setAttribute: owner,
	removeAttribute: owner,
	style: {setProperty: owner}
}

/**
 * @return {*}
 */
export function owner () {
	return defaults
}

/**
 * @param {number} uid
 * @param {*} type
 * @param {object} children
 * @param {*} context
 * @return {object}
 * @param {object} owner
 */
export function create (uid, type, children, context, owner) {
	switch (uid) {
		case Enum.element:
			return context ? owner.createElementNS(context, type) : owner.createElement(type)
		case Enum.text:
			return owner.createTextNode(children)
		case Enum.portal: case Enum.empty:
			return owner.createTextNode('')
		case Enum.thenable: case Enum.fragment:
			return owner.createDocumentFragment()
		case Enum.target:
			return target(type, owner)
	}
}

/**
 * @param {*} value
 * @param {object?} owner
 * @return {object}
 */
export function target (value, owner) {
	if (value) {
		if (typeof value === 'object') {
			switch (value.ownerDocument) {
				case undefined:
					return owner === null ? value[0] || (value[0] = defaults) : value
				case null:
					return value.documentElement
				default:
					return value
			}
		} else if (owner) {
			return target(owner.querySelector(value), owner)
		} else if (typeof document === 'object') {
			return target(value, document)
		} else {
			return target({}, owner)
		}
	}

	Utility.invariant('Invalid target!')
}

/**
 * @param {object} value
 * @return {object}
 */
export function from (value) {
	return value.ownerDocument || value
}

/**
 * @param {string} value
 * @param {object} type
 */
export function context (value, type) {
	switch (type) {
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
 * @param {object} parent
 * @return {object}
 */
export function clear (parent) {
	parent.textContent = ''
}

/**
 * @param {object} parent
 * @param {*} value
 */
export function content (parent, value) {
	parent.nodeValue = value
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
 * @param {string} name
 * @param {*} value
 * @param {object} instance
 */
export function props (name, value, instance, handler) {
	if (name === 'style') {
		if (typeof value === 'object') {
			if (value) {
				return stylesheet(name, value, instance[name])
			}
		}
	} else {
		switch (typeof value) {
			case 'object': case 'function':
				if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110) {
					return events(name.substr(2).toLowerCase(), value, instance, handler)
				}
		}

		if (name in instance) {
			return property(name, value, instance)
		}
	}

	attribute(name, value, instance)
}

/**
 * @param {string} name
 * @param {*} value
 * @param {object} instance
 */
export function property (name, value, instance) {
	try {
		switch (value) {
			case false: case null: case undefined:
				if (typeof instance[name] === 'string') {
					return property(name, '', instance)
				}
		}

		instance[name] = value
	} catch (error) {
		attribute(name, value, instance)
	}
}

/**
 * @param {string} name
 * @param {*} value
 * @param {object} instance
 */
export function attribute (name, value, instance) {
	switch (value) {
		case true:
			return attribute(name, name, instance)
		case false: case null: case undefined:
			return instance.removeAttribute(name)
	}

	instance.setAttribute(name, value)
}

/**
 * @param {string} name
 * @param {*} value
 * @param {object} instance
 */
export function stylesheet (name, value, instance) {
	for (var key in value) {
		declaration(key, value[key], instance)
	}
}

/**
 * @param {string} name
 * @param {*} value
 * @param {object} instance
 */
export function declaration (name, value, instance) {
	switch (value) {
		case false: case null: case undefined:
			return declaration(name, '', instance)
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
 * @param {object} handler
 */
export function events (name, value, instance, handler) {
	var handlers = Registry.get(instance)

	if (!handlers) {
		Registry.set(instance, handlers = {})
	}

	if (!handlers[name]) {
		instance.addEventListener(name, handler, false)
	}

	handlers[name] = value
}

/**
 * @param {object} value
 * @param {object} instance
 */
export function event (value, instance) {
	return Registry.get(instance)[value.type]
}
