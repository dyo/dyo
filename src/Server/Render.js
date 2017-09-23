/**
 * @param {*} subject
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToString (subject, target, callback) {
	if (!target || !target.writable)
		return commitElement(subject).toString()
	else
		setHeader(target)
	
	return target.end(commitElement(subject).toString(), 'utf8', callback)
}

/**
 * @param {*} subject
 * @param {Writable?} target
 * @param {function=} callback
 */
function renderToStream (subject, target, callback) {
	if (!target || !target.writable)
		return commitElement(subject).toStream()
	else
		setHeader(target)
	
	return commitElement(subject).toStream(callback).pipe(target)
}
