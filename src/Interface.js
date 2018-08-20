import * as Constant from './Constant.js'

export function prepare (target, registry) {
	target.textContent = ''
}

export function create (element, xmlns, from) {
	if (from === Constant.search) {
		return search(element, index) || create(element, xmlns, -from)
	} else {
		switch (element.uuid) {
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
			case Constant.portal:
				return target(element.type)
			case Constant.fragment:
				return document.createDocumentFragment()
		}
	}

	return element.owner
}

export function remove (parent, element) {
	parent.owner.removeChild(element.owner)
}

export function append (parent, element) {
	parent.owner.appendChild(element.owner)
}

export function insert (parent, element, sibling) {
	parent.owner.insertBefore(element.owner, sibling.owner)
}

export function content (element, value) {
	element.owner.nodeValue = value
}

export function valid (value, type) {
	switch (type) {
		case Constant.event:
			return value.BUBBLING_PHASE === 3
		case Constant.owner:
		case Constant.component:
			return value.ELEMENT_NODE === 1
	}
}

export function owner (value) {
	return value
}

export function target (value) {
	if (value) {
		return typeof value === 'string' ? document.querySelector(value) : value
	} else {
		return document.documentElement
	}
}

export function namespace (element, xmlns) {
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

export function event (element, event) {
	return element.state[event.type]
}

export function props (element, props, from) {
	switch (from) {
		case Constant.update:
			switch (element.type) {
				case 'input':
					return merge({type: null, step: null, min: null, max: null}, props)
				case 'select':
					if (props.defaultValue != null || props.multiple) {
						return Utility.assign({value: props.defaultValue}, props)
					}
			}
		case Constant.create:
			return props
	}
}

export function commit (element, name, value, xmlns, from) {
	switch (name) {
		case 'style':

			break
		case 'className':
			if (!xmlns && value) {
				return property(element, name, value)
			}
		case 'class':
			return attribute(element, 'class', value, '')
		case 'xlink:href':
			return attribute()(element, name, value, 'http://www.w3.org/1999/xlink')
		case 'innerHTML':
			return html(element, name, value ? value : '', [])
		case 'dangerouslySetInnerHTML':
			return commit(element, 'innerHTML', value && value.__html, xmlns, signature)
		case 'acceptCharset':
			return commit(element, 'accept-charset', value, xmlns, signature)
		case 'httpEquiv':
			return commit(element, 'http-equiv', value, xmlns, signature)
		case 'tabIndex':
			return commit(element, name.toLowerCase(), value, xmlns, signature)
		case 'autofocus':
		case 'autoFocus':
			return element.owner[value ? 'focus' : 'blur']()
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
			break
	}

	if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 2) {
		if (element.state[name]) {
			element.state[name] = value
		} else {
			element.owner.addEventListener(name.substring(2).toLowerCase(), element, false)
		}
	} else {
		switch (typeof value) {
			case 'object':
				return property(element, name, value && element.props[name])
			case 'string':
			case 'number':
			case 'boolean':
				if (xmlns || !(name in element.owner)) {
					return attribute(element, name, value, '')
				}
			default:
				property(element, name, value)
		}
	}
}

/**
 * Helpers --------------------------------------------------------------------
 */

function query () {

}

/**
 * @param {Element} element
 * @param {string} name
 * @param {any} value
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
 * @param {Element} element
 * @param {string} name
 * @param {any} value
 * @param {string?} xmlns
 */
function attribute (element, name, value, xmlns) {
	switch (value) {
		case null:
		case false:
		case undefined:
			if (xmlns) {
				element.owner.removeAttributeNS(xmlns, name)
			}

			return element.owner.removeAttribute(name)
		case true:
			return attribute(element, name, '', xmlns)
		default:
			if (!xmlns) {
				element.owner.setAttribute(name, value)
			} else {
				element.owner.setAttributeNS(xmlns, name, value)
			}
	}
}

export function style (element, name, value) {
	if (typeof value !== 'object') {
		attribute(element, name, value, '')
	} else {
		for (var key in value) {
			if (key.indexOf('-') === -1) {
				element.owner.style[key] = value[key] !== false && value[key] !== undefined ? value[key] : ''
			} else {
				element.owner.style.setProperty(key, value[key])
			}
		}
	}
}

function html (element, name, value, nodes) {
	if (element.owner[name])
		element.children.forEach(function (children) {
			nodes.push(children.owner)
		})

	if (element.owner[name] = value) {
		nodes.push.apply(nodes, element.owner.childNodes)
	}

	nodes.forEach(function (node) {
		element.owner.appendChild(node)
	})
}
