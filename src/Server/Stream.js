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
			setStreamChunk(this.stack.pop(), this.stack, this)
		else
			this.push(null)
	}}
})

/**
 * @param {Element} element
 * @param {Array} stack
 * @param {Writable} writable
 * @return {string}
 */
function setStreamChunk (element, stack, writable) {
	while (element.id === SharedElementComponent)
		element = mountComponent(element)

	var id = element.id
	var type = element.type
	var children = element.children
	var length = children.length
	var output = ''

	switch (id) {
		case SharedElementPromise:
			return void element.type.then(function (element) {
				setStreamChunk(commitElement(element), stack, writable)
			})
		case SharedElementText:
			output = getTextEscape(children)
			break
		case SharedElementNode:
			output = '<' + type + getStringProps(element, element.props) + '>'
			
			if (getElementType(type) === SharedElementEmpty)
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
			if (id === SharedElementNode)
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
