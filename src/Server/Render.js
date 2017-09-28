/**
 * @param {*} element
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToString (element, target, callback) {
	if (!target || !target.writable)
		return getElementFrom(element).toString()
	else
		setHeader(target)
	
	return target.end(getElementFrom(element).toString(), 'utf8', callback)
}

/**
 * @param {*} element
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToNodeStream (element, target, callback) {
	if (!target || !target.writable)
		return getElementFrom(element).toStream()
	else
		setHeader(target)
	
	return getElementFrom(element).toStream(callback).pipe(target)
}
