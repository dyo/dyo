/**
 * @param {(string|function|object)} type
 * @return {(function|object)}
 * @public
 */
function createFactory (type) {
	if (type !== null && typeof type === 'object' && !thenable(type))
		return factory(module, type)

	return createElement.bind(null, type)
}

/**
 * @param {string} type
 * @param {function} value
 * @return {function}
 */
function getFactory (type, value) {
	if (!exports)
		return value

	if (typeof exports[type] === 'function')
		return exports[type].bind(exports)

	return exports[type] = value
}
