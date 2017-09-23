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
 * @param {Array} stack
 * @param {Readable} readable
 * @param {number} id
 * @param {number} signature
 */
function pendingStreamElement (element, stack, readable, id, signature) {
	return function (value) {
		var children

		if (signature !== SharedErrorActive)
			children = invokeErrorBoundary(element, value, SharedSiteAsync+':'+SharedSiteSetState, SharedErrorActive)
		else if (id !== SharedElementComponent)
			children = commitElement(value)
		else
			children = getComponentElement(element, (element.instance.state = value || {}, element.instance))

		readStreamElement(children, element, stack, readable)
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
			children = mountComponent(readable.host = element)

			if (element.state.constructor !== Promise)
				return readStreamElement(children, element, stack, readable)

			return void element.state
				.then(pendingStreamElement(element, stack, readable, SharedElementComponent, SharedErrorActive))
				.catch(pendingStreamElement(element, stack, readable, SharedElementComponent, SharedErrorPassive))
		case SharedElementPromise:
		return void element.type
			.then(pendingStreamElement(element, stack, readable, SharedElementPromise, SharedErrorActive))
			.catch(pendingStreamElement(element, stack, readable, SharedElementPromise, SharedErrorPassive))
		case SharedElementText:
			return writeStreamElement(children, readable)
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
