/* DIO 8.0.0 */
module.exports = function (exports, componentMount, commitElement, Element) {
	'use strict'
	
	/**
	 * @constructor
	 */
	function List () {
		this.next = this
		this.prev = this
		this.length = 0
	}
	List.prototype = Object.create(null, {
		constructor: {value: List},
		/**
		 * @param {Element} element
		 * @param {Element} sibling
		 * @return {Element}
		 */
		insert: {value: function insert (element, sibling) {
			element.next = sibling
			element.prev = sibling.prev
			sibling.prev.next = element
			sibling.prev = element
			this.length++
			
			return element
		}},
		/**
		 * @param {Element} element
		 * @return {Element}
		 */
		remove: {value: function remove (element) {
			if (this.length < 1) 
				return
			
			element.next.prev = element.prev
			element.prev.next = element.next
			this.length--
			
			return element
		}},
		/**
		 * @return {Element}
		 */
		pop: {value: function pop () {
			return this.remove(this.prev)
		}},
		/**
		 * @param {Element} element
		 * @return {Element}
		 */
		push: {value: function push (element) {
			return this.insert(element, this)
		}},
		/**
		 * @param {function} callback
		 */
		forEach: {value: function forEach (callback) {
			for (var i = 0, element = this; i < this.length; ++i)
				callback.call(this, element = element.next, i)
		}}
	})
	
	/**
	 * @constructor
	 */
	function Hash () {
		this.hash = ''
	}
	Hash.prototype = Object.create(null, {
		constructor: {value: Hash},
		/**
		 * @param {*} key
		 * @param {*} value
		 */
		set: {value: function set (key, value) {
			key[this.hash] = value
		}},
		/**
		 * @param {*} key
		 * @return {*}
		 */
		get: {value: function get (key) {
			return key[this.hash]
		}},
		/**
		 * @param {*} key
		 * @return {boolean}
		 */
		has: {value: function has (key) {
			return this.hash in key
		}}
	})
	
	/**
	 * @param {*} description
	 * @return {string}
	 */
	function Unique (description) {
		return 'Symbol('+description+')'
	}
	
	/**
	 * @return {void}
	 */
	function noop () {}
	
	/**
	 * @param {Object} object
	 * @param {Object} primary
	 */
	function merge (object, primary) {
		for (var key in primary)
			object[key] = primary[key]
	}
	
	/**
	 * @param {Object} object
	 * @param {Object} primary
	 * @param {Object} secondary
	 * @return {Object}
	 */
	function assign (object, primary, secondary) {
		for (var key in primary)
			object[key] = primary[key]
		
		for (var key in secondary)
			object[key] = secondary[key]
	
		return object
	}
	
	/**
	 * @param {Array} array
	 * @param {Array} output
	 * @return {Array}
	 */
	function flatten (array, output) {	
		for (var i = 0; i < array.length; ++i) {
			if (array[i] instanceof Array)
				flatten(array[i], output)
			else
				output.push(array[i])
		}
		
		return output
	}
	
	/**
	 * @param {Iterable} iterable
	 * @param {function} callback
	 */
	function each (iterable, callback) {
		var value = iterable.next()
	
		while (value.done !== true) {
			callback(value.value)
			value = iterable.next(value.value)
		}
	}
	
	/**
	 * @param {function} callback
	 */
	function enqueue (callback) {
		requestAnimationFrame(callback, 16)
	}
	
	/**
	 * @param {string} from
	 * @param {string} message
	 */
	function invariant (from, message) {
		throw new Error('#'+from+'(...): '+message+'.')
	}
	
	var Symbol = window.Symbol || Unique
	var WeakMap = window.WeakMap || Hash
	var Promise = window.Promise || noop
	var Node = window.Node || noop
	var UUID = Symbol('dio')
	var Iterator = Symbol.iterator || UUID
	
	var root = new WeakMap()
	var document = window.document || noop
	var requestAnimationFrame = window.requestAnimationFrame || setTimeout
	
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
	
	var NsLink = 'http://www.w3.org/1999/xlink'
	var NsSvg = 'http://www.w3.org/2000/svg'
	var NsMath = 'http://www.w3.org/1998/Math/MathML'
	
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
	var RegExpDashCase = /([a-zA-Z])(?=[A-Z])/
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
		switch (this.flag) {
			case ElementComponent:
				return (componentMount(this), this.children.toString())
			case ElementText:
				return escapeText(this.children)
		}
	
		var type = this.type
		var children = this.children
		var length = children.length
		var output = this.flag > ElementIntermediate ? '<' + type + toProps(this, this.props) + '>' : ''
	
		switch (elementType(type)) {
			case 0:
				return output
			default:
				if (!this.html)
					while (length-- > 0)
						output += (children = children.next).toString()
				else {
					output += this.html
					this.html = ''
				}
		}
	
		return this.flag > ElementIntermediate ? output + '</'+type+'>' : output
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
					if (value !== false && value != null)
						output += ' '+ key + (value !== true ? '="'+escapeText(value)+'"' : '')
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
		switch (this.flag) {
			case ElementComponent:
				return (componentMount(this), this.children.toJSON())
			case ElementText:
				return this.children
		}
	
		var output = {type: this.type, props: this.props, children: []}
		var children = this.children
		var length = children.length
	
		while (length-- > 0)
			output.children.push((children = children.next).toJSON())
	
		return this.flag < ElementIntermediate ? output.children : output
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
			this.push(this.stack.length ? toChunk(this.stack.pop(), this.stack) : null)
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
	 * @return {string}
	 */
	function toChunk (element, stack) {
		while (element.flag === ElementComponent)
			element = (componentMount(element), element.children)		
	
		var type = element.type
		var children = element.children
		var length = children.length
		var output = ''
	
		switch (element.flag) {
			case ElementPromise:
				return void element.type.then(function (element) {
						toChunk(commitElement(element), stack)
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
	
		return output
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