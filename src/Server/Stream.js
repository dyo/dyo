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
Stream.prototype = Object.create(Readable.prototype, {_read: {value: read}})

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
function write (element, stack) {
	while (element.flag === ElementComponent)
		element = (componentMount(element), element.children)		

	var type = element.type
	var children = element.children
	var length = children.length
	var output = ''

	switch (element.flag) {
		case ElementPromise:
			return void element.type.then(function (element) {
					write(commitElement(element), stack)
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
 * @return {void}
 */
function read () {
	this.push(this.stack.length ? write(this.stack.pop(), this.stack) : null)
}
