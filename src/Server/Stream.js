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
