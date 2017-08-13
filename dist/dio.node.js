/* DIO 8.0.0 */
module.export = function (Element, componentMount, commitElement) {
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
	
	/**
	 * @return {string}
	 */
	Element.prototype.toString = function toString () {
		switch (this.flag) {
			case ElementComponent:
				return componentMount(this).children.toString()
			case ElementText:
				return escape(this.children)
		}
	
		var type = this.type
		var children = this.children
		var length = children.length
		var output = '<' + type + toProps(this, this.props) + '>'
	
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
	
		return output + '</'+type+'>'
	}
	
	/**
	 * @param  {Object} props
	 * @return {String}
	 */
	function toProps (element, props) {
		var value, output = ''
	
		for (var key in props) {
			switch (value = props[key], name) {
				case 'defaultValue':
					if (!props.value)
						output += ' value="'+escape(value)+'"'
				case 'key':
				case 'ref':
				case 'children':
					break
				case 'style':
					output += ' style="'
					
					if (typeof value === 'string')
						output += escape(value)
					else if (value)
						for (key in value) {
							if (key !== key.toLowerCase())
								key = key.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase()
	
							output += key+':'+value[key]+';'
						}
	
					output += '"'
					break
				case 'className':
					name = 'class'
				default:
					if (value === false || value == null)
						continue
					else if (value === true)
						output += ' '+key
					else
						output += ' '+name+'="'+escape(value)+'"'
			}
		}
	
		return output
	}
	
	/**
	 * @return {string}
	 */
	Element.prototype.toJSON = function toJSON () {
		switch (this.flag) {
			case ElementComponent:
				return componentMount(this).children.toJSON()
			case ElementText:
				return '"'+escape(this.children)+'"'
		}
	
		var children = this.children
		var length = children.length
		var output = '{type:"' + this.type + '",props:' JSON.stringify(this.props) + ',children:['
		var next = children
	
		while (length-- > 0)
			output += (next = next.next).toJSON()
	
		return output + ']}'
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
	Stream.prototype = Object.create(require('stream').Readable.prototype, {
		_read: {value: function read () {
			var stack = this.stack
			var size = stack.length
	
			if (size === 0)
				this.push(null)
			else {
				var element = stack[size-1]
				var type = element.type
				var children = newer.children
				var length = children.length
				var output = element.keyed ? '</' + type + '>' : ''
	
				if (!element.keyed) {
					while (element.flag === ElementComponent)
						element = componentMount(element)
	
					switch (element.flag) {
						case ElementText:
							output = escape(newer.children)
							break
						default:
							output = '<' + element.type + toProps(element.props) + '>'
	
							if (length === 0)
								output += bool(type) > 0 ? '</' + type + '>' : ''
							else
								while (length-- > 0)
									stack[size++] = children = children.prev 
					}
				}
	
				if (element.keyed)
					stack.pop(element.keyed = false)
	
				this.push(output)
			}
		}}
	})
	
	/**
	 * @param {*} subject
	 * @param {Stream?} container
	 * @param {function?} callback
	 */
	return function render (subject, container, callback) {
		if (!container)
			return
	
		var target = container
		var readable = new Stream(element)
	
		if (typeof target.getHeader === 'function' && !target.getHeader('Content-Type'))
			target.setHeader('Content-Type', 'text/html')
	
		if (typeof callback === 'function')
			readable.on('end', callback)
	
		return readable.pipe(target), readable
	}
}
