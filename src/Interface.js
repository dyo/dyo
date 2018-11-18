import * as Enum from './Enum.js'

import Registry from './Registry.js'

/**
 * @param {object} owner
 * @param {number} uid
 * @param {*} type
 * @param {object} children
 * @param {*} context
 * @return {object}
 */
export function create (owner, uid, type, children, context) {
	switch (uid) {
		case Enum.element:
			return context ? owner.createElementNS(context, type) : owner.createElement(type)
		case Enum.text:
			return owner.createTextNode(children)
		case Enum.portal: case Enum.empty:
			return owner.createTextNode('')
		case Enum.comment:
			return owner.createComment(children)
		case Enum.thenable: case Enum.fragment:
			return owner.createDocumentFragment()
		case Enum.target:
			return target(type, owner)
	}
}

/**
 * @param {object} value
 * @param {object?} owner
 * @return {object}
 */
export function target (value, owner) {
	if (owner) {
		if (value) {
			if (typeof value === 'string') {
				return target(owner.querySelector(value), owner)
			} else {
				return value.nodeType === owner.nodeType ? target(value.documentElement, owner) : value
			}
		} else {
			return target(owner, owner)
		}
	} else {
		return target(value, from(document))
	}
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
 * @param {object} element
 * @param {string} name
 * @param {*} value
 * @param {object} instance
 */
export function props (element, name, value, instance) {
	if (name === 'style') {
		stylesheet(name, value || false, instance)
	} else {
		switch (typeof value) {
			case 'object': case 'function':
				if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110) {
					return handler(element, name.substr(2).toLowerCase(), value, instance)
				}
		}

		if (name in instance) {
			switch (name) {
				case 'width': case 'height':
					break
				default:
					return property(name, value, instance)
			}
		}

		attribute(name, value, instance)
	}
}

/**
 * @param {string} name
 * @param {*} value
 * @param {object} instance
 */
export function property (name, value, instance) {
	try {
		switch (instance[name] = value) {
			case false: case null: case undefined:
				return attribute(name, value, instance)
		}
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
	if (typeof value === 'object') {
		for (var key in value) {
			declaration(key, value[key], instance[name])
		}
	} else {
		attribute(name, value, instance)
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
 * @param {object} element
 * @param {string} name
 * @param {string} value
 * @param {object} instance
 */
export function handler (element, name, value, instance) {
	if (!Registry.has(instance)) {
		Registry.set(instance, {})
	}

	if (!Registry.get(instance)[name]) {
		instance.addEventListener(name, element, false)
	}

	Registry.get(instance)[name] = value
}

/**
 * @param {object} value
 * @param {object} instance
 */
export function event (value, instance) {
	return Registry.get(instance)[value.type]
}
