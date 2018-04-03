/**
 * @param {any} element
 * @param {Writable?} container
 * @param {function?} callback
 * @return {string?}
 */
function renderToString (element, container, callback) {
	if (!container || !container.writable)
		return getElementDefinition(element).toString()
	else
		container.end(getElementDefinition(element).toString(), 'utf8', (setResponseHeader(container), callback))
}

/**
 * @param {any} element
 * @param {Writable?} container
 * @param {function?} callback
 * @param {Stream?}
 */
function renderToNodeStream (element, container, callback) {
	if (!container || !container.writable)
		return getElementDefinition(element).toStream()
	else
		getElementDefinition(element).toStream(callback).pipe((setResponseHeader(container), container))
}

