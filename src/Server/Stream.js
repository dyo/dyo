/**
 * @return {Stream}
 */
Element.prototype.chunk = ''
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
	commit: {value: function commit (element, stack, index, done) {
		var type = element.type
		var children = element.children
		var length = children.length
		var output = ''

		while (element.flag === ElementComponent)
			element = componentMount(element)

		switch (element.flag) {
			case ElementText:
				output = escape(element.children)
				break
			case ElementNode:
				output = '<' + (type = element.type) + toProps(element.props) + '>'
				
				if (!length)
					output += bool(type) > 0 ? '</'+type+'>' : ''
			default:
				children.prev.chunk = element.flag !== ElementFragment ? '</'+type+'>' : ''  

				while (length-- > 0)
					stack.push(children = children.prev) 
		}

		return output + element.chunk
	}},
	_read: {value: function read () {
		var stack = this.stack
		var length = stack.length

		if (length === 0)
			return void this.push(null)

		this.push(this.commit(stack.pop(), stack, length-1, false))
	}}
})
