/**
 * @param {*} subject
 * @param {Stream?} target
 * @param {function?} callback
 */
return function (subject, target, callback) {
	if (!target || !target.writable)
		return render(subject, target, callback)

	var readable = new Stream(element)

	if (typeof target.getHeader === 'function' && !target.getHeader('Content-Type'))
		target.setHeader('Content-Type', 'text/html')

	if (typeof callback === 'function')
		readable.on('end', callback)

	return readable.pipe(target), readable
}
