/**
 * @param {*} subject
 * @param {Stream?} container
 * @param {function?} callback
 */
if (!global.document)
	namespace.render = function render (subject, container, callback) {
		if (!container)
			return

		var target = container
		var readable = new Stream(element)

		if (typeof target.getHeader === 'function' && !target.getHeader('Content-Type'))
			target.setHeader('Content-Type', 'text/html')

		if (typeof callback === 'function')
			readable.on('end', callback)

		return readable.pipe(target), readable
	}

