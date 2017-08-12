/**
 * @param {Object} destination
 * @param {Object} source
 */
function merge (destination, source) {
	for (var key in source)
		destination[key] = source[key]
}

/**
 * @param {Object} destination
 * @param {Object} source
 * @param {Object} delta
 * @return {Object}
 */
function assign (destination, source, delta) {
	for (var key in source)
		destination[key] = source[key]
	
	for (var key in delta)
		destination[key] = delta[key]

	return destination
}

/**
 * @param {function} callback
 */
function setImmediate (callback) {
	requestAnimationFrame(callback, 16)
}

/**
 * @param {Object} obj
 * @param {string} name
 * @param {Object} value
 * @return {boolean}
 */
function dangerouslySetInnerHTML (obj, name, value) {
	return !obj[name] || obj[name].__html !== value.__html 
}
