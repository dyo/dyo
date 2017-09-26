/**
 * @param {*} element
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToString (element, target, callback) {
	if (!target || !target.writable)
		return commitElement(element).toString()
	else
		setHeader(target)
	
	return target.end(commitElement(element).toString(), 'utf8', callback)
}

/**
 * @param {*} element
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToNodeStream (element, target, callback) {
	if (!target || !target.writable)
		return commitElement(element).toStream()
	else
		setHeader(target)
	
	return commitElement(element).toStream(callback).pipe(target)
}
