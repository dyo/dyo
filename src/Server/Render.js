/**
 * @param {*} element
 * @param {Writable?} container
 * @param {function=} callback
 */
function renderToString (element, container, callback) {
	if (!container || !container.writable)
		return getElementDefinition(element).toString()
	else
		setHeader(container)

	return container.end(getElementDefinition(element).toString(), 'utf8', callback)
}

/**
 * @param {*} element
 * @param {Writable?} container
 * @param {function=} callback
 */
function renderToNodeStream (element, container, callback) {
	if (!container || !container.writable)
		return getElementDefinition(element).toStream()
	else
		setHeader(container)

	return getElementDefinition(element).toStream(callback).pipe(container)
}

Object.defineProperties(Element.prototype, {
	toJSON: {value: toJSON},
	toString: {value: toString},
	toStream: {value: toStream}
})

exports.renderToString = renderToString
exports.renderToNodeStream = renderToNodeStream

