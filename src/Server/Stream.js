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
