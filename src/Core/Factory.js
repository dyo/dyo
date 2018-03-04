/**
 * @param {string|function|Element|Object} type
 * @return {function|Object}
 */
function createFactory (type) {
	if (type !== null && typeof type === 'object' && !isValidElement(type))
		return factory(window, type, require)

	return createElement.bind(null, type)
}

/**
 * @param {string} type
 * @param {function} value
 * @return {function}
 */
function getFactory (type, value) {
	if (!config)
		return value

	if (typeof config[type] === 'function')
		return config[type].bind(config)

	return config[type] = value
}
