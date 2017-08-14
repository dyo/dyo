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
