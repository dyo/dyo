/**
 * @param {*} element
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToString (element, target, callback) {
	if (!target || !target.writable)
		return getElementDefinition(element).toString()
	else
		setResponseHeader(target)
	
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
		setResponseHeader(target)
	
	return getElementDefinition(element).toStream(callback).pipe(target)
}
