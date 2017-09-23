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
Stream.prototype = Object.create(Readable.prototype, {_read: {value: getStreamElement}})

/**
 * @return {void}
 */
function getStreamElement () {
	if (this.stack.length > 0)
		readStreamElement(this.stack.pop(), this.host, this.stack, this)
	else
		this.push(null)
}

/**
 * @param {Element} element
 * @param {Element?} host
 * @param {Array} stack
 * @param {Readable} readable
 */
function readStreamElement (element, host, stack, readable) {
	var output = ''

	switch (element.host = host, element.id) {
		case SharedElementComponent:
			return readStreamElement(mountComponent(element), readable.host = element, stack, readable)
		case SharedElementPromise:
			return void element.type.then(function (value) {
				readStreamElement(commitElement(value), host, stack, readable)
			}).catch(function (err) {
				invokeErrorBoundary(element, err, SharedSiteAsync+':'+SharedSiteRender, SharedErrorActive)
			})
		case SharedElementText:
			return writeStreamElement(element.children, readable)
		case SharedElementNode:
			if (element.DOM)
				return element.DOM = writeStreamElement(element.DOM, readable)

			output += '<' + element.type + getStringProps(element, element.props) + '>'
			
			if (getElementType(element.type) === SharedElementEmpty)
				return writeStreamElement(output, readable)
			
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

	writeStreamElement(output, readable)
}

/**
 * @param {string} output
 * @param {Readable} readable
 */
function writeStreamElement (output, readable) {
	readable.push(output)

	if (!output)
		readable.read(0)
}
