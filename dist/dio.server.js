/*
 * DIO
 *
 * version 8.0.0
 * license MIT
 */
module.exports = function (exports, componentMount, commitElement, getChildContext, Element) {
	'use strict'
	
	var ElementPromise = -3
	var ElementFragment = -2
	var ElementPortal = -1
	var ElementIntermediate = 0
	var ElementComponent = 1
	var ElementNode = 2
	var ElementText = 3
	
	var WorkTask = 0
	var WorkSync = 1
	
	var LifecycleCallback = 'callback'
	var LifecycleRender = 'render'
	var LifecycleConstructor = 'constructor'
	var LifecycleAsync = 'async'
	var LifecycleState = 'setState'
	var LifecycleFindDOMNode = 'findDOMNode'
	var LifecycleWillMount = 'componentWillMount'
	var LifecycleDidMount = 'componentDidMount'
	var LifecycleWillReceiveProps = 'componentWillReceiveProps'
	var LifecycleShouldUpdate = 'shouldComponentUpdate'
	var LifecycleWillUpdate = 'componentWillUpdate'
	var LifecycleDidUpdate = 'componentDidUpdate'
	var LifecycleWillUnmount = 'componentWillUnmount'
	var LifecycleDidCatch = 'componentDidCatch'
	var LifecycleChildContext = 'getChildContext'
	var LifecycleInitialState = 'getInitialState'
	
	/**
	 * @param {Element} element
	 * @return {Element}
	 */
	function elementComponent (element) {
		componentMount(element)
	
		if (element.owner[LifecycleChildContext])
			element.context = getChildContext(element)
		
		return element.children
	}
	
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
			case '!doctype': return 0
			default: return 2
		}
	}
	
	/**
	 * @param {Response} response
	 */
	function setHeader (response) {
		if (typeof response.getHeader === 'function' && !response.getHeader('Content-Type'))
			response.setHeader('Content-Type', 'text/html')
	}
	
	var Readable = require('stream').Readable
	var RegExpEscape = /[<>&"']/g
	var RegExpDashCase = /([a-zA-Z])(?=[A-Z])/g
	var RegExpVendor = /^(ms|webkit|moz)/
	
	Element.prototype.html = ''
	Element.prototype.chunk = ''
	
	Element.prototype.toString = toString
	Element.prototype.toStream = toStream
	Element.prototype.toJSON = toJSON
	
	exports.renderToString = renderToString
	exports.renderToStream = renderToStream
	
	/**
	 * @return {string}
	 */
	function toString () {
		var element = this
	
		switch (element.flag) {
			case ElementComponent:
				return elementComponent(element).toString()
			case ElementText:
				return escapeText(element.children)
		}
	
		var type = element.type
		var children = element.children
		var length = children.length
		var output = element.flag > ElementIntermediate ? '<' + type + toProps(element, element.props) + '>' : ''
	
		switch (elementType(type)) {
			case 0:
				return output
			default:
				if (!element.html)
					while (length-- > 0)
						output += (children = children.next).toString()
				else {
					output += element.html
					element.html = ''
				}
		}
	
		return element.flag > ElementIntermediate ? output + '</'+type+'>' : output
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
					element.html = value
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
		
		switch (element.flag) {
			case ElementComponent:
				return elementComponent(element).toJSON()
			case ElementText:
				return element.children
		}
	
		var output = {type: element.type, props: element.props, children: []}
		var children = element.children
		var length = children.length
	
		while (length-- > 0)
			output.children.push((children = children.next).toJSON())
	
		return element.flag < ElementIntermediate ? output.children : output
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
		while (element.flag === ElementComponent)
			element = elementComponent(element)
	
		var type = element.type
		var children = element.children
		var length = children.length
		var output = ''
	
		switch (element.flag) {
			case ElementPromise:
				return void element.type.then(function (element) {
					toChunk(commitElement(element), stack, writable)
				})
			case ElementText:
				output = escapeText(children)
				break
			case ElementNode:
				output = '<' + type + toProps(element, element.props) + '>'
					
				if (element.html) {
					output += element.html
					element.html = ''
					length = 0
				}
	
				if (!length) {
					output += elementType(type) > 0 ? '</'+type+'>' : ''
					break
				}
			default:
				if (element.flag > ElementIntermediate)
					children.prev.chunk = '</'+type+'>'
	
				while (length-- > 0)
					stack.push(children = children.prev)
		}
	
		if (element.chunk) {
			output += element.chunk
			element.chunk = ''
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
