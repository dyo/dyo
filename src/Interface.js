import * as Constant from './Constant.js'
import * as Utility from './Utility.js'

/**
 * @param {object} target
 * @return {object}
 */
export function context () {
	return {}
}

/**
 * @param {object} parent
 */
export function prepare (parent) {
	owner(parent).textContent = ''
}

/**
 * @param {object} element
 * @param {string} xmlns
 * @param {number} from
 * @return {object}
 */
export function create (element, xmlns, from) {
	if (from === Constant.create) {
		switch (element.id) {
			case Constant.node:
				if (xmlns) {
					return document.createElementNS(xmlns, element.type)
				} else {
					return document.createElement(element.type)
				}
			case Constant.text:
			case Constant.empty:
				return document.createTextNode(element.children)
			case Constant.comment:
				return document.createComment(element.children)
			case Constant.fragment:
				return document.createDocumentFragment()
			case Constant.portal:
				return target(element.type)
			case Constant.component:
				if (element.type.DOCUMENT_FRAGMENT_NODE === 11) {
					return new element.type()
				}
		}
	} else {
		return search(element) || create(element, xmlns, -from)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function remove (parent, element) {
	owner(parent).removeChild(owner(element))
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	owner(parent).appendChild(owner(element))
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	owner(parent).insertBefore(owner(element), owner(sibling))
}

/**
 * @param {object} element
 * @param {(string|number)} value
 */
export function content (element, value) {
	owner(element).nodeValue = value
}

/**
 * @param {object} value
 * @return {object}
 */
export function target (value) {
	if (value) {
		if (typeof value === 'string') {
			return document.querySelector(value)
		} else if (value.DOCUMENT_FRAGMENT_NODE === 11) {
			return value
		} else {
			throw Error('Invalid target!')
		}
	} else {
		return document.documentElement
	}
}

/**
 * @param {object} element
 * @param {string} value
 */
export function xmlns (element, xmlns) {
	switch (element.type) {
		case 'svg':
			return 'http://www.w3.org/2000/svg'
		case 'math':
			return 'http://www.w3.org/1998/Math/MathML'
		case 'foreignObject':
			return ''
		default:
			return xmlns
	}
}

/**
 * @param {object} element
 * @param {object} props
 * @param {number} from
 */
export function props (element, props, from) {
	switch (from) {
		case Constant.create:
			switch (element.type) {
				case 'input':
					return Utility.assign({type: null, step: null, min: null, max: null}, props)
				case 'select':
					if (props.defaultValue != null || props.multiple) {
						return Utility.assign({value: props.defaultValue}, props)
					}
			}
		case Constant.update:
			return props
	}
}

/**
 * @param {object} element
 * @param {string} name
 * @param {*} value
 * @param {string} xmlns
 * @param {number} from
 */
export function commit (element, name, value, xmlns, from) {
	switch (name) {
		case 'style':
			return style(element, name, value)
		case 'className':
			if (!xmlns && value) {
				return property(element, name, value)
			}
		case 'class':
			return attribute(element, 'class', value, '')
		case 'xlink:href':
			return attribute(element, name, value, 'http://www.w3.org/1999/xlink')
		case 'innerHTML':
			return html(element, name, value ? value : '', [])
		case 'dangerouslySetInnerHTML':
			return commit(element, 'innerHTML', value && value.__html, xmlns, from)
		case 'acceptCharset':
			return commit(element, 'accept-charset', value, xmlns, from)
		case 'httpEquiv':
			return commit(element, 'http-equiv', value, xmlns, from)
		case 'tabIndex':
			return commit(element, name.toLowerCase(), value, xmlns, from)
		case 'autofocus':
		case 'autoFocus':
			return owner(element)[value ? 'focus' : 'blur']()
		case 'defaultValue':
			if (element.type === 'select') {
				return
			}
			break
		case 'width':
		case 'height':
			if (element.type === 'img') {
				return attribute(element, name, value, '')
			}
			break
		case 'form':
			if (element.type === 'input') {
				return attribute(element, name, value, '')
			}
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
			if (xmlns || !(name in owner(element))) {
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
 * @return {object}
 */
export function owner (element) {
	return element.owner
}

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
		owner(element).addEventListener(name, element, false)
	}

	element.state[name] = value
}

/**
 * @param {object} element
 * @return {object?}
 */
function search () {
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
			return attribute(element, name, value, owner(element)[name] = '')
		default:
			owner(element)[name] = value
	}
}

/**
 * @param {object} element
 * @param {string} name
 * @param {*} value
 * @param {string} xmlns
 */
function attribute (element, name, value, xmlns) {
	switch (value) {
		case null:
		case false:
		case undefined:
			if (xmlns) {
				owner(element).removeAttributeNS(xmlns, name)
			}

			return owner(element).removeAttribute(name)
		case true:
			return attribute(element, name, '', xmlns)
		default:
			if (!xmlns) {
				owner(element).setAttribute(name, value)
			} else {
				owner(element).setAttributeNS(xmlns, name, value)
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
				owner(element).style[key] = value[key] !== false && value[key] !== undefined ? value[key] : ''
			} else {
				owner(element).style.setProperty(key, value[key])
			}
		}
	}
}

/**
 * @param {object} element
 * @param {string} name
 * @param {*} value
 * @param {Array<object>} nodes
 */
function html (element, name, value, nodes) {
	if (owner(element)[name]) {
		element.children.forEach(function (element) {
			nodes.push(owner(element))
		})
	}

	if (owner(element)[name] = value) {
		nodes.push.apply(nodes, owner(element).childNodes)
	}

	nodes.forEach(function (node) {
		owner(element).appendChild(node)
	})
}
