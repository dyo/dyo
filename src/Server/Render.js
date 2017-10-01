/**
 * @param {*} element
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToString (element, target, callback) {
	if (!target || !target.writable)
		return getElementDefinition(element).toString()
	else
		setHeader(target)

	return target.end(getElementDefinition(element).toString(), 'utf8', callback)
}

/**
 * @param {*} element
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToNodeStream (element, target, callback) {
	if (!target || !target.writable)
		return getElementDefinition(element).toStream()
	else
		setHeader(target)

	return getElementDefinition(element).toStream(callback).pipe(target)
}

Object.defineProperties(Element.prototype, {
	toJSON: {value: toJSON},
	toString: {value: toString},
	toStream: {value: toStream}
})

exports.renderToString = renderToString
exports.renderToNodeStream = renderToNodeStream

