import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'

/**
 * @param {object} element
 * @param {number} origin
 * @return {object?}
 */
export function create (element, origin) {
	if (origin < Enum.create) {
		return search(element, origin)
	}

	switch (element.constructor) {
		case Enum.thenable:
		case Enum.fragment:
			return document.createDocumentFragment()
		case Enum.node:
			if (Element.get(element, Enum.context)) {
				return document.createElementNS(Element.get(element, Enum.context), element.type)
			} else {
				return document.createElement(element.type)
			}
		case Enum.text:
		case Enum.empty:
			return document.createTextNode(element.children)
		case Enum.comment:
			return document.createComment(element.children)
		case Enum.portal:
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
	Element.get(parent, Enum.owner).removeChild(Element.get(element, Enum.owner))
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	Element.get(parent, Enum.owner).appendChild(Element.get(element, Enum.owner))
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	Element.get(parent, Enum.owner).insertBefore(Element.get(element, Enum.owner), Element.get(sibling, Enum.owner))
}

/**
 * @param {object} element
 * @param {(string|number)} value
 */
export function content (element, value) {
	Element.get(element, Enum.owner).nodeValue = value
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
 * @param {object} props
 * @param {number} origin
 */
export function props (element, props, origin) {
	switch (origin) {
		case Enum.create:
			switch (element.type) {
				case 'input':
					return Utility.assign({type: null, step: null, min: null, max: null}, props)
				case 'select':
					if (props.defaultValue != null || props.multiple) {
						return Utility.assign({value: props.defaultValue}, props)
					}
			}
		case Enum.update:
			return props
	}
}

/**
 * @param {object} element
 * @param {string} name
 * @param {*} value
 * @param {string} namespace
 * @param {number} origin
 */
export function commit (element, name, value, namespace, origin) {
	switch (name) {
		case 'style':
			return style(element, name, value)
		case 'className':
		case 'class':
			return attribute(element, 'class', value, '')
		case 'xlink:href':
			return attribute(element, name, value, 'http://www.w3.org/1999/xlink')
		case 'xmlns':
			return
		case 'innerHTML':
			return html(element, name, value ? value : '', [])
		case 'dangerouslySetInnerHTML':
			return commit(element, 'innerHTML', value && value.__html, namespace, origin)
		case 'acceptCharset':
			return commit(element, 'accept-charset', value, namespace, origin)
		case 'httpEquiv':
			return commit(element, 'http-equiv', value, namespace, origin)
		case 'tabIndex':
			return commit(element, name.toLowerCase(), value, namespace, origin)
		case 'autofocus':
		case 'autoFocus':
			return Element.get(element, Enum.owner)[value ? 'focus' : 'blur']()
		case 'width':
		case 'height':
			return attribute(element, name, value, '')
		case 'form':
			if (element.type === 'input') {
				return attribute(element, name, value, '')
			}
			break
		case 'defaultValue':
			if (element.type === 'select') {
				return
			}
			break
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
			if (namespace || !(name in Element.get(element, Enum.owner))) {
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
	return Element.get(element, Enum.state)[event.type]
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
	if (!Element.get(element, Enum.state)) {
		Element.set(element, Enum.state, {})
	}

	if (!Element.get(element, Enum.state)[name]) {
		Element.get(element, Enum.owner).addEventListener(name, element, false)
	}

	Element.get(element, Enum.state)[name] = value
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
			return attribute(element, name, value, Element.get(element, Enum.owner)[name] = '')
		default:
			Element.get(element, Enum.owner)[name] = value
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
				Element.get(element, Enum.owner).removeAttributeNS(namespace, name)
			}

			return Element.get(element, Enum.owner).removeAttribute(name)
		case true:
			return attribute(element, name, '', namespace)
		default:
			if (!namespace) {
				Element.get(element, Enum.owner).setAttribute(name, value)
			} else {
				Element.get(element, Enum.owner).setAttributeNS(namespace, name, value)
			}
	}
}

/**
 * @param {object} element
 * @param {string} name
 * @param {(string|object)} value
 */
function style (element, name, value) {
	if (typeof value !== 'object') {
		attribute(element, name, value, '')
	} else {
		for (var key in value) {
			if (key.indexOf('-') === -1) {
				Element.get(element, Enum.owner).style[key] = value[key] !== false && value[key] !== undefined ? value[key] : ''
			} else {
				Element.get(element, Enum.owner).style.setProperty(key, value[key])
			}
		}
	}
}

/**
 * @param {object} element
 * @param {string} name
 * @param {*} value
 * @param {Array} nodes
 */
function html (element, name, value, nodes) {
	if (Element.get(element, Enum.owner)[name]) {
		element.children.forEach(function (element) {
			nodes.push(Element.get(element, Enum.owner))
		})
	}

	if (Element.get(element, Enum.owner)[name] = value) {
		nodes.push.apply(nodes, Element.get(element, Enum.owner).childNodes)
	}

	nodes.forEach(function (node) {
		Element.get(element, Enum.owner).appendChild(node)
	})
}

/**
 * @param {object} element
 * @return {object?}
 */
function search () {
}
