/*! DIO 8.2.4 @license MIT */

module.exports = function (exports, Element, mountComponentElement, getComponentChildren, getComponentSnapshot, getComponentElement, getElementDefinition, invokeErrorBoundary, getElementDescription, createElementIntermediate) {/* eslint-disable */'use strict'

	var SharedElementPromise = -3
	var SharedElementFragment = -2
	var SharedElementPortal = -1
	var SharedElementIntermediate = 0
	var SharedElementComponent = 1
	var SharedElementNode = 2
	var SharedElementText = 3
	var SharedElementEmpty = 4
	
	var SharedRefsRemove = -1
	var SharedRefsAssign = 0
	var SharedRefsDispatch = 1
	var SharedRefsReplace = 2
	
	var SharedComponentForceUpdate = 0
	var SharedComponentPropsUpdate = 1
	var SharedComponentStateUpdate = 2
	
	var SharedMountQuery = 0
	var SharedMountCommit = 1
	var SharedMountRemove = 2
	var SharedMountAppend = 3
	var SharedMountInsert = 4
	
	var SharedWorkMounting = 1
	var SharedWorkIdle = 2
	var SharedWorkIntermediate = 3
	var SharedWorkProcessing = 4
	var SharedWorkPending = 5
	
	var SharedErrorCatch = 1
	var SharedErrorThrow = 2
	
	var SharedPropsMount = 1
	var SharedPropsUpdate = 2
	
	var SharedLinkedPrevious = 'prev'
	var SharedLinkedNext = 'next'
	
	var SharedSitePromise = 'async'
	var SharedSitePrototype = 'prototype'
	var SharedSiteCallback = 'callback'
	var SharedSiteRender = 'render'
	var SharedSiteElement = 'element'
	var SharedSiteConstructor = 'constructor'
	var SharedSiteForceUpdate = 'forceUpdate'
	var SharedSiteSetState = 'setState'
	var SharedSiteFindDOMNode = 'findDOMNode'
	
	var SharedKeyHead = '&|head'
	var SharedKeyBody = '&|'
	var SharedKeyTail = '&|tail'
	
	var SharedLocalNameEmpty = '#empty'
	var SharedLocalNameText = '#text'
	
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
		return (value+'').replace(/[<>&"']/g, getTextEncode)
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
		if (typeof type === 'string')
			switch (type.toLowerCase()) {
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
			}
	
		return false
	}
	
	/**
	 * @param {Response} response
	 */
	function setResponseHeader (response) {
		typeof response.setHeader === 'function' && response.setHeader('Content-Type', 'text/html')
	}
	
	/**
	 * @return {string}
	 */
	function toString () {
		return getStringElement(this, createElementIntermediate(this))
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
				return getStringElement(element.active ? element.children : mountComponentElement(element), element)
		}
	
		var type = element.type
		var children = element.children
		var length = children.length
		var payload = element.id === SharedElementNode ? '<' + type + getStringProps(element, element.props) + '>' : ''
	
		if (isVoidType(type))
			return payload
	
		while (length-- > 0)
			payload += getStringElement(children = children.next, host)
	
		if (element.id !== SharedElementNode)
			return payload
	
		if (element.context)
			element.context = void (payload += element.context)
	
		return payload + '</' + type + '>'
	}
	
	/**
	 * @param {Element} element
	 * @param  {Object} props
	 * @return {String}
	 */
	function getStringProps (element, props) {
		var payload = ''
	
		for (var name in props) {
			var value = props[name]
	
			switch (name) {
				case 'dangerouslySetInnerHTML':
					value = value && value.__html
				case 'innerHTML':
					element.context = value ? value : ''
					continue
				case 'defaultValue':
					if (!props.value)
						payload += ' value="' + getTextEscape(value) + '"'
				case 'key':
				case 'ref':
				case 'children':
					continue
				case 'style':
					payload += ' style="' + (typeof value === 'string' ? value : getStringStyle(value)) + '"'
					continue
				case 'className':
					name = 'class'
					break
				case 'acceptCharset':
					name = 'accept-charset'
					break
				case 'httpEquiv':
					name = 'http-equiv'
					break
				case 'tabIndex':
					name = 'tabindex'
					break
			}
	
			switch (typeof value) {
				case 'boolean':
					if (value)
						payload += ' ' + name
					break
				case 'string':
				case 'number':
					payload += ' ' + name + '="' + getTextEscape(value) + '"'
			}
		}
	
		return payload
	}
	
	/**
	 * @param {Object} props
	 * @return {string}
	 */
	function getStringStyle (props) {
		var payload = ''
	
		for (var name in props) {
			var value = props[name]
	
			switch (typeof value) {
				case 'string':
				case 'number':
					if (name !== name.toLowerCase())
						name = name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase()
	
					payload += name + ': ' + value + ';'
			}
		}
	
		return payload
	}
	
	/**
	 * @return {Object}
	 */
	function toJSON () {
		return getJSONElement(this, createElementIntermediate(this))
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} host
	 * @return {object}
	 */
	function getJSONElement (element, host) {
		switch (element.host = host, element.id) {
			case SharedElementText:
			case SharedElementEmpty:
				return element.children
			case SharedElementComponent:
				return getJSONElement(element.active ? element.children : mountComponentElement(element), element)
		}
	
		var payload = {type: element.type, props: element.props, children: []}
		var children = element.children
		var length = children.length
	
		if (element.id !== SharedElementNode)
			children = (length--, children.next)
	
		while (length-- > 0)
			payload.children.push(getJSONElement(children = children.next, host))
	
		if (element.id !== SharedElementNode)
			(payload = payload.children).pop()
	
		return payload
	}
	
	/**
	 * @type {constructor}
	 */
	var Readable = require('stream').Readable
	
	/**
	 * @param {function=} callback
	 * @return {Stream}
	 */
	function toStream (callback) {
		var container = new Stream(this, createElementIntermediate(this))
	
		if (typeof callback === 'function')
			container.on('end', callback)
	
		return container.setEncoding('utf8')
	}
	
	/**
	 * @constructor
	 * @param {Element} element
	 * @param {Element} host
	 */
	function Stream (element, host) {
		this.host = host
		this.queue = [element]
	
		Readable.call(this)
	}
	/**
	 * @type {Object}
	 */
	Stream.prototype = Object.create(Readable.prototype, {
		_read: {
			value: function () {
				if (this.queue.length > 0)
					read(this.queue.pop(), this.host, this.queue, this)
				else
					this.push(null)
			}
		}
	})
	
	/**
	 * @param {string} payload
	 * @param {Readable} container
	 */
	function write (payload, container) {
		if ((container.push(payload, 'utf8'), !payload))
			container.read(0)
	}
	
	/**
	 * @param {Element} element
	 * @param {Element} host
	 * @param {Element[]} queue
	 * @param {Readable} container
	 */
	function read (element, host, queue, container) {
		var payload = ''
		var children = element.children
	
		switch (element.host = host, element.id) {
			case SharedElementText:
			case SharedElementEmpty:
				return write(getTextEscape(children), container)
			case SharedElementComponent:
				return read(!(container.host = element).active ? mountComponentElement(element) : children, element, queue, container)
			case SharedElementPromise:
				return element.type.then(function (value) {
					read(getElementDefinition(value), host, queue, container)
				}, function () {
					read(getElementDefinition(), host, queue, container)
				})
			case SharedElementNode:
				if (element.context)
					return element.context = write(element.context, container)
				else
					payload += '<' + element.type + getStringProps(element, element.props) + '>'
	
				if (isVoidType(element.type))
					return write(payload, container)
				else
					queue.push((element.context = (element.context || '') + '</' + element.type + '>', element))
			default:
				for (var length = children.length; length > 0 ; --length)
					queue.push(children = children.prev)
		}
	
		write(payload, container)
	}
	
	/**
	 * @param {*} element
	 * @param {Writable?} container
	 * @param {function?} callback
	 */
	function renderToString (element, container, callback) {
		if (!container || !container.writable)
			return getElementDefinition(element).toString()
		else
			container.end(getElementDefinition(element).toString(), 'utf8', (setResponseHeader(container), callback))
	}
	
	/**
	 * @param {*} element
	 * @param {Writable?} container
	 * @param {function?} callback
	 */
	function renderToNodeStream (element, container, callback) {
		if (!container || !container.writable)
			return getElementDefinition(element).toStream()
		else
			getElementDefinition(element).toStream(callback).pipe((setResponseHeader(container), container))
	}
	
	Object.defineProperties(Element.prototype, {
		toJSON: {value: toJSON},
		toString: {value: toString},
		toStream: {value: toStream}
	})
	
	exports.renderToString = renderToString
	exports.renderToNodeStream = renderToNodeStream
}
