import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'

/**
 * @param {object} element
 * @param {number} index
 * @return {object?}
 */
export function create (element, index) {
	if (index < Enum.update) {
		return search(element, index)
	}

	switch (element.uid) {
		case Enum.thenable:
		case Enum.fragment:
			return document.createDocumentFragment()
		case Enum.node:
			if (element.context) {
				return document.createElementNS(element.context, element.type)
			} else {
				return document.createElement(element.type)
			}
		case Enum.text:
			return document.createTextNode(element.children)
		case Enum.portal:
		case Enum.empty:
			return document.createTextNode('')
		case Enum.comment:
			return document.createComment(element.children)
		case Enum.target:
			return target(element.type)
	}
}

/**
 * @param {object} value
 * @return {object}
 */
export function target (value) {
	if (value) {
		if (typeof value === 'string') {
			return target(document.querySelector(value))
		} else if (value.DOCUMENT_FRAGMENT_NODE === 11) {
			return value
		} else {
			Utility.invariant('Invalid target!')
		}
	} else {
		return document.documentElement
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function remove (parent, element) {
	parent.owner.removeChild(element.owner)
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	parent.owner.appendChild(element.owner)
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	parent.owner.insertBefore(element.owner, sibling.owner)
}

/**
 * @param {object} element
 * @param {(string|number)} value
 */
export function content (element, value) {
	element.owner.nodeValue = value
}

/**
 * @param {object} element
 * @param {object} target
 * @return {object}
 */
export function prepare (element, target) {
	return target.textContent = '', element
}

/**
 * @param {object} element
 * @param {string} namespace
 */
export function context (element, namespace) {
	switch (element.type) {
		case 'svg':
			return 'http://www.w3.org/2000/svg'
		case 'math':
			return 'http://www.w3.org/1998/Math/MathML'
		case 'foreignObject':
			return ''
		default:
			return namespace
	}
}

/**
 * @param {object} element
 * @param {object} value
 * @param {boolean} origin
 */
export function props (element, value, origin) {
	if (origin) {
		switch (element.type) {
			case 'input':
				return Utility.assign({type: null, step: null, min: null, max: null}, value)
			case 'select':
				if (value.defaultValue != null || value.multiple) {
					return Utility.assign({value: value.defaultValue}, value)
				}
		}
	}

	return value
}

/**
 * @param {object} element
 * @param {string} name
 * @param {*} value
 * @param {string} namespace
 */
export function update (element, name, value, namespace) {
	switch (name) {
		case 'style':
			return style(element, name, value || false)
		case 'className':
		case 'class':
			return attribute(element, 'class', value, '')
		case 'xlink:href':
			return attribute(element, name, value, 'http://www.w3.org/1999/xlink')
		case 'width':
		case 'height':
			return attribute(element, name, value, '')
		case 'xmlns':
			return
		case 'innerHTML':
			return html(element, name, value ? value : '', [])
	}

	switch (typeof value) {
		case 'function':
		case 'object':
			if (name.substr(0, 2) === 'on' && name.length > 4) {
				return listen(element, name.substring(2).toLowerCase(), value)
			} else {
				return property(element, name, value && element.props[name])
			}
		case 'string':
		case 'number':
		case 'boolean':
			if (namespace || !(name in element.owner)) {
				return attribute(element, name, value, '')
			}
		default:
			property(element, name, value)
	}
}

/**
 * @param {object} element
 * @param {object} value
 */
export function event (element, event) {
	return element.state[event.type]
}

/**
 * Helpers --------------------------------------------------------------------
 */

/**
 * @param {object} element
 * @param {string} name
 * @param {string} value
 */
function listen (element, name, value) {
	if (!element.state) {
		element.state = {}
	}
	if (!element.state[name]) {
		element.owner.addEventListener(name, element, false)
	}

	element.state[name] = value
}

/**
 * @param {object} element
 * @param {string} name
 * @param {*} value
 */
function property (element, name, value) {
	switch (value) {
		case null:
		case false:
		case undefined:
			return attribute(element, name, value, element.owner[name] = '')
		default:
			element.owner[name] = value
	}
}

/**
 * @param {object} element
 * @param {string} name
 * @param {*} value
 * @param {string} namespace
 */
function attribute (element, name, value, namespace) {
	switch (value) {
		case null:
		case false:
		case undefined:
			if (namespace) {
				element.owner.removeAttributeNS(namespace, name)
			}

			return element.owner.removeAttribute(name)
		case true:
			return attribute(element, name, '', namespace)
		default:
			if (!namespace) {
				element.owner.setAttribute(name, value)
			} else {
				element.owner.setAttributeNS(namespace, name, value)
			}
	}
}

/**
 * @param {object} element
 * @param {string} name
 * @param {(string|object)} value
 */
function style (element, name, value) {
	if (typeof value === 'object') {
		for (var key in value) {
			if (key.indexOf('-') === -1) {
				element.owner.style[key] = value[key] !== false && value[key] !== undefined ? value[key] : ''
			} else {
				element.owner.style.setProperty(key, value[key])
			}
		}
	} else {
		attribute(element, name, value, '')
	}
}

/**
 * @param {object} element
 * @param {string} name
 * @param {*} value
 * @param {Array} nodes
 */
function html (element, name, value, nodes) {
	if (element.owner[name]) {
		element.children.forEach(function (element) {
			nodes.push(element.owner)
		})
	}

	if (element.owner[name] = value) {
		nodes.push.apply(nodes, element.owner.childNodes)
	}

	nodes.forEach(function (node) {
		element.owner.appendChild(node)
	})
}

/**
 * @param {object} element
 * @return {object?}
 */
function search () {
}
