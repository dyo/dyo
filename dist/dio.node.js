/*! DIO 8.0.0 @license MIT */

module.exports = function (exports, Element, componentMount, commitElement) {
	
	'use strict'
	
	var SharedElementPromise = -3
	var SharedElementFragment = -2
	var SharedElementPortal = -1
	var SharedElementEmpty = 0
	var SharedElementComponent = 1
	var SharedElementNode = 2
	var SharedElementText = 3
	
	var SharedReferenceRemove = -1
	var SharedReferenceAssign = 0
	var SharedReferenceDispatch = 1
	var SharedReferenceReplace = 2
	
	var SharedComponentForceUpdate = 0
	var SharedComponentPropsUpdate = 1
	var SharedComponentStateUpdate = 2
	
	var SharedMountClone = 0
	var SharedMountCommit = 1
	var SharedMountRemove = 2
	var SharedMountAppend = 3
	var SharedMountInsert = 4
	var SharedMountReplace = 5
	
	var SharedWorkTask = 0
	var SharedWorkSync = 1
	
	var SharedErrorPassive = -2
	var SharedErrorActive = -1
	
	var SharedPropsMount = 1
	var SharedPropsUpdate = 2
	
	var SharedSiblingElement = 1
	var SharedSiblingChildren = 2
	
	var SharedSiteCallback = 'callback'
	var SharedSiteRender = 'render'
	var SharedSiteConstructor = 'constructor'
	var SharedSiteAsync = 'async'
	var SharedSiteSetState = 'setState'
	var SharedSiteFindDOMNode = 'findDOMNode'
	
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
	exports.renderToStream = renderToStream
	
	/**
	 * @param {*} value
	 * @return {string}
	 */
	function escapeText (value) {
		return (value+'').replace(RegExpEscape, encodeText)
	}
	
	/**
	 * @param {string} character
	 * @return {string}
	 */
	function encodeText (character) {
		switch (character) {
			case '<': return '&lt;'
			case '>': return '&gt;'
			case '"': return '&quot;'
			case "'": return '&#x27;'
			case '&': return '&amp;'
			default: return character
		}
	}
	
	/**
	 * @param {string}
	 */
	function elementType (type) {
		switch (type) {
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
			case '!doctype': return SharedElementEmpty
			default: return SharedElementNode
		}
	}
	
	/**
	 * @param {Response} response
	 */
	function setHeader (response) {
		if (typeof response.getHeader === 'function' && !response.getHeader('Content-Type'))
			response.setHeader('Content-Type', 'text/html')
	}
	
	/**
	 * @return {string}
	 */
	function toString () {
		var element = this
	
		switch (element.id) {
			case SharedElementComponent:
				return componentMount(element).toString()
			case SharedElementText:
				return escapeText(element.children)
		}
	
		var type = element.type
		var children = element.children
		var length = children.length
		var output = element.id === SharedElementNode ? '<' + type + toProps(element, element.props) + '>' : ''
	
		if (elementType(type) === SharedElementEmpty)
			return output
	
		if (typeof element.DOM !== 'string')
			while (length-- > 0)
				output += (children = children.next).toString()
		else {
			output += element.DOM
			element.DOM = null
		}
	
		return element.id === SharedElementNode ? output + '</'+type+'>' : output
	}
	
	/**
	 * @param {Element} element
	 * @param  {Object} props
	 * @return {String}
	 */
	function toProps (element, props) {
		var output = ''
	
		for (var key in props) {
			var value = props[key]
			
			switch (key) {
				case 'dangerouslySetInnerHTML':
					if (value && value.__html)
						value = value.__html
					else
						break
				case 'innerHTML':
					element.DOM = value+''
					break
				case 'defaultValue':
					if (!props.value)
						output += ' value="'+escapeText(value)+'"'
				case 'key':
				case 'ref':
				case 'children':
					break
				case 'style':
					output += ' style="' + (typeof value === 'string' ? value : toStyle(value)) + '"'				
					break
				case 'className':
					key = 'class'
				default:
					switch (typeof value) {
						case 'boolean':
							if (value === false)
								break
						case 'string':
						case 'number':
							output += ' '+ key + (value !== true ? '="'+escapeText(value)+'"' : '')
					}
			}
		}
	
		return output
	}
	
	/**
	 * @param {Object} obj
	 * @return {string}
	 */
	function toStyle (obj) {
		var name, output = ''
	
		for (var key in obj) {
			if (key !== key.toLowerCase())
				name = key.replace(RegExpDashCase, '$1-').replace(RegExpVendor, '-$1').toLowerCase()
			else
				name = key
			
			output += name+':'+obj[key]+';'
		}
	
		return output
	}
	
	/**
	 * @return {string}
	 */
	function toJSON () {
		var element = this
		
		switch (element.id) {
			case SharedElementComponent:
				return componentMount(element).toJSON()
			case SharedElementText:
				return element.children
		}
	
		var output = {type: element.type, props: element.props, children: []}
		var children = element.children
		var length = children.length
	
		while (length-- > 0)
			output.children.push((children = children.next).toJSON())
	
		return element.id < SharedElementEmpty ? output.children : output
	}
	
	/**
	 * @constructor
	 * @param {Element}
	 */
	function Stream (element) {
		this.stack = [element]
		Readable.call(this)
	}
	/**
	 * @type {Object}
	 */
	Stream.prototype = Object.create(Readable.prototype, {
		/**
		 * @return {void}
		 */
		_read: {value: function read () {
			if (this.stack.length)
				toChunk(this.stack.pop(), this.stack, this)
			else
				this.push(null)
		}}
	})
	
	/**
	 * @param {function=}
	 * @return {Stream}
	 */
	function toStream (callback) {
		var readable = new Stream(this)
	
		if (typeof callback === 'function')
			readable.on('end', callback)
	
		return readable
	}
	
	/**
	 * @param {Element} element
	 * @param {Array} stack
	 * @param {Writable} writable
	 * @return {string}
	 */
	function toChunk (element, stack, writable) {
		while (element.id === SharedElementComponent)
			element = componentMount(element)
	
		var type = element.type
		var children = element.children
		var length = children.length
		var output = ''
	
		switch (element.id) {
			case SharedElementPromise:
				return void element.type.then(function (element) {
					toChunk(commitElement(element), stack, writable)
				})
			case SharedElementText:
				output = escapeText(children)
				break
			case SharedElementNode:
				output = '<' + type + toProps(element, element.props) + '>'
				
				if (elementType(type) === SharedElementEmpty)
					break
				
				if (typeof element.DOM === 'string') {
					output += element.DOM
					element.DOM = null
					length = 0
				}
	
				if (length === 0) {
					output += '</'+type+'>'
					break
				}
			default:
				if (element.id === SharedElementNode)
					children.prev.DOM = '</'+type+'>'
	
				while (length-- > 0)
					stack.push(children = children.prev)
		}
	
		if (typeof element.DOM === 'string') {
			output += element.DOM
			element.DOM = null
		}
	
		writable.push(output)
	}
	
	/**
	 * @param {*} subject
	 * @param {Stream?} target
	 * @param {function=}
	 */
	function renderToString (subject, target, callback) {
		if (!target || !target.writable)
			return commitElement(subject).toString()
	
		setHeader(target)
		
		target.end(commitElement(subject).toString(), 'utf8', callback)
	}
	
	/**
	 * @param {*} subject
	 * @param {Stream?} target
	 * @param {function=} callback
	 */
	function renderToStream (subject, target, callback) {
		if (!target || !target.writable)
			return commitElement(subject).toStream()
	
		setHeader(target)
		
		commitElement(subject).toStream(callback).pipe(target)
	}
}
