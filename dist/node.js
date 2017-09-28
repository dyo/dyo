/*! DIO 8.0.0 @license MIT */

module.exports = function (exports, Element, mountComponentElement, unmountComponentElement, getComponentElement, getComponentChildren, invokeErrorBoundary, getElementDefinition, getElementDescription) {'use strict'/* eslint-disable */

var SharedElementPromise = -3
var SharedElementFragment = -2
var SharedElementPortal = -1
var SharedElementIntermediate = 0
var SharedElementComponent = 1
var SharedElementNode = 2
var SharedElementText = 3
var SharedElementEmpty = 4

var SharedReferenceRemove = -1
var SharedReferenceAssign = 0
var SharedReferenceDispatch = 1
var SharedReferenceReplace = 2

var SharedComponentForceUpdate = 0
var SharedComponentPropsUpdate = 1
var SharedComponentStateUpdate = 2

var SharedMountQuery = 0
var SharedMountCommit = 1
var SharedMountRemove = 2
var SharedMountAppend = 3
var SharedMountInsert = 4

var SharedWorkMounting = -1
var SharedWorkUpdating = 0
var SharedWorkIdle = 1

var SharedErrorPassive = -2
var SharedErrorActive = -1

var SharedPropsMount = 1
var SharedPropsUpdate = 2

var SharedSiblingPrevious = 'prev'
var SharedSiblingNext = 'next'

var SharedSiteCallback = 'callback'
var SharedSiteRender = 'render'
var SharedSiteElement = 'element'
var SharedSiteConstructor = 'constructor'
var SharedSiteAsync = 'async'
var SharedSiteSetState = 'setState'
var SharedSiteFindDOMNode = 'findDOMNode'

var SharedTypeKey = '.'
var SharedTypeEmpty = '#empty'
var SharedTypeText = '#text'
var SharedTypeFragment = '#fragment'

var SharedComponentWillMount = 'componentWillMount'
var SharedComponentDidMount = 'componentDidMount'
var SharedComponentWillReceiveProps = 'componentWillReceiveProps'
var SharedComponentShouldUpdate = 'shouldComponentUpdate'
var SharedComponentWillUpdate = 'componentWillUpdate'
var SharedComponentDidUpdate = 'componentDidUpdate'
var SharedComponentWillUnmount = 'componentWillUnmount'
var SharedComponentDidCatch = 'componentDidCatch'
var SharedGetChildContext = 'getChildContext'
var SharedGetInitialState = 'getInitialState'

/**
 * @param {*} value
 * @return {string}
 */
function getTextEscape (value) {
	return (value+'').replace(RegExpEscape, getTextEncode)
}

/**
 * @param {string} character
 * @return {string}
 */
function getTextEncode (character) {
	switch (character) {
		case '<':
			return '&lt;'
		case '>':
			return '&gt;'
		case '"':
			return '&quot;'
		case "'":
			return '&#x27;'
		case '&':
			return '&amp;'
	}
}

/**
 * @param {string}
 */
function isVoidType (type) {
	switch ((type+'').toLowerCase()) {
		case 'area':
		case 'base':
		case 'br':
		case 'meta':
		case 'source':
		case 'keygen':
		case 'img':
		case 'col':
		case 'embed':
		case 'wbr':
		case 'track':
		case 'param':
		case 'link':
		case 'input':
		case 'hr':
		case '!doctype':
			return true
		default:
			return false
	}
}

/**
 * @param {Response} response
 */
function setResponseHeader (response) {
	if (typeof response.getHeader === 'function' && !response.getHeader('Content-Type'))
		response.setHeader('Content-Type', 'text/html')
}

var Readable = require('stream').Readable
var RegExpEscape = /[<>&"']/g
var RegExpDashCase = /([a-zA-Z])(?=[A-Z])/g
var RegExpVendor = /^(ms|webkit|moz)/

Object.defineProperties(Element.prototype, {
	toJSON: {value: toJSON},
	toString: {value: toString},
	toStream: {value: toStream}
})

exports.renderToString = renderToString
exports.renderToNodeStream = renderToNodeStream

/**
 * @return {string}
 */
function toString () {
	return getStringElement(this, null)
}

/**
 * @param {Element} element
 * @param {Element?} host
 * @return {string}
 */
function getStringElement (element, host) {
	switch (element.host = host, element.id) {
		case SharedElementText:
		case SharedElementEmpty:
			return getTextEscape(element.children)
		case SharedElementComponent:
			return getStringElement(mountComponentElement(element), element)
	}

	var type = element.type
	var children = element.children
	var length = children.length
	var output = element.id === SharedElementNode ? '<' + type + getStringProps(element, element.props) + '>' : ''
	
	if (isVoidType(type))
		return output

	if (!element.DOM)
		while (length-- > 0)
			output += getStringElement(children = children.next, host)
	else (output += element.DOM)
		element.DOM = null

	if (element.id === SharedElementNode)
		return output + '</' + type + '>'
	else
		return output
}

/**
 * @param {Element} element
 * @param  {Object} props
 * @return {String}
 */
function getStringProps (element, props) {
	var output = ''
	var xmlns = element.xmlns

	for (var name in props) {
		var value = props[name]
		
		switch (name) {
			case 'dangerouslySetInnerHTML':
				if (value && value.__html)
					value = value.__html
				else
					continue
			case 'innerHTML':
				element.DOM = value + ''
				continue
			case 'defaultValue':
				if (!props.value)
					output += ' value="' + getTextEscape(value) + '"'
			case 'key':
			case 'ref':
			case 'children':
				continue
			case 'style':
				output += ' style="' + (typeof value === 'string' ? value : getStringStyle(value)) + '"'				
				continue
			case 'className':
				name = 'class'
				break
			case 'acceptCharset':
				name = 'accept-charset'
				break
			case 'httpEquiv':
				name = 'http-equiv'
		}

		switch (typeof value) {
			case 'boolean':
				if (value)
					output += ' ' + name
				break
			case 'string':
			case 'number':
				output += ' ' + name + '="' + getTextEscape(value) + '"'
		}
	}

	return output
}

/**
 * @param {Object} props
 * @return {string}
 */
function getStringStyle (props) {
	var output = ''

	for (var name in props) {
		var value = props[name]

		if (name !== name.toLowerCase())
			name = name.replace(RegExpDashCase, '$1-').replace(RegExpVendor, '-$1').toLowerCase()

		output += name + ':' + value + ';'
	}

	return output
}

/**
 * @return {Object}
 */
function toJSON () {
	var element = this
	
	switch (element.id) {
		case SharedElementText:
		case SharedElementEmpty:
			return element.children
		case SharedElementComponent:
			return mountComponentElement(element).toJSON()
	}

	var output = {type: element.type, props: element.props, children: []}
	var children = element.children
	var length = children.length

	if (element.id < SharedElementIntermediate)
		children = (length--, children.next)

	while (length-- > 0)
		output.children.push((children = children.next).toJSON())

	if (element.id < SharedElementIntermediate)
		if (output = output.children)
			output.pop()

	return output
}

/**
 * @param {function=}
 * @return {Stream}
 */
function toStream (callback) {
	var readable = new Stream(this)

	switch (typeof callback) {
		case 'function':
			readable.on('end', callback)
			break
		case 'string':
			readable.setEncoding(callback)
			break
		default:
			readable.setEncoding('utf8')
	}

	return readable
}

/**
 * @constructor
 * @param {Element}
 */
function Stream (element) {
	this.host = null
	this.stack = [element]

	Readable.call(this)
}
/**
 * @type {Object}
 */
Stream.prototype = Object.create(Readable.prototype, {_read: {value: getStreamElement}})

/**
 * @return {void}
 */
function getStreamElement () {
	if (this.stack.length > 0)
		readStreamElement(this.stack.pop(), this.host, this.stack, this)
	else
		this.push(null)
}

/**
 * @param {Element} element
 * @param {Element} host
 * @param {Array} stack
 * @param {Readable} readable
 * @param {number} id
 * @param {number} signature
 */
function pendingStreamElement (element, host, stack, readable, id, signature) {
	return function (value) {
		var children

		if (signature !== SharedErrorActive)
			children = invokeErrorBoundary(element, value, SharedSiteAsync+':'+SharedSiteSetState, SharedErrorActive)
		else if (id !== SharedElementComponent)
			children = getElementDefinition(value)
		else
			children = getComponentChildren(element, (element.instance.state = value || {}, element.instance))

		readStreamElement(children, host, stack, readable)
	}
}

/**
 * @param {Element} element
 * @param {Element?} host
 * @param {Array} stack
 * @param {Readable} readable
 */
function readStreamElement (element, host, stack, readable) {
	var output = ''
	var children = element.children

	switch (element.host = host, element.id) {
		case SharedElementComponent:
			children = mountComponentElement(readable.host = element)

			if (!element.state || element.state.constructor !== Promise)
				return readStreamElement(children, element, stack, readable)

			return void element.state
				.then(pendingStreamElement(element, element, stack, readable, SharedElementComponent, SharedErrorActive))
				.catch(pendingStreamElement(element, element, stack, readable, SharedElementComponent, SharedErrorPassive))
		case SharedElementPromise:
			return void element.type
				.then(pendingStreamElement(element, host, stack, readable, SharedElementPromise, SharedErrorActive))
				.catch(pendingStreamElement(element, host, stack, readable, SharedElementPromise, SharedErrorPassive))
		case SharedElementText:
		case SharedElementEmpty:
			return writeStreamElement(children, readable)
		case SharedElementNode:
			if (element.DOM)
				return element.DOM = writeStreamElement(element.DOM, readable)

			output += '<' + element.type + getStringProps(element, element.props) + '>'
			
			if (isVoidType(element.type))
				return writeStreamElement(output, readable)
			
			if (element.DOM)
				output += element.DOM

			element.DOM = '</' + element.type + '>'
			stack.push(element)
		default:
			var length = children.length

			while (length-- > 0)
				stack.push(children = children.prev)
	}

	writeStreamElement(output, readable)
}

/**
 * @param {string} output
 * @param {Readable} readable
 */
function writeStreamElement (output, readable) {
	readable.push(output, 'utf8')

	if (!output)
		readable.read(0)
}

/**
 * @param {*} element
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToString (element, target, callback) {
	if (!target || !target.writable)
		return getElementDefinition(element).toString()
	else
		setResponseHeader(target)
	
	return target.end(getElementDefinition(element).toString(), 'utf8', callback)
}

/**
 * @param {*} element
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToNodeStream (element, target, callback) {
	if (!target || !target.writable)
		return getElementDefinition(element).toStream()
	else
		setResponseHeader(target)
	
	return getElementDefinition(element).toStream(callback).pipe(target)
}

}
