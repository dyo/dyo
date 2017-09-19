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
	this.host = null
	this.stack = [element]

	Readable.call(this)
}
/**
 * @type {Object}
 */
Stream.prototype = Object.create(Readable.prototype, {
	/**
	 * @param {Element} element
	 * @param {Element?} host
	 * @param {Array} stack
	 * @param {Writable} writable
	 */
	write: {value: function write (element, host, stack, writable) {
		var output = ''

		switch (element.host = host, element.id) {
			case SharedElementComponent:
				return write(mountComponent(element), writable.host = element, stack, writable)
			case SharedElementPromise:
				return void element.type.then(function (value) {
					write(commitElement(value), host, stack, writable)
				})
			case SharedElementText:
				return void writable.push(element.children)
			case SharedElementNode:
				if (element.DOM)
					return element.DOM = void writable.push(element.DOM)

				var output = '<' + element.type + getStringProps(element, element.props) + '>'
				
				if (getElementType(element.type) === SharedElementEmpty)
					return void writable.push(output)
				
				if (element.DOM)
					output += element.DOM

				element.DOM = '</' + element.type + '>'
				stack.push(element)
			default:
				var children = element.children
				var length = children.length

				while (length-- > 0)
					stack.push(children = children.prev)
		}

		writable.push(output)
	}},
	/**
	 * @return {void}
	 */
	_read: {value: function read () {
		if (this.stack.length > 0)
			this.write(this.stack.pop(), this.host, this.stack, this)
		else
			this.push(null)
	}}
})
