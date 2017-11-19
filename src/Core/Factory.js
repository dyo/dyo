/**
 * @param {string|function|Object|Element} type
 * @return {function|Object}
 */
function createFactory (type) {
	if (typeof type === 'object' && type !== null && !isValidElement(type))
		return factory(window, type, require)

	return createElementFactory(type)
}

/**
 * @param {string|function|Element} type
 * @return {function}
 */
function createElementFactory (type) {
	return createElement.bind(null, type)
}

/**
 * @param {Object?} type
 * @param {function} value
 * @return {function}
 */
function createClientFactory (type, value) {
	if (!config)
		return value

	if (typeof config[type] !== 'function')
		config[type] = value

	return config[type]
}
