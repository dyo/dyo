import * as Enum from './Enum.js'

import Registry from './Registry.js'

/**
 * @param {object} fiber
 * @param {object} owner
 * @param {object} parent
 * @return {object}
 */
export function iterator (fiber, owner, parent) {
	return fiber.iterator = fiber.iterator || owner.createTreeWalker(parent)
}

/**
 * @param {object} fiber
 * @param {object} owner
 * @param {object} parent
 * @param {number} pid
 * @param {number} uid
 * @param {*} type
 * @param {object} props
 * @param {object} children
 * @param {*} context
 * @return {object}
 */
export function create (fiber, owner, parent, pid, uid, type, props, children, context, index) {
	if (index > Enum.search) {
		switch (uid) {
			case Enum.node:
				return context ? owner.createElementNS(context, type) : owner.createElement(type)
			case Enum.text:
				return owner.createTextNode(children)
			case Enum.comment:
				return owner.createComment(children)
			case Enum.portal: case Enum.empty:
				return owner.createTextNode('')
			case Enum.thenable: case Enum.fragment:
				return owner.createDocumentFragment()
			case Enum.target:
				return target(type, owner)
		}
	} else {
		return search(fiber, owner, parent, pid, uid, type, props, children, context, index, iterator(fiber, owner, parent))
	}
}

/**
 * @param {object} fiber
 * @param {object} owner
 * @param {object} parent
 * @param {number} pid
 * @param {number} uid
 * @param {*} type
 * @param {object} props
 * @param {object} children
 * @param {object} context
 * @param {object} index
 * @param {*} iterator
 * @return {object}
 */
export function search (fiber, owner, parent, pid, uid, type, props, children, context, index, iterator) {
	var length = children.length
	var instance = iterator.nextNode()

	while (instance = iterator.currentNode) {
		if (type === instance.nodeName.toLowerCase()) {
			if (uid > Enum.node) {
				if (children !== instance.nodeValue) {
					content(instance, children)
				}
			} else if (pid === Enum.target) {
				parent.appendChild(instance)
			}

			return instance
		} else if (uid > Enum.portal) {
			iterator.nextSibling()
			parent.removeChild(instance)
		} else {
			break
		}
	}

	return create(fiber, owner, parent, pid, uid, type, props, children, context, -index, iterator)
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
		return target(value, document['@@document'] || document)
	}
}

/**
 * @param {object} value
 * @return {object}
 */
export function owner (value) {
	return value.ownerDocument
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
 * @param {*} value
 */
export function content (parent, value) {
	parent.nodeValue = value
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
				if (name.substr(0, 2) === 'on') {
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
