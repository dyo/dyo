/**
 * @type {constructor}
 */
var Readable = require && require('stream').Readable

/**
 * @param {function=}
 * @return {Stream}
 */
function toStream (callback) {
	var readable = new Stream(this)

	switch (typeof callback) {
		case 'function':
			readable.on('end', callback)
			break
		case 'string':
			readable.setEncoding(callback)
			break
		default:
			readable.setEncoding('utf8')
	}

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
 * @param {Element} host
 * @param {Array} stack
 * @param {Readable} readable
 * @param {number} id
 * @param {number} signature
 */
function pendingStreamElement (element, host, stack, readable, id, signature) {
	return function (value) {
		var children

		if (signature !== SharedErrorActive)
			children = invokeErrorBoundary(element, value, SharedSiteAsync+':'+SharedSiteSetState, SharedErrorActive)
		else if (id !== SharedElementComponent)
			children = getElementDefinition(value)
		else
			children = getComponentChildren(element, (element.instance.state = value || {}, element.instance))

		readStreamElement(children, host, stack, readable)
	}
}

/**
 * @param {Element} element
 * @param {Element?} host
 * @param {Array} stack
 * @param {Readable} readable
 */
function readStreamElement (element, host, stack, readable) {
	var output = ''
	var children = element.children

	switch (element.host = host, element.id) {
		case SharedElementComponent:
			children = mountComponentElement(readable.host = element)

			if (!element.state || element.state.constructor !== Promise)
				return readStreamElement(children, element, stack, readable)

			return void element.state
				.then(pendingStreamElement(element, element, stack, readable, SharedElementComponent, SharedErrorActive))
				.catch(pendingStreamElement(element, element, stack, readable, SharedElementComponent, SharedErrorPassive))
		case SharedElementPromise:
			return void element.type
				.then(pendingStreamElement(element, host, stack, readable, SharedElementPromise, SharedErrorActive))
				.catch(pendingStreamElement(element, host, stack, readable, SharedElementPromise, SharedErrorPassive))
		case SharedElementText:
		case SharedElementEmpty:
			return writeStreamElement(getTextEscape(children), readable)
		case SharedElementNode:
			if (element.DOM)
				return element.DOM = writeStreamElement(element.DOM, readable)

			output += '<' + element.type + getStringProps(element, element.props) + '>'

			if (isVoidType(element.type))
				return writeStreamElement(output, readable)

			element.DOM = (element.DOM || '') + '</' + element.type + '>'

			stack.push(element)
		default:
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
	readable.push(output, 'utf8')

	if (!output)
		readable.read(0)
}
