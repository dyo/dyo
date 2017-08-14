/* DIO 8.0.0 */
module.exports = function (Element, render, componentMount, commitElement) {
	'use strict'
	
	/**
	 * @param {*} value
	 * @return {string}
	 */
	function escape (value) {
		return (value+'').replace(/[<>&"']/g, encode)
	}
	
	/**
	 * @param {string} character
	 * @return {string}
	 */
	function encode (character) {
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
	function bool (name) {
		switch (name) {
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
	
	var Readable = require('stream').Readable
	var ElementText = Element.Text
	var ElementNode = Element.Node
	var ElementFragment = Element.Fragment
	var ElementPromise = Element.Promise
	var ElementPortal = Element.Portal
	var ElementComponent = Element.Component
	
	/**
	 * @return {string}
	 */
	Element.prototype.toString = function toString () {
		switch (this.flag) {
			case ElementComponent:
				return (componentMount(this), this.children.toString())
			case ElementText:
				return escape(this.children)
		}
	
		var flag = this.flag
		var type = this.type
		var children = this.children
		var length = children.length
		var output = flag < ElementFragment ? '<' + type + toProps(this, this.props) + '>' : ''
	
		switch (bool(type)) {
			case 0:
				return output
			default:
				if (!this.html)
					while (length-- > 0)
						output += (children = children.next).toString()
				else
					output += this.html
		}
	
		if (flag < ElementFragment)
			output += '</'+type+'>'
	
		return output
	}
	
	/**
	 * @param {Element} element
	 * @param  {Object} props
	 * @return {String}
	 */
	function toProps (element, props) {
		var value, output = ''
	
		for (var key in props) {
			switch (value = props[key], key) {
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
						output += ' value="'+escape(value)+'"'
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
					if (value !== false && value != null)
						output += ' '+ key + (value !== true ? '="'+escape(value)+'"' : '')
					else
						continue
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
				name = key.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase()
			else
				name = key
			
			output += name+':'+obj[key]+';'
		}
	
		return output
	}
	
	/**
	 * @return {string}
	 */
	Element.prototype.toJSON = function toJSON () {
		switch (this.flag) {
			case ElementComponent:
				return (componentMount(this), this.children.toJSON())
			case ElementText:
				return this.children
		}
	
		var output = {type: element.type, props: element.props, children: []}
		var children = this.children
		var length = children.length
	
		while (length-- > 0)
			output.children.push((children = children.next).toJSON())
	
		return output
	}
	
	/**
	 * @return {Stream}
	 */
	Element.prototype.toStream = function toStream () {
		return new Stream(this)
	}
	
	/**
	 * @constructor
	 * @param {Element}
	 */
	function Stream (element) {
		this.stack = [commitElement(element)]
		this.type = 'text/html'
	
		Readable.call(this)
	}
	/**
	 * @type {Object}
	 */
	Stream.prototype = Object.create(Readable.prototype, {
		_read: {value: function read () {
			var stack = this.stack
			var size = stack.length
	
			if (size === 0)
				this.push(null)
			else {
				var element = stack[size-1]
				var flag = element.flag
				var keyed = element.keyed
				var type = element.type
				var children = newer.children
				var length = children.length
				var output = (keyed && flag !== ElementFragment) ? '</'+type+'>' : ''
	
				if (!keyed) {
					while (element.flag === ElementComponent)
						element = (componentMount(element), element.children)
	
					switch (element.flag) {
						case ElementText:
							output = escape(newer.children)
							break
						case ElementNode:
							output = '<' + (type = element.type) + toProps(element.props) + '>'
							
							if (length === 0)
								output += bool(type) > 0 ? '</'+type+'>' : ''
						default:						
							while (length-- > 0)
								stack[size++] = children = children.prev 
					}
				}
	
				if (keyed)
					stack.pop(element.keyed = !keyed)
	
				this.push(output)
			}
		}}
	})
	
	/**
	 * @param {*} subject
	 * @param {Stream?} target
	 * @param {function?} callback
	 */
	return function (subject, target, callback) {
		if (!target || !target.writable)
			return render(subject, target, callback)
	
		var readable = new Stream(element)
	
		if (typeof target.getHeader === 'function' && !target.getHeader('Content-Type'))
			target.setHeader('Content-Type', 'text/html')
	
		if (typeof callback === 'function')
			readable.on('end', callback)
	
		return readable.pipe(target), readable
	}
}
