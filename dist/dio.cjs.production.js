/*!dio 9.1.2 @license MIT */
module.exports = function (dio, Element, mountComponentInstance, delegateErrorBoundary, getElementDefinition, createElementSnapshot, createElementEmpty, createElement, commitOwner) {/* eslint-disable */'use strict'

	var SharedElementPromise = 1	
	var SharedElementFragment = 2	
	var SharedElementPortal = 3	
	var SharedElementSnapshot = 4	
	var SharedElementComponent = 5	
	var SharedElementCustom = 6	
	var SharedElementNode = 7	
	var SharedElementComment = 8	
	var SharedElementText = 9	
	var SharedElementEmpty = 10	
		
	var SharedComponentForceUpdate = 0	
	var SharedComponentPropsUpdate = 1	
	var SharedComponentStateUpdate = 2	
		
	var SharedRefsDispatch = 0	
	var SharedRefsReplace = 1	
	var SharedRefsRemove = 2	
	var SharedRefsAssign = 3	
		
	var SharedPropsInitial = 0	
	var SharedPropsUpdate = 1	
		
	var SharedMountQuery = 0	
	var SharedMountOwner = 1	
		
	var SharedOwnerAppend = 0	
	var SharedOwnerInsert = 1	
		
	var SharedWorkIdle = 0	
	var SharedWorkUpdating = 1	
		
	var SharedKeyHead = '&|head|'	
	var SharedKeyBody = '&|body|'	
	var SharedKeyTail = '&|tail|'	
		
	var SharedLocalNameComment = '#comment'	
	var SharedLocalNameEmpty = '#empty'	
	var SharedLocalNameText = '#text'	
		
	var SharedLinkedPrevious = 'prev'	
	var SharedLinkedNext = 'next'	
		
	var SharedSiteEvent = 'event'	
	var SharedSitePromise = 'promise'	
	var SharedSitePrototype = 'prototype'	
	var SharedSiteCallback = 'callback'	
	var SharedSiteRender = 'render'	
	var SharedSiteElement = 'element'	
	var SharedSiteConstructor = 'constructor'	
	var SharedSiteForceUpdate = 'forceUpdate'	
	var SharedSiteSetState = 'setState'	
	var SharedSiteFindDOMNode = 'findDOMNode'	
	var SharedSiteDisplayName = 'displayName'	
		
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
	var SharedGetDefaultProps = 'getDefaultProps'	
	var SharedDefaultProps = 'defaultProps'	
	
	/**	
	 * @param {Element} element	
	 * @param {Exception} exception	
	 * @return {Element}	
	 */	
	function getErrorBoundary (element, exception) {	
		return createElementEmpty(delegateErrorBoundary(element, exception))	
	}	
		
	/**	
	 * @param {Element} element	
	 * @param {Element} host	
	 * @return {Element}	
	 */	
	function getComponentChildren (element, host) {	
		try {	
			return mountComponentInstance(element)	
		} catch (err) {	
			return getErrorBoundary(host, err)	
		}	
	}	
		
	/**	
	 * @param {Element} element	
	 * @return {Element}	
	 */	
	function getCustomElement (element) {	
		try {	
			commitOwner(element)	
		} finally {	
			return getCustomProps(createElement('template', element.children), element.owner)	
		}	
	}	
		
	/**	
	 * @param {Element} element	
	 * @param {object} owner	
	 * @return {Element}	
	 */	
	function getCustomProps (element, owner) {	
		if (!owner)	
			return element	
		
		if (owner.nodeName)	
			element.type = owner.nodeName.toLowerCase()	
		
		if (owner.attributes)	
			for (var attributes = owner.attributes, i = attributes.length - 1; i >= 0; --i)	
				element.props[attributes[i].name] = attributes[i].value	
		
		if (owner.innerHTML)	
			element.props.innerHTML = owner.innerHTML	
		
		return element	
	}	
		
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
	 * @param {string} type	
	 * @return {boolean}	
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
		return getStringElement(this, this.host || createElementSnapshot(this))	
	}	
		
	/**	
	 * @param {Element} element	
	 * @param {Element} host	
	 * @return {string}	
	 */	
	function getStringElement (element, host) {	
		switch (element.host = host, element.id) {	
			case SharedElementText:	
			case SharedElementEmpty:	
				return getTextEscape(element.children)	
			case SharedElementComment:	
				return getStringComment(element)	
			case SharedElementCustom:	
				return getStringElement(getCustomElement(element), host)	
			case SharedElementComponent:	
				return getStringElement(element.active ? element.children : getComponentChildren(element, host), element)	
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
	 * @param {object} props	
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
				case 'key':	
				case 'ref':	
				case 'children':	
					continue	
				case 'style':	
					payload += ' style="' + (typeof value === 'string' ? value : getStringStyle(value)) + '"'	
				case 'textContent':	
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
				case 'defaultValue':	
					if ((name = 'value') in props)	
						continue	
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
	 * @param {object} props	
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
	 * @param {Element} element	
	 * @return {string}	
	 */	
	function getStringComment (element) {	
		return '<!--' + element.children + '-->'	
	}	
	
	/**	
	 * @return {object}	
	 */	
	function toJSON () {	
		return getJSONElement(this, this.host || createElementSnapshot(this))	
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
			case SharedElementComment:	
				return getJSONObject(element, {}, element.children)	
			case SharedElementCustom:	
				return getJSONElement(getCustomElement(element), host)	
			case SharedElementComponent:	
				return getJSONElement(element.active ? element.children : getComponentChildren(element, host), element)	
		}	
		
		var payload = getJSONObject(element, element.props, [])	
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
	 * @param {Element} element	
	 * @param {object?} props	
	 * @param {(string|number|object)?}	
	 * @return {object}	
	 */	
	function getJSONObject (element, props, children) {	
		return {type: element.type, props: props, children: children}	
	}	
	
	/**	
	 * @name Readable	
	 * @constructor	
	 * @type {function}	
	 */	
	var Readable = require('stream').Readable	
		
	/**	
	 * @param {function?} callback	
	 * @return {Stream}	
	 */	
	function toStream (callback) {	
		var container = new Stream(this, this.host || createElementSnapshot(this))	
		
		if (typeof callback === 'function')	
			container.on('end', callback)	
		
		return container.setEncoding('utf8')	
	}	
		
	/**	
	 * @name Stream	
	 * @constructor	
	 * @property {Element} host	
	 * @property {Array<Element>} queue	
	 * @param {Element} element	
	 * @param {Element} host	
	 */	
	function Stream (element, host) {	
		this.host = host	
		this.queue = [element]	
		Readable.call(this)	
	}	
	/**	
	 * @alias Stream#prototype	
	 * @memberof Stream	
	 * @type {object}	
	 */	
	Stream.prototype = Object.create(Readable.prototype, {	
		/**	
		 * @alias Stream#_read	
		 * @memberof Stream	
		 * @private	
		 * @type {function}	
		 */	
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
	 * @param {Array<Element>} queue	
	 * @param {Readable} container	
	 */	
	function read (element, host, queue, container) {	
		var payload = ''	
		var children = element.children	
		
		switch (element.host = host, element.id) {	
			case SharedElementText:	
			case SharedElementEmpty:	
				return write(getTextEscape(children), container)	
			case SharedElementComment:	
				return write(getStringComment(element), container)	
			case SharedElementCustom:	
				return read(getCustomElement(element), host, queue, container)	
			case SharedElementComponent:	
				return read((container.host = element).active ? children : getComponentChildren(element, host), element, queue, container)	
			case SharedElementPromise:	
				return element.context = element.type.then(function (value, done) {	
					if (done !== false)	
						read(getElementDefinition(value), host, queue, container)	
				}, function (err) {	
					read(getElementDefinition(getErrorBoundary(host, err)), host, queue, container)	
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
	 * @param {any} element	
	 * @param {Writable?} container	
	 * @param {function?} callback	
	 * @return {string?}	
	 */	
	function renderToString (element, container, callback) {	
		if (!container || !container.writable)	
			return getElementDefinition(element).toString()	
		else	
			container.end(getElementDefinition(element).toString(), 'utf8', (setResponseHeader(container), callback))	
	}	
		
	/**	
	 * @param {any} element	
	 * @param {Writable?} container	
	 * @param {function?} callback	
	 * @param {Stream?}	
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
	
	dio.renderToString = renderToString
	dio.renderToNodeStream = renderToNodeStream
}
/*!/dio*/
