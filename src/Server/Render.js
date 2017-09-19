/**
 * @param {*} subject
 * @param {Stream?} target
 * @param {function=} callback
 */
function renderToString (subject, target, callback) {
	if (!target || !target.writable)
		return commitElement(subject).toString()

	setHeader(target)
	target.end(commitElement(subject).toString(), 'utf8', callback)
}

/**
 * @param {*} subject
 * @param {Stream?} target
 * @param {function=} callback
 */
function renderToStream (subject, target, callback) {
	if (!target || !target.writable)
		return commitElement(subject).toStream()

	setHeader(target)
	commitElement(subject).toStream(callback).pipe(target)
}
