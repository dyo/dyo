/**
 * @param {string|function|object|Element} type
 * @return {function|object}
 */
function createFactory (type) {
	if (type !== null && typeof type === 'object' && !isValidElement(type))
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
