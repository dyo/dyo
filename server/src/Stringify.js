import * as Dyo from '../../index.js'

/**
 * @param {object} value
 * @return {string}
 */
export function element (value) {
	var children = value.children

	if (typeof children === 'object') {
		var type = value.type

		if (typeof type === 'string') {
			var props = properties(value.props, children)

			switch (type) {
				case 'area': case 'base': case 'br': case 'meta': case 'source': case 'keygen':
				case 'img': case 'col': case 'embed': case 'wbr': case 'track': case 'param':
				case 'link': case 'input': case 'hr': case '!doctype':
					return '<' + type + props + '/>'
			}

			return '<' + type + props + '>' + fragment(children) + '</' + type + '>'
		}
	} else {
		return children
	}

	return fragment(children)
}

/**
 * @param {object} children
 * @return {string}
 */
export function fragment (children) {
	var payload = ''

	for (var i = 0; i < children.length; i++) {
		payload += element(children[i])
	}

	return payload
}

/**
 * @param {object} props
 * @param {object} children
 * @return {string}
 */
export function properties (props, children) {
	var payload = ''

	for (var key in props) {
		payload += property(key, props[key], children)
	}

	return payload
}

/**
 * @param {string} name
 * @param {*} value
 * @param {object} children
 * @return {string}
 */
export function property (name, value, children) {
	var payload = value

	switch (name) {
		case 'className':
			return property('class', value, children)
		case 'innerHTML':
			children.splice(0, children.length, Dyo.createElement([], value))
		case 'ref': case 'key':
			return ''
		case 'style':
			if (value !== null && typeof value === 'object') {
				payload = style(value)
			}
	}

	switch (payload) {
		case false: case null: case undefined:
			return ''
		case true:
			payload = name
	}

	switch (typeof payload) {
		case 'object': case 'function':
			return ''
	}

	return ' ' + name + '="' + payload + '"'
}

/**
 * @param {object} value
 * @return {string}
 */
export function style (value) {
	var payload = ''

	for (var key in value) {
		payload += key.replace(/([A-Z])/, '-$1').toLowerCase() + ': ' + value[key] + ';'
	}

	return payload
}
