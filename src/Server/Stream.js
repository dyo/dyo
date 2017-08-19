/**
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
	var type = element.type
	var children = element.children
	var length = children.length
	var output = ''

	while (element.flag === ElementComponent)
		element = componentMount(element)

	switch (element.flag) {
		case ElementText:
			output = escapeText(element.children)
			break
		case ElementNode:
			output = '<' + (type = element.type) + toProps(element.props) + '>'
				
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

	return output + element.chunk
}

/**
 * @constructor
 * @param {Element}
 */
function Stream (element) {
	this.stack = [commitElement(element)]
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
		var stack = this.stack
		var length = stack.length

		if (length === 0)
			return void this.push(null)

		this.push(toChunk(stack.pop(), stack))
	}}
})
