/**
 * @param {*} subject
 * @param {Stream?} target
 * @param {function=} callback
 */
return function (subject, target, callback) {
	if (!target || !target.writable)
		return render(subject, target, callback)

	if (typeof target.getHeader === 'function' && !target.getHeader('Content-Type'))
		target.setHeader('Content-Type', 'text/html')

	commitElement(subject).toStream(callback).pipe(target)
}
