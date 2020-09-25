import * as Enum from './Enum.js'
import * as Element from './Element.js'
import * as Utility from './Utility.js'

/**
 * @param {object} target
 * @param {string} payload
 */
export function serialize (target, payload) {
	if (Utility.callable(target.send)) {
		target.send(payload)
	} else if (Utility.callable(target.end)) {
		target.end(payload)
	} else if (Utility.callable(target.write)) {
		target.write(payload)
	} else {
		target.body = payload
	}
}

/**
 * @param {object} value
 * @return {string}
 */
export function stringify (value) {
	var identity = value.identity
	var children = value.children

	if (identity < Enum.text) {
		switch (identity) {
			case Enum.portal:
				return '<noscript>' + stringify(children[0]) + '</noscript>'
			case Enum.component:
				return stringify(children[0])
			case Enum.element:
				var type = value.type
				var payload = '<' + type + properties(value.props, children) + '>'

				switch (type.toLowerCase()) {
					case 'br': case 'hr': case 'area': case 'base': case 'meta': case 'source': case 'keygen': case 'input':
					case 'img': case 'col': case 'wbr': case 'track': case 'param': case 'embed': case 'link': case '!doctype':
						return payload
					case 'html':
						payload = '<!doctype html>' + payload
				}

				return payload + iterable(children) + '</' + type + '>'
		}

		return iterable(children)
	}

	return children
}

/**
 * @param {any[]} children
 * @return {string}
 */
export function iterable (children) {
	var payload = ''

	for (var i = 0; i < children.length; i++) {
		payload += stringify(children[i])
	}

	return payload
}

/**
 * @param {object} props
 * @param {any[]} children
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
 * @param {any[]} children
 * @return {string}
 */
export function property (name, value, children) {
	var payload = value

	switch (name) {
		case 'className':
			return property('class', value, children)
		case 'innerHTML':
			children.splice(0, children.length, Element.text(value, 0))
		case 'ref': case 'key': case 'children':
			return ''
		case 'style':
			if (value !== null && typeof value === 'object') {
				payload = stylesheet(value)
			}
	}

	switch (payload) {
		case false: case null: case undefined:
			return ''
		case true:
			return ' ' + name
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
export function stylesheet (value) {
	var payload = ''

	for (var key in value) {
		payload += key.replace(/([A-Z])/, '-$1').toLowerCase() + ': ' + value[key] + ';'
	}

	return payload
}
